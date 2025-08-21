// services/storeService.js
const Address = require("../models/Address");

async function getStoreFromDistrict(store) {
    const address = await Address.findOne({
        userId: store.sellerId,
        isDefault: true,
    });

    if (!address || !address.locationGHN?.district_id) {
        return null; // trả về null thay vì throw
    }

    return address.locationGHN.district_id;
}

module.exports = { getStoreFromDistrict };
