import { api } from '../index';

class CartService {
  async getAllProducts(userId) {
    try {
      const { data } = await api.get(`/cart/${userId}`);
      if (data) return data;
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }

  async updateCartItem(userId, productId, quantity, color) {
    try {
      const { data } = await api.put('/cart/update', {
        userId,
        productId,
        quantity,
        color
      });
      return data;
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }

  async addToCartItem(userId, productId, quantity, color) {
    try {
      const { data } = await api.post('/cart/add-to-cart', {
        userId,
        productId,
        quantity,
        color
      });
      return data;
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }

  async deleteCartItem(userId, productId, color) {
    try {
      const { data } = await api.delete('/cart/remove', {
        data: {
          userId,
          productId,
          color
        }
      });
      return data;
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }

  // ==== API tính phí ship ====
  async calculateShippingFee(shopGroup, selectedAddress) {
    try {
      const payload = {
        from_district_id: shopGroup.shop?.districtId,
        to_district_id: selectedAddress?.districtId,
        to_ward_code: selectedAddress?.wardCode,
        weight: shopGroup.items.reduce((sum, i) => sum + i.quantity * 500, 0) // giả sử mỗi sp 500g
      };

      const { data } = await api.post('/shipping/calc-fee-simple', payload);
      return data?.data?.total || 0;
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }
}

export default new CartService();
