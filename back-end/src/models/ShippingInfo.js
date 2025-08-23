const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shippingInfoSchema = new Schema(
  {
    orderItemId: { type: Schema.Types.ObjectId, ref: "OrderItem", required: true },
    carrier: { type: String, default: "Shopii Express" },
    trackingNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: [
        "pending",
        "processing", 
        "shipping",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "failed",
        "returned"
      ],
      default: "pending",
    },
    location: { type: String },
    notes: { type: String },
    estimatedArrival: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    statusHistory: [{
      status: { type: String },
      location: { type: String },
      notes: { type: String },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShippingInfo", shippingInfoSchema);
