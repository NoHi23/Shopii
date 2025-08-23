// scheduler.js
const cron = require('node-cron');
const { verifyPendingPayments } = require('../services/paymentVerificationService');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Inventory = require('../models/Inventory');

/**
 * Tự động hủy đơn hàng hết thời gian thanh toán
 */
const cancelExpiredOrders = async () => {
  try {
    console.log('Running scheduled order cancellation task...');
    
    // Tìm các đơn hàng pending được tạo cách đây hơn 30 phút (tăng từ 5 phút)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const expiredOrders = await Order.find({
      status: 'pending',
      createdAt: { $lt: thirtyMinutesAgo }
    });

    console.log(`Found ${expiredOrders.length} expired orders to cancel`);

    for (const order of expiredOrders) {
      try {
        // Kiểm tra xem có payment nào đang pending không
        const Payment = require('../models/Payment');
        const pendingPayment = await Payment.findOne({
          orderId: order._id,
          status: { $in: ['pending', 'processing'] }
        });

        // Nếu có payment đang pending, bỏ qua đơn hàng này
        if (pendingPayment) {
          console.log(`Skipping order ${order._id} - has pending payment`);
          continue;
        }

        // Cập nhật trạng thái đơn hàng thành cancelled
        await Order.findByIdAndUpdate(order._id, { status: 'cancelled' });

        // Cập nhật trạng thái tất cả order items thành cancelled
        await OrderItem.updateMany(
          { orderId: order._id },
          { status: 'cancelled' }
        );

        // Khôi phục inventory cho tất cả sản phẩm trong đơn hàng
        const orderItems = await OrderItem.find({ orderId: order._id });
        for (const item of orderItems) {
          const inventory = await Inventory.findOne({ productId: item.productId });
          if (inventory) {
            inventory.quantity += item.quantity;
            await inventory.save();
          }
        }

        console.log(`Successfully cancelled order ${order._id}`);
      } catch (error) {
        console.error(`Error cancelling order ${order._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in cancelExpiredOrders:', error);
  }
};

/**
 * Khởi tạo tất cả các công việc định kỳ
 */
const initScheduler = () => {
  // Kiểm tra các thanh toán đang chờ mỗi 5 phút
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running scheduled payment verification task...');
    await verifyPendingPayments();
  });

  // Tự động hủy đơn hàng hết thời gian thanh toán mỗi 2 phút
  cron.schedule('*/2 * * * *', async () => {
    await cancelExpiredOrders();
  });
  
  console.log('Payment verification and order cancellation schedulers initialized');
};

module.exports = {
  initScheduler
}; 