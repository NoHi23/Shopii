const ShippingInfo = require("../models/ShippingInfo");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Tạo mã vận đơn mới
exports.createTrackingNumber = async (req, res) => {
  try {
    const { orderItemId } = req.body;
    
    // Kiểm tra orderItem có tồn tại không
    const orderItem = await OrderItem.findById(orderItemId)
      .populate({
        path: 'productId',
        select: 'sellerId title'
      });
    
    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Order item not found"
      });
    }
    
    // Kiểm tra quyền (seller chỉ có thể tạo tracking cho sản phẩm của mình)
    if (orderItem.productId.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create tracking for this order"
      });
    }
    
    // Kiểm tra xem đã có shipping info chưa
    const existingShippingInfo = await ShippingInfo.findOne({ orderItemId });
    if (existingShippingInfo) {
      return res.status(400).json({
        success: false,
        message: "Tracking number already exists for this order item"
      });
    }
    
    // Tạo mã vận đơn giả lập
    const trackingNumber = generateTrackingNumber();
    
    // Tạo shipping info mới
    const shippingInfo = new ShippingInfo({
      orderItemId,
      trackingNumber,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await shippingInfo.save();
    
    // Cập nhật trạng thái order item
    orderItem.status = "processing";
    await orderItem.save();
    
    // Sync order status based on all items
    const { syncOrderStatus } = require('./orderController');
    await syncOrderStatus(orderItem.orderId);
    
    res.json({
      success: true,
      message: "Tracking number created successfully",
      data: {
        trackingNumber,
        shippingInfo,
        orderItem
      }
    });
    
  } catch (error) {
    console.error("Error creating tracking number:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cập nhật trạng thái vận chuyển
exports.updateShippingStatus = async (req, res) => {
  try {
    const { shippingInfoId } = req.params;
    const { status, location, notes } = req.body;
    
    // Validate status
    const validStatuses = [
      "pending",
      "processing", 
      "shipping",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "failed",
      "returned"
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }
    
    // Tìm shipping info
    const shippingInfo = await ShippingInfo.findById(shippingInfoId)
      .populate({
        path: 'orderItemId',
        populate: {
          path: 'productId',
          select: 'sellerId title'
        }
      });
    
    if (!shippingInfo) {
      return res.status(404).json({
        success: false,
        message: "Shipping info not found"
      });
    }
    
    // Kiểm tra quyền
    if (shippingInfo.orderItemId.productId.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this shipping info"
      });
    }
    
    // Cập nhật shipping info
    shippingInfo.status = status;
    if (location) shippingInfo.location = location;
    if (notes) shippingInfo.notes = notes;
    shippingInfo.updatedAt = new Date();
    
    // Thêm vào lịch sử trạng thái
    if (!shippingInfo.statusHistory) {
      shippingInfo.statusHistory = [];
    }
    
    shippingInfo.statusHistory.push({
      status,
      location,
      notes,
      timestamp: new Date()
    });
    
    await shippingInfo.save();
    
    // Cập nhật trạng thái order item tương ứng
    const orderItem = shippingInfo.orderItemId;
    let orderItemStatus;
    
    switch(status) {
      case "pending":
      case "processing":
        orderItemStatus = "processing";
        break;
      case "shipping":
      case "in_transit":
      case "out_for_delivery":
        orderItemStatus = "shipping";
        break;
      case "delivered":
        orderItemStatus = "delivered";
        break;
      case "failed":
        orderItemStatus = "failed";
        break;
      case "returned":
        orderItemStatus = "returned";
        break;
      default:
        orderItemStatus = orderItem.status;
    }
    
    orderItem.status = orderItemStatus;
    await orderItem.save();
    
    // Sync order status based on all items
    const { syncOrderStatus } = require('./orderController');
    await syncOrderStatus(orderItem.orderId);
    
    res.json({
      success: true,
      message: "Shipping status updated successfully",
      data: {
        shippingInfo,
        orderItem
      }
    });
    
  } catch (error) {
    console.error("Error updating shipping status:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy thông tin vận chuyển theo tracking number
exports.getTrackingInfo = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    const shippingInfo = await ShippingInfo.findOne({ trackingNumber })
      .populate({
        path: 'orderItemId',
        populate: [
          {
            path: 'orderId',
            populate: {
              path: 'buyerId',
              select: 'username fullname email'
            }
          },
          {
            path: 'productId',
            select: 'title image'
          }
        ]
      });
    
    if (!shippingInfo) {
      return res.status(404).json({
        success: false,
        message: "Tracking number not found"
      });
    }
    
    res.json({
      success: true,
      data: shippingInfo
    });
    
  } catch (error) {
    console.error("Error getting tracking info:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy danh sách vận chuyển của seller
exports.getSellerShipments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    // Lấy tất cả sản phẩm của seller
    const products = await Product.find({ sellerId: req.user.id }, "_id");
    const productIds = products.map(p => p._id);
    
    // Lấy order items của các sản phẩm đó
    const orderItems = await OrderItem.find({ productId: { $in: productIds } }, "_id");
    const orderItemIds = orderItems.map(item => item._id);
    
    // Tạo filter cho shipping info
    let filter = { orderItemId: { $in: orderItemIds } };
    if (status) {
      filter.status = status;
    }
    
    // Lấy shipping info với populate
    const shippingInfos = await ShippingInfo.find(filter)
      .populate({
        path: 'orderItemId',
        populate: [
          {
            path: 'orderId',
            populate: {
              path: 'buyerId',
              select: 'username fullname email'
            }
          },
          {
            path: 'productId',
            select: 'title image price'
          }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Đếm tổng số
    const total = await ShippingInfo.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        shipments: shippingInfos,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total
        }
      }
    });
    
  } catch (error) {
    console.error("Error getting seller shipments:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy danh sách order items của seller để chọn tạo tracking
exports.getSellerOrderItems = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    
    // Lấy tất cả sản phẩm của seller
    const products = await Product.find({ sellerId: req.user.id }, "_id");
    const productIds = products.map(p => p._id);
    
    // Tạo filter cho order items
    let filter = { productId: { $in: productIds } };
    if (status) {
      filter.status = status;
    }
    
    // Lấy order items với populate
    const orderItems = await OrderItem.find(filter)
      .populate({
        path: 'orderId',
        populate: {
          path: 'buyerId',
          select: 'username fullname email'
        }
      })
      .populate({
        path: 'productId',
        select: 'title image price'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Kiểm tra xem order item đã có shipping info chưa
    const orderItemIds = orderItems.map(item => item._id);
    const existingShippingInfos = await ShippingInfo.find({ 
      orderItemId: { $in: orderItemIds } 
    });
    
    const shippingInfoMap = {};
    existingShippingInfos.forEach(info => {
      shippingInfoMap[info.orderItemId.toString()] = info;
    });
    
    // Thêm thông tin shipping vào order items
    const orderItemsWithShipping = orderItems.map(item => ({
      ...item.toObject(),
      hasShippingInfo: !!shippingInfoMap[item._id.toString()],
      shippingInfo: shippingInfoMap[item._id.toString()] || null
    }));
    
    // Đếm tổng số
    const total = await OrderItem.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        orderItems: orderItemsWithShipping,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total
        }
      }
    });
    
  } catch (error) {
    console.error("Error getting seller order items:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Tạo mã vận đơn ngẫu nhiên
function generateTrackingNumber() {
  const prefix = "SHOPII";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

// Reset trạng thái đơn hàng từ cancelled về pending (cho test)
exports.resetCancelledOrders = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm của seller
    const products = await Product.find({ sellerId: req.user.id }, "_id");
    const productIds = products.map(p => p._id);
    
    // Tìm order items cancelled của seller
    const cancelledOrderItems = await OrderItem.find({
      productId: { $in: productIds },
      status: 'cancelled'
    });
    
    if (cancelledOrderItems.length === 0) {
      return res.json({
        success: true,
        message: "Không có order items nào bị cancelled",
        data: { resetCount: 0 }
      });
    }
    
    // Reset trạng thái về pending
    const orderItemIds = cancelledOrderItems.map(item => item._id);
    await OrderItem.updateMany(
      { _id: { $in: orderItemIds } },
      { status: 'pending' }
    );
    
    // Reset trạng thái order tương ứng
    const orderIds = [...new Set(cancelledOrderItems.map(item => item.orderId))];
    await Order.updateMany(
      { _id: { $in: orderIds }, status: 'cancelled' },
      { status: 'pending' }
    );
    
    res.json({
      success: true,
      message: `Đã reset ${cancelledOrderItems.length} order items từ cancelled về pending`,
      data: { 
        resetCount: cancelledOrderItems.length,
        orderItemIds: orderItemIds
      }
    });
    
  } catch (error) {
    console.error("Error resetting cancelled orders:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy thống kê vận chuyển của seller
exports.getShippingStats = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm của seller
    const products = await Product.find({ sellerId: req.user.id }, "_id");
    const productIds = products.map(p => p._id);
    
    // Lấy order items của các sản phẩm đó
    const orderItems = await OrderItem.find({ productId: { $in: productIds } }, "_id");
    const orderItemIds = orderItems.map(item => item._id);
    
    // Thống kê theo trạng thái
    const stats = await ShippingInfo.aggregate([
      {
        $match: { orderItemId: { $in: orderItemIds } }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Chuyển đổi thành object
    const statusStats = {};
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });
    
    // Tổng số đơn vận chuyển
    const totalShipments = await ShippingInfo.countDocuments({
      orderItemId: { $in: orderItemIds }
    });
    
    res.json({
      success: true,
      data: {
        totalShipments,
        statusStats,
        summary: {
          pending: statusStats.pending || 0,
          processing: statusStats.processing || 0,
          shipping: statusStats.shipping || 0,
          delivered: statusStats.delivered || 0,
          failed: statusStats.failed || 0,
          returned: statusStats.returned || 0
        }
      }
    });
    
  } catch (error) {
    console.error("Error getting shipping stats:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Debug function to list all shipping info for current seller
exports.debugShippingInfo = async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    // Get all order items for this seller
    const orderItems = await OrderItem.find()
      .populate({
        path: 'productId',
        match: { sellerId: sellerId }
      });
    
    const sellerOrderItems = orderItems.filter(item => item.productId);
    const orderItemIds = sellerOrderItems.map(item => item._id);
    
    // Get all shipping info for these order items
    const shippingInfos = await ShippingInfo.find({
      orderItemId: { $in: orderItemIds }
    }).populate('orderItemId');
    
    res.json({
      success: true,
      data: {
        totalOrderItems: sellerOrderItems.length,
        totalShippingInfos: shippingInfos.length,
        shippingInfos: shippingInfos.map(info => ({
          _id: info._id,
          orderItemId: info.orderItemId._id,
          trackingNumber: info.trackingNumber,
          status: info.status,
          createdAt: info.createdAt
        }))
      }
    });
    
  } catch (error) {
    console.error("Error debugging shipping info:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
