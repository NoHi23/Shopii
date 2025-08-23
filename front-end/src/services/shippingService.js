import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999';

/**
 * Tạo mã vận đơn mới
 * @param {String} orderItemId - ID của OrderItem
 * @param {String} token - JWT token
 * @returns {Promise}
 */
export const createTrackingNumber = async (orderItemId, token) => {
  try {
    const response = await axios.post(`${API_URL}/api/shipping/create-tracking`, {
      orderItemId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Đã xảy ra lỗi khi tạo mã vận đơn'
    );
  }
};

/**
 * Cập nhật trạng thái vận chuyển
 * @param {String} shippingInfoId - ID của ShippingInfo
 * @param {Object} updateData - Dữ liệu cập nhật {status, location, notes}
 * @param {String} token - JWT token
 * @returns {Promise}
 */
export const updateShippingStatus = async (shippingInfoId, updateData, token) => {
  try {
    const response = await axios.put(`${API_URL}/api/shipping/update-status/${shippingInfoId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Đã xảy ra lỗi khi cập nhật trạng thái vận chuyển'
    );
  }
};

/**
 * Lấy thông tin vận chuyển theo tracking number
 * @param {String} trackingNumber - Mã vận đơn
 * @returns {Promise}
 */
export const getTrackingInfo = async (trackingNumber) => {
  try {
    const response = await axios.get(`${API_URL}/api/shipping/track/${trackingNumber}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Không tìm thấy mã vận đơn');
    }
    throw new Error(
      error.response?.data?.message || 
      'Đã xảy ra lỗi khi tra cứu vận chuyển'
    );
  }
};

/**
 * Lấy danh sách vận chuyển của seller
 * @param {Object} params - Tham số {page, limit, status}
 * @param {String} token - JWT token
 * @returns {Promise}
 */
export const getSellerShipments = async (params = {}, token) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/api/shipping/seller-shipments?${queryParams}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Đã xảy ra lỗi khi lấy danh sách vận chuyển'
    );
  }
};

/**
 * Lấy thống kê vận chuyển của seller
 * @param {String} token - JWT token
 * @returns {Promise}
 */
export const getShippingStats = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/shipping/seller-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Đã xảy ra lỗi khi lấy thống kê vận chuyển'
    );
  }
};

/**
 * Lấy thông tin vận chuyển của một OrderItem
 * @param {String} orderItemId - ID của OrderItem
 * @param {String} token - JWT token
 * @returns {Promise}
 */
export const getShippingInfoByOrderItem = async (orderItemId, token) => {
  try {
    console.log('Fetching shipping info for orderItem:', orderItemId);
    const response = await axios.get(`${API_URL}/api/sellers/shipping/order-item/${orderItemId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('getShippingInfoByOrderItem error:', error);
    if (error.response?.status === 404) {
      return { shippingInfo: null, orderItem: null };
    }
    throw new Error(
      error.response?.data?.message || 
      'Đã xảy ra lỗi khi lấy thông tin vận chuyển'
    );
  }
};

/**
 * Lấy danh sách thông tin vận chuyển của một Order
 * @param {String} orderId - ID của Order
 * @param {String} token - JWT token
 * @returns {Promise}
 */
export const getShippingInfoByOrder = async (orderId, token) => {
  try {
    console.log('Fetching shipping info for order:', orderId);
    const response = await axios.get(`${API_URL}/api/sellers/shipping/order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('getShippingInfoByOrder response:', response.data);
    return response.data;
  } catch (error) {
    console.error('getShippingInfoByOrder error:', error);
    // Trả về cấu trúc mặc định để component không bị lỗi
    if (error.response?.status === 404) {
      return { items: [] };
    }
    throw new Error(
      error.response?.data?.message || 
      'Đã xảy ra lỗi khi lấy thông tin vận chuyển của đơn hàng'
    );
  }
};

// Reset trạng thái đơn hàng từ cancelled về pending
export const resetCancelledOrders = async (token) => {
  try {
    const response = await axios.post(`${API_URL}/api/shipping/reset-cancelled-orders`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Đã xảy ra lỗi khi reset cancelled orders'
    );
  }
};

// Lấy danh sách order items của seller
export const getSellerOrderItems = async (params = {}, token) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/api/shipping/seller-order-items?${queryParams}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Đã xảy ra lỗi khi lấy danh sách order items'
    );
  }
};

// Debug: Lấy tất cả shipping info của seller
export const debugShippingInfo = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/shipping/debug-shipping-info`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Đã xảy ra lỗi khi debug shipping info'
    );
  }
};

// Các hàm cũ để tương thích ngược
export const updateShippingStatusOld = async (shippingInfoId, status, token) => {
  try {
    const response = await axios.put(`${API_URL}/api/seller/shipping/${shippingInfoId}/status`, {
      status
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Đã xảy ra lỗi khi cập nhật trạng thái vận chuyển'
    );
  }
}; 