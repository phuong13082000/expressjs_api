import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: [true, "Provide orderId"],
        unique: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    deliveryAddress: {
        type: mongoose.Schema.ObjectId,
        ref: 'address',
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: "product",
                required: true,
            },
            title: { type: String },
            images: { type: Array, default: [] },
            quantity: { type: Number, default: 1 },
            price: { type: Number, required: true }
        }
    ],
    subTotalAmt: { type: Number, default: 0 },
    totalAmt: { type: Number, default: 0 },
    paymentId: { type: String, default: null },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },
    status: {
        type: String,
        enum: ["pending", "paid", "shipped", "completed", "cancelled"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "card", "paypal", "stripe"],
        default: "cod"
    },
    invoiceReceipt: { type: String, default: null },
}, {
    timestamps: true
});

const OrderModel = mongoose.model('order', orderSchema);

export default OrderModel;
