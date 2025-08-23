// orderController.js

const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Voucher = require('../models/Voucher');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const User = require('../models/User'); // Add this import to fetch user details
const { sendEmail } = require('../services/emailService'); // Add this import assuming emailService.js is in services folder

const GHNService = require('../services/ghnService');
const Store = require('../models/Store');
const Address = require('../models/Address');
const { getStoreFromDistrict } = require('../services/storeService');

// Utility function to sync order status based on its items
const syncOrderStatus = async (orderId) => {
  try {
    console.log(`Syncing status for order ${orderId}...`);

    // Get all order items for this order
    const orderItems = await OrderItem.find({ orderId });

    // If no items found, return early
    if (!orderItems || orderItems.length === 0) {
      console.log(`No order items found for order ${orderId}`);
      return false;
    }

    console.log(`Found ${orderItems.length} items for order ${orderId}`);

    // Check each item's status
    const itemStatuses = orderItems.map(item => ({
      id: item._id,
      status: item.status
    }));
    console.log('Item statuses:', JSON.stringify(itemStatuses));

    // Get current order
    const order = await Order.findById(orderId);
    if (!order) {
      console.log(`Order ${orderId} not found`);
      return false;
    }

    // Determine order status based on item statuses
    let newOrderStatus = order.status;

    // Priority order: delivered > shipped > out_for_delivery > in_transit > shipping > processing > rejected > failed > returned > cancelled > pending
    
    // Check if any item is delivered
    if (orderItems.some(item => item.status === 'delivered')) {
      newOrderStatus = 'delivered';
    }
    // Check if all items are shipped
    else if (orderItems.every(item => item.status === 'shipped')) {
      newOrderStatus = 'shipped';
    }
    // Check if any item is out for delivery
    else if (orderItems.some(item => item.status === 'out_for_delivery')) {
      newOrderStatus = 'out_for_delivery';
    }
    // Check if any item is in transit
    else if (orderItems.some(item => item.status === 'in_transit')) {
      newOrderStatus = 'in_transit';
    }
    // Check if any item is shipping
    else if (orderItems.some(item => item.status === 'shipping')) {
      newOrderStatus = 'shipping';
    }
    // Check if any item is processing
    else if (orderItems.some(item => item.status === 'processing')) {
      newOrderStatus = 'processing';
    }
    // Check if any item is rejected
    else if (orderItems.some(item => item.status === 'rejected')) {
      newOrderStatus = 'rejected';
    }
    // Check if any item failed
    else if (orderItems.some(item => item.status === 'failed')) {
      newOrderStatus = 'failed';
    }
    // Check if any item is returned
    else if (orderItems.some(item => item.status === 'returned')) {
      newOrderStatus = 'returned';
    }
    // Check if any item is cancelled
    else if (orderItems.some(item => item.status === 'cancelled')) {
      newOrderStatus = 'cancelled';
    }
    // Default to pending if all items are pending
    else if (orderItems.every(item => item.status === 'pending')) {
      newOrderStatus = 'pending';
    }

    console.log(`Current order status: ${order.status}, New status: ${newOrderStatus}`);

    // Update order status if it changed
    if (order.status !== newOrderStatus) {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: newOrderStatus },
        { new: true }
      );
      console.log(`Order status updated successfully: ${updatedOrder.status}`);
      return true;
    } else {
      console.log('Order status unchanged');
      return false;
    }
  } catch (error) {
    console.error('Error syncing order status:', error);
    return false;
  }
};

