const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    locationGHN: {
      province_id: { type: Number }, // Mã tỉnh/thành phố GHN
      district_id: { type: Number }, // Mã quận/huyện GHN
      ward_code: { type: String },   // Mã phường/xã GHN
      ward: { type: String },        // Tên phường/xã
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
