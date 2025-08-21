// GHN Shipping Service
// Tích hợp API Giao Hàng Nhanh để lấy địa chỉ, dịch vụ và tính phí vận chuyển

const axios = require('axios');

const GHN_API_BASE = 'https://online-gateway.ghn.vn/shiip/public-api';

class GHNService {
  constructor(token, shopId) {
    this.token = token;
    this.shopId = shopId;
    this.headers = {
      Token: this.token,
      ShopId: this.shopId,
      'Content-Type': 'application/json',
    };
  }

  // Lấy danh sách tỉnh/thành phố
  async getProvinces() {
    const url = `${GHN_API_BASE}/master-data/province`;
    const res = await axios.get(url, { headers: this.headers });
    return res.data;
  }

  // Lấy danh sách quận/huyện
  async getDistricts(provinceId) {
    const url = `${GHN_API_BASE}/master-data/district`;
    const res = await axios.post(url, { province_id: provinceId }, { headers: this.headers });
    return res.data;
  }

  // Lấy danh sách phường/xã
  async getWards(districtId) {
    const url = `${GHN_API_BASE}/master-data/ward`;
    const res = await axios.post(url, { district_id: districtId }, { headers: this.headers });
    return res.data;
  }

  // Lấy các gói dịch vụ vận chuyển khả dụng
  async getAvailableServices(fromDistrict, toDistrict) {
    const url = `${GHN_API_BASE}/v2/shipping-order/available-services`;
    console.log(`from_district_id: ${fromDistrict}, to_district_id: ${toDistrict}`);
    const res = await axios.post(
      url,
      {
        shop_id: this.shopId,
        from_district: fromDistrict,
        to_district: toDistrict,
      },
      { headers: this.headers }
    );
    return res.data;
  }

  // Tính phí vận chuyển
  async calculateShippingFee(params) {
    const url = `${GHN_API_BASE}/v2/shipping-order/fee`;
    console.log(`from_district_id: ${params.from_district_id}, to_district_id: ${params.to_district_id}, to_ward_code: ${params.to_ward_code}`);
    const res = await axios.post(
      url,
      params,
      { headers: this.headers }
    );
    return res.data;
  }
}

module.exports = GHNService;
