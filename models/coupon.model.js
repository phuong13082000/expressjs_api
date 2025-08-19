import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ["percent", "fixed"],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
    },
    minOrderValue: {
        type: Number,
        default: 0,
    },
    usageLimit: {
        type: Number,
        default: 1,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    usedBy: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "user"
        }
    ]
}, { timestamps: true });

const CouponModel = mongoose.model("coupon", couponSchema);

export default CouponModel
