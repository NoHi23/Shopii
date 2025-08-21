const axios = require('axios');
const GHN_API_BASE = 'https://online-gateway.ghn.vn/shiip/public-api';

// Lấy danh sách tỉnh/thành phố
async function getProvinces(token) {
  const url = `${GHN_API_BASE}/master-data/province`;
  const res = await axios.get(url, { headers: { Token: token, 'Content-Type': 'application/json' } });
  return res.data;
}

// Lấy danh sách quận/huyện
async function getDistricts(token, provinceId) {
  const url = `${GHN_API_BASE}/master-data/district`;
  const res = await axios.post(url, { province_id: provinceId }, { headers: { Token: token, 'Content-Type': 'application/json' } });
  return res.data;
}

// Lấy danh sách phường/xã
async function getWards(token, districtId) {
  const url = `${GHN_API_BASE}/master-data/ward`;
  const res = await axios.post(url, { district_id: districtId }, { headers: { Token: token, 'Content-Type': 'application/json' } });
  return res.data;
}

// Lấy các gói dịch vụ vận chuyển khả dụng
async function getAvailableServices(token, shopId, fromDistrict, toDistrict) {
  const url = `${GHN_API_BASE}/v2/shipping-order/available-services`;
  console.log(`Lấy dịch vụ vận chuyển từ quận/huyện ID ${fromDistrict} đến quận/huyện ID ${toDistrict}`);
  const res = await axios.post(
    url,
    {
      shop_id: shopId,
      from_district: fromDistrict,
      to_district: toDistrict,
    },
    { headers: { Token: token,  'Content-Type': 'application/json' } }
  );
  return res.data;
}

// Tính phí vận chuyển
async function calculateShippingFee(token, shopId, params) {
  const url = `${GHN_API_BASE}/v2/shipping-order/fee`;
  const res = await axios.post(
    url,
    params,
    { headers: { Token: token, ShopId: shopId, 'Content-Type': 'application/json' } }
  );
  return res.data;
}

module.exports = {
  getProvinces,
  getDistricts,
  getWards,
  getAvailableServices,
  calculateShippingFee,
};
