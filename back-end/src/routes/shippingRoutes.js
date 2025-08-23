const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const { authMiddleware } = require('../middleware/auth.middleware');

// Tạo mã vận đơn mới (chỉ seller)
router.post('/create-tracking', authMiddleware, shippingController.createTrackingNumber);

// Cập nhật trạng thái vận chuyển (chỉ seller)
router.put('/update-status/:shippingInfoId', authMiddleware, shippingController.updateShippingStatus);

// Lấy thông tin vận chuyển theo tracking number (public)
router.get('/track/:trackingNumber', shippingController.getTrackingInfo);

// Lấy danh sách vận chuyển của seller
router.get('/seller-shipments', authMiddleware, shippingController.getSellerShipments);

// Lấy thống kê vận chuyển của seller
router.get('/seller-stats', authMiddleware, shippingController.getShippingStats);

// Lấy danh sách order items của seller để chọn tạo tracking
router.get('/seller-order-items', authMiddleware, shippingController.getSellerOrderItems);

// Reset trạng thái đơn hàng từ cancelled về pending (cho test)
router.post('/reset-cancelled-orders', authMiddleware, shippingController.resetCancelledOrders);

// Debug: Lấy tất cả shipping info của seller (cho debug)
router.get('/debug-shipping-info', authMiddleware, shippingController.debugShippingInfo);

module.exports = router;
