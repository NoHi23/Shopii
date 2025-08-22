const express = require('express');
const { authMiddleware, isBuyer, isSellerOrBuyer } = require('../middleware/auth.middleware');
const paymentController = require('../controllers/paymentController');
// ... (các controller khác giữ nguyên)
const orderController = require('../controllers/orderController');
const cartController = require('../controllers/cartController');
const addressController = require('../controllers/addressController');
const { getVoucherByCode } = require('../controllers/voucherController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const disputeController = require('../controllers/disputeController');
const userController = require('../controllers/userController');
const returnRequestController = require('../controllers/returnRequestController');

const buyerRouter = express.Router();

// --- SỬA Ở ĐÂY ---
// Public routes for payment callbacks (không yêu cầu xác thực)
// Route phải khớp với cấu hình trong paymentController
buyerRouter.get('/payments/paypal/callback', paymentController.paypalCallback);


// Protected routes (yêu cầu xác thực là buyer)
buyerRouter.use(authMiddleware);

// User role management
buyerRouter.put('/change-role', authController.changeRole);

// Quản lý giỏ hàng
const cartRoutes = express.Router();
cartRoutes.use(isSellerOrBuyer);
cartRoutes.post('/add', cartController.addToCart);
cartRoutes.get('/', cartController.viewCart);
cartRoutes.put('/update/:productId', cartController.updateCartItem);
cartRoutes.delete('/remove/:productId', cartController.deleteCartItem);
cartRoutes.post('/remove-multiple', cartController.removeMultipleItems);
buyerRouter.use('/cart', cartRoutes);

// Address routes
buyerRouter.post('/addresses', addressController.createAddress);
buyerRouter.get('/addresses', addressController.getAddresses);
buyerRouter.put('/addresses/:id', addressController.updateAddress);
buyerRouter.delete('/addresses/:id', addressController.deleteAddress);
buyerRouter.put('/addresses/:id/default', addressController.setDefaultAddress);

// Voucher routes
buyerRouter.get('/vouchers/code/:code', getVoucherByCode);

// Quản lý đơn hàng
const orderRoutes = express.Router();
orderRoutes.use(isBuyer);
orderRoutes.post('/', orderController.createOrder);
orderRoutes.get('/', orderController.getBuyerOrders);
orderRoutes.get('/:id', orderController.getOrderDetails);
orderRoutes.put('/items/:id/status', orderController.updateOrderItemStatus);
orderRoutes.put('/:id/cancel', orderController.cancelOrder);
buyerRouter.use('/orders', orderRoutes);

// Quản lý thanh toán
const paymentRoutes = express.Router();
paymentRoutes.use(isBuyer);
paymentRoutes.post('/', paymentController.createPayment);
paymentRoutes.get('/status/:orderId', paymentController.checkPaymentStatus);
buyerRouter.use('/payments', paymentRoutes);

// ... (các route còn lại giữ nguyên, không cần thay đổi)
// Review routes
const reviewRoutes = express.Router();
reviewRoutes.use(isBuyer);
reviewRoutes.post('/', reviewController.createReview);
reviewRoutes.get('/', reviewController.getBuyerReviews);
reviewRoutes.put('/:id', reviewController.updateReview);
reviewRoutes.delete('/:id', reviewController.deleteReview);
buyerRouter.use('/reviews', reviewRoutes);

// Dispute routes
const disputeRoutes = express.Router();
disputeRoutes.use(isBuyer);
disputeRoutes.get('/eligibility/:orderItemId', disputeController.checkDisputeEligibility);
disputeRoutes.post('/', disputeController.createDispute);
disputeRoutes.get('/', disputeController.getBuyerDisputes);
disputeRoutes.get('/:id', disputeController.getDisputeDetails);
disputeRoutes.put('/:id', disputeController.updateDispute);
disputeRoutes.delete('/:id', disputeController.cancelDispute);
buyerRouter.use('/disputes', disputeRoutes);

// Quản lý yêu cầu đổi/trả hàng
buyerRouter.post('/return-requests', returnRequestController.createReturnRequest);
buyerRouter.get('/return-requests', returnRequestController.getUserReturnRequests);
buyerRouter.get('/return-requests/:id', returnRequestController.getReturnRequestDetail);
buyerRouter.delete('/return-requests/:id', returnRequestController.cancelReturnRequest);

// Quản lý Profile cá nhân
buyerRouter.get("/profile", userController.getProfile);
buyerRouter.put("/profile", userController.updateProfile);


module.exports = buyerRouter;