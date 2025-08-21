const express = require('express');
const router = express.Router();
const {
  getProvinces,
  getDistricts,
  getWards,
  getAvailableServices,
  calculateShippingFee,
} = require('../services/ghnFunctionService');

// Lấy danh sách tỉnh/thành phố
router.get('/provinces', async (req, res) => {
  try {
    const token = process.env.GHN_TOKEN;
    const data = await getProvinces(token);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy danh sách quận/huyện
router.get('/districts', async (req, res) => {
  try {
    const token = process.env.GHN_TOKEN;
    const provinceId = parseInt(req.query.province_id);
    const data = await getDistricts(token, provinceId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy danh sách phường/xã
router.get('/wards', async (req, res) => {
  try {
    const token = process.env.GHN_TOKEN;
    const districtId = parseInt(req.query.district_id);
    const data = await getWards(token, districtId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy các gói dịch vụ vận chuyển khả dụng
router.get('/services', async (req, res) => {
  try {
    const token = process.env.GHN_TOKEN;
    const shopId = parseInt(process.env.GHN_SHOP_ID);
    const fromDistrict = parseInt(req.query.from_district);
    const toDistrict = parseInt(req.query.to_district);
    const data = await getAvailableServices(token, shopId, fromDistrict, toDistrict);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tính phí vận chuyển
router.post('/fee', async (req, res) => {
  try {
    const token = process.env.GHN_TOKEN;
    const shopId = parseInt(process.env.GHN_SHOP_ID);
    const params = req.body;
    const data = await calculateShippingFee(token, shopId, params);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API tính phí vận chuyển chỉ cần from_district_id, to_district_id, to_ward_code
router.post('/calc-fee-simple', async (req, res) => {
  try {
    const token = process.env.GHN_TOKEN;
    const shopId = parseInt(process.env.GHN_SHOP_ID);
    const { from_district_id, to_district_id, to_ward_code, height = 15, length = 15, width = 15, weight = 1000, insurance_value = 500000, coupon = null } = req.body;
    // Lấy dịch vụ vận chuyển khả dụng
    const services = await getAvailableServices(token, shopId, from_district_id, to_district_id);
    if (!services.data || services.data.length === 0) {
      return res.status(400).json({ error: 'Không có dịch vụ vận chuyển khả dụng cho tuyến này!' });
    }
    const serviceId = services.data.find(s => s.service_type_id === 2)?.service_id
      || services.data[0].service_id;
    // Tính phí vận chuyển
    const feeParams = {
      service_id: serviceId,
      from_district_id,
      to_district_id,
      to_ward_code,
      height,
      length,
      width,
      weight,
      insurance_value,
      coupon
    };
    const fee = await calculateShippingFee(token, shopId, feeParams);
    res.json(fee);
  } catch (err) {
    res.status(500).json({ error: err.response ? err.response.data : err.message });
  }
});

module.exports = router;
