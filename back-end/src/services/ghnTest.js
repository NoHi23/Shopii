// File test GHN Service
// Nhớ điền token và shopId của bạn vào biến bên dưới!

const GHNService = require('./ghnService');
require('dotenv').config();
const token = process.env.GHN_TOKEN;
const shopId = parseInt(process.env.GHN_SHOP_ID);

const ghn = new GHNService(token, shopId);

async function testGHN() {
  try {
    // 1. Lấy danh sách tỉnh/thành phố
    const provinces = await ghn.getProvinces();
    // Hà Nội: ProvinceID = 201, Hồ Chí Minh: ProvinceID = 202
    const haNoi = provinces.data.find(p => p.ProvinceName === 'Hà Nội');
    const hcm = provinces.data.find(p => p.ProvinceName === 'Hồ Chí Minh');
    if (!haNoi || !hcm) throw new Error('Không tìm thấy tỉnh Hà Nội hoặc Hồ Chí Minh');

    // 2. Lấy quận/huyện phổ biến của Hà Nội và HCM
    const districtsHN = await ghn.getDistricts(haNoi.ProvinceID);
    const districtsHCM = await ghn.getDistricts(hcm.ProvinceID);
    // Hà Đông (HN): DistrictID = 1542, Quận 1 (HCM): DistrictID = 1444
    const haDong = districtsHN.data.find(d => d.DistrictName.includes('Hà Đông'));
    const quan1 = districtsHCM.data.find(d => d.DistrictName.includes('Quận 1'));
    if (!haDong || !quan1) throw new Error('Không tìm thấy quận Hà Đông hoặc Quận 1');

    // 3. Lấy phường/xã của Quận 1 (HCM)
    const wardsQ1 = await ghn.getWards(quan1.DistrictID);
    const wardQ1 = wardsQ1.data[0]; // lấy phường đầu tiên

    // 4. Lấy gói dịch vụ vận chuyển khả dụng từ Hà Đông (HN) đến Quận 1 (HCM)
    const availableServices = await ghn.getAvailableServices(haDong.DistrictID, quan1.DistrictID);
    console.log('Available Services:', availableServices);

    // 5. Tính phí vận chuyển với service_id hợp lệ
    if (availableServices.data && availableServices.data.length > 0) {
      const serviceId = availableServices.data[0].service_id;
      console.log('Service ID:', serviceId);
      const feeParams = {
        service_id: serviceId,
        from_district_id: haDong.DistrictID,
        to_district_id: quan1.DistrictID,
        to_ward_code: wardQ1.WardCode,
        height: 15,
        length: 15,
        width: 15,
        weight: 1000,
        insurance_value: 500000,
        coupon: null
      };
      const fee = await ghn.calculateShippingFee(feeParams);
      console.log('Shipping Fee:', fee);
    } else {
      console.error('Không có dịch vụ vận chuyển khả dụng cho tuyến này!');
    }
  } catch (err) {
    console.error('GHN Test Error:', err.response ? err.response.data : err.message);
  }
}

testGHN();
