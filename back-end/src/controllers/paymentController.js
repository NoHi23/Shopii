// paymentController.js
// Bỏ require 'axios' và 'crypto' vì không còn dùng cho VietQR/PayOS
const { Payment, Order } = require('../models');
const { updateOrderAfterPayment } = require('../services/paymentVerificationService');
const paypal = require('@paypal/checkout-server-sdk');

// Hàm helper để tạo PayPal client, giữ nguyên
function createPayPalClient() {
  const environment = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);

  return new paypal.core.PayPalHttpClient(environment);
}

/**
 * Tạo yêu cầu thanh toán mới
 */
const createPayment = async (req, res) => {
  try {
    const { orderId, method, replaceExisting } = req.body;
    const userId = req.user.id;

    // Thay đổi: Chỉ cho phép 'COD' và 'PayPal'
    if (!['COD', 'PayPal'].includes(method)) {
      return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ.' });
    }

    // Tìm đơn hàng
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    if (order.buyerId.toString() !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền thanh toán cho đơn hàng này' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Đơn hàng không ở trạng thái có thể thanh toán' });
    }

    // Kiểm tra và xử lý payment đã tồn tại
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      if (replaceExisting) {
        console.log(`Replacing existing payment record for order ${orderId}`);
        await Payment.deleteOne({ _id: existingPayment._id });
      } else {
        return res.status(400).json({ message: 'Đơn hàng này đã có bản ghi thanh toán' });
      }
    }

    // Tạo payment mới
    const payment = new Payment({
      orderId,
      userId,
      amount: order.totalPrice,
      method,
      status: 'pending',
    });

    // Xử lý theo từng phương thức
    if (method === 'COD') {
      await payment.save();
      return res.status(201).json({
        message: 'Đã tạo yêu cầu thanh toán COD thành công',
        payment,
      });
    }

    if (method === 'PayPal') {
      // Lưu payment record trước khi gọi API
      await payment.save();

      try {
        const client = createPayPalClient();
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'USD', // PayPal thường dùng USD, bạn cần quy đổi nếu cần
              value: order.totalPrice.toFixed(2),
            },
            description: `Thanh toán cho đơn hàng #${orderId}`
          }],
          application_context: {
            // Đảm bảo BASE_URL được cấu hình trong file .env
            return_url: `${process.env.BASE_URL}/api/buyers/payments/paypal/callback?success=true&orderId=${orderId}`,
            cancel_url: `${process.env.BASE_URL}/api/buyers/payments/paypal/callback?success=false&orderId=${orderId}`,
          }
        });

        const response = await client.execute(request);

        // Lưu transactionId của PayPal để xử lý ở callback
        payment.transactionId = response.result.id;
        await payment.save();

        // Lấy link thanh toán cho người dùng
        const approvalUrl = response.result.links.find(link => link.rel === 'approve').href;

        return res.status(201).json({
          message: 'Đã tạo yêu cầu thanh toán PayPal thành công',
          payment,
          paymentUrl: approvalUrl
        });

      } catch (apiError) {
        console.error('Lỗi gọi API PayPal:', apiError.message);
        payment.status = 'failed';
        await payment.save();
        return res.status(502).json({ message: 'Lỗi giao tiếp với cổng thanh toán PayPal.' });
      }
    }

  } catch (error) {
    console.error('Lỗi tạo thanh toán:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Nhận callback từ PayPal và cập nhật trạng thái
 */
const paypalCallback = async (req, res) => {
  try {
    const { orderId, success, token, PayerID } = req.query;
    console.log("PayPal callback:", req.query);

    if (!orderId || !token) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reason=missing_params`);
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reason=payment_not_found`);
    }

    // Chỉ warning thay vì fail luôn
    if (payment.transactionId !== token) {
      console.warn(`⚠️ Token mismatch: expected ${payment.transactionId}, got ${token}`);
    }

    if (success === 'true') {
      const client = createPayPalClient();
      const request = new paypal.orders.OrdersCaptureRequest(token);
      request.requestBody({});
      const capture = await client.execute(request);

      console.log("PayPal capture result:", capture.result.status);

      if (['COMPLETED', 'APPROVED'].includes(capture.result.status)) {
        payment.status = 'paid';
        payment.paidAt = new Date();
        await payment.save();
        await updateOrderAfterPayment(payment.orderId);

        return res.redirect(`${process.env.FRONTEND_URL}/payment-result?orderId=${orderId}`);
      }
      payment.status = 'failed';
      await payment.save();
      return res.redirect(`${process.env.FRONTEND_URL}/payment-result?reason=capture_failed`);
    } else {
      payment.status = 'failed';
      await payment.save();
      return res.redirect(`${process.env.FRONTEND_URL}/payment-result?reason=user_cancelled`);
    }
  } catch (error) {
    console.error('Lỗi xử lý PayPal callback:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment-result`);
  }
};


/**
 * Kiểm tra trạng thái thanh toán của đơn hàng (giữ nguyên)
 */
const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin thanh toán' });
    }

    if (payment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xem thông tin thanh toán này' });
    }

    const order = await Order.findById(orderId);

    return res.status(200).json({
      payment: {
        id: payment._id,
        method: payment.method,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
        transactionId: payment.transactionId
      },
      order: order ? {
        id: order._id,
        status: order.status
      } : null
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// Bỏ: vietQRCallback, payosCallback
module.exports = {
  createPayment,
  paypalCallback,
  checkPaymentStatus
};