const createOrder = async (req, res) => {
  const { selectedItems, selectedAddressId, couponCode } = req.body;
  const buyerId = req.user.id;

  if (!selectedAddressId || !selectedItems || selectedItems.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: address or items' });
  }

  try {
    // Fetch buyer details
    const buyer = await User.findById(buyerId);
    if (!buyer || !buyer.email) {
      return res.status(400).json({ error: 'Buyer email not found' });
    }
    const buyerEmail = buyer.email;

    // Step 1: Calculate subtotal & validate inventory
    let subtotal = 0;
    const productDetails = {};

    for (const item of selectedItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      let inventory = await Inventory.findOne({ productId: item.productId });
      if (!inventory) {
        inventory = new Inventory({ productId: item.productId, quantity: 0 });
        await inventory.save();
      }

      if (inventory.quantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient inventory for product ${product.title} (ID: ${item.productId}). Available: ${inventory.quantity}, Requested: ${item.quantity}`
        });
      }

      const unitPrice = product.price;
      subtotal += unitPrice * item.quantity;
      productDetails[item.productId] = { unitPrice };
    }

    // Step 2: Apply voucher if provided
    let discount = 0;
    if (couponCode) {
      const voucher = await Voucher.findOne({ code: couponCode });
      if (!voucher || !voucher.isActive) {
        return res.status(400).json({ error: 'Invalid or inactive voucher' });
      }
      if (subtotal < voucher.minOrderValue) {
        return res.status(400).json({ error: `Order must be at least ${voucher.minOrderValue} to apply this voucher` });
      }

      if (voucher.discountType === 'fixed') {
        discount = voucher.discount;
      } else if (voucher.discountType === 'percentage') {
        const calculatedDiscount = (subtotal * voucher.discount) / 100;
        discount = voucher.maxDiscount > 0 ? Math.min(calculatedDiscount, voucher.maxDiscount) : calculatedDiscount;
      }

      voucher.usedCount += 1;
      await voucher.save();
    }

    // Step 3: Calculate shipping fee
    const address = await Address.findById(selectedAddressId);
    if (!address || !address.locationGHN) {
      return res.status(400).json({ error: 'Invalid shipping address' });
    }

    let shippingFee = 0;
    const ghn = new GHNService(process.env.GHN_TOKEN, process.env.GHN_SHOP_ID);

    for (const item of selectedItems) {
      const product = await Product.findById(item.productId);
      const fromDistrictId = await getStoreFromDistrict(product);

      if (fromDistrictId) {
        const feeRes = await ghn.calculateShippingFee({
          from_district_id: fromDistrictId,
          to_district_id: address.locationGHN.district_id,
          to_ward_code: address.locationGHN.ward_code,
          service_type_id: 2,
          weight: 1000, // giữ nguyên như FE
          insurance_value: 500000,
        });

        shippingFee += feeRes?.data?.total || 0;
      }
    }

    // Step 4: Calculate total
    const totalPrice = Math.max(subtotal - discount, 0) + shippingFee;

    // Step 5: Create Order
    const order = new Order({
      buyerId,
      addressId: selectedAddressId,
      subtotal,
      discount,
      shippingFee,
      totalPrice,
      status: 'pending',
    });
    await order.save();

    // Step 6: Create OrderItems & update inventory
    for (const item of selectedItems) {
      const orderItem = new OrderItem({
        orderId: order._id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: productDetails[item.productId].unitPrice,
        status: 'pending',
      });
      await orderItem.save();

      await Inventory.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { quantity: -item.quantity }, $set: { lastUpdated: new Date() } },
        { upsert: false }
      );
    }

    // Step 7: Gửi email thông báo
    try {
      const emailSubject = 'Payment Successful and Order Confirmation';
      const emailText = `Dear Customer,\n\nYour order has been placed successfully.\nOrder ID: ${order._id}\nTotal Amount: ${totalPrice}\nShipping Fee: ${shippingFee}\n\nThank you for shopping with us!`;
      await sendEmail(buyerEmail, emailSubject, emailText);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    return res.status(201).json({
      message: 'Order placed successfully',
      orderId: order._id,
      subtotal,
      discount,
      shippingFee,
      totalPrice,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Get order history for current buyer
const getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { buyerId };
    if (status && ['pending', 'processing', 'shipping', 'in_transit', 'out_for_delivery', 'delivered', 'shipped', 'failed', 'rejected', 'cancelled', 'returned'].includes(status)) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Find orders with populated address
    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('addressId')
      .lean();

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    // Before returning results, check and update each order's status
    console.log(`Checking status for ${orders.length} orders`);

    // For each order, check if status needs updating and fetch items
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        // Check and update order status
        await syncOrderStatus(order._id);

        // Get the order with potentially updated status
        const updatedOrder = await Order.findById(order._id).lean();

        // Get order items with product details
        const items = await OrderItem.find({ orderId: order._id })
          .populate({
            path: 'productId',
            select: 'title image price description'
          })
          .lean();

        return { ...updatedOrder, items };
      })
    );

    return res.status(200).json({
      orders: ordersWithItems,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Get single order details
const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const buyerId = req.user.id;

    // First check and update the order status
    console.log(`Checking status for order ${orderId} before returning details`);
    await syncOrderStatus(orderId);

    // Find order and verify it belongs to the current buyer
    const order = await Order.findOne({ _id: orderId, buyerId })
      .populate('addressId')
      .lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }

    // Get order items with product details
    const items = await OrderItem.find({ orderId })
      .populate({
        path: 'productId',
        select: 'title image price description'
      })
      .lean();

    return res.status(200).json({
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Update status of an order item
const updateOrderItemStatus = async (req, res) => {
  try {
    const { id } = req.params; // Order item ID
    const { status } = req.body;

    console.log(`Updating order item ${id} status to ${status}`);

    // Validate status
    if (!status || !['pending', 'processing', 'shipping', 'in_transit', 'out_for_delivery', 'delivered', 'shipped', 'failed', 'rejected', 'cancelled', 'returned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Find the order item first to get orderId
    const orderItem = await OrderItem.findById(id);
    if (!orderItem) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    // Store orderId for later use
    const orderId = orderItem.orderId;
    console.log(`Order item belongs to order ${orderId}`);

    // Update the order item
    const updatedOrderItem = await OrderItem.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    ).populate('productId', 'title');

    console.log(`Successfully updated status of order item for ${updatedOrderItem.productId?.title || 'unknown product'}`);

    // If status is 'shipped', check if all items in the order are shipped
    if (status === 'shipped') {
      console.log('Checking if all items in the order are now shipped');
      const orderStatusUpdated = await syncOrderStatus(orderId);
      console.log(`Order status was ${orderStatusUpdated ? 'updated' : 'not updated'}`);
    }

    return res.status(200).json({
      message: 'Order item status updated successfully',
      orderItem: updatedOrderItem
    });
  } catch (error) {
    console.error('Error updating order item status:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Cancel order (for payment timeout)
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const buyerId = req.user.id;

    // Find order and verify it belongs to the current buyer
    const order = await Order.findOne({ _id: orderId, buyerId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }

    // Check if order can be cancelled (only pending orders)
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order cannot be cancelled. Only pending orders can be cancelled.' });
    }

    // Update order status to cancelled
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'cancelled' },
      { new: true }
    );

    // Update all order items to cancelled
    await OrderItem.updateMany(
      { orderId },
      { status: 'cancelled' }
    );

    // Restore inventory for all items in the order
    const orderItems = await OrderItem.find({ orderId });
    for (const item of orderItems) {
      const inventory = await Inventory.findOne({ productId: item.productId });
      if (inventory) {
        inventory.quantity += item.quantity;
        await inventory.save();
      }
    }

    

    return res.status(200).json({
      message: 'Order cancelled successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

module.exports = { createOrder, getBuyerOrders, getOrderDetails, updateOrderItemStatus, cancelOrder, syncOrderStatus };