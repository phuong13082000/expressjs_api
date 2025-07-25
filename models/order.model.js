import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: [true, "Provide orderId"],
        unique: true
    },
    product_details: {
        name: String,
        image: Array,
    },
    paymentId: {
        type: String,
        default: null
    },
    paymentStatus: {
        type: String,
        default: null
    },
    subTotalAmt: {
        type: Number,
        default: 0
    },
    totalAmt: {
        type: Number,
        default: 0
    },
    invoice_receipt: {
        type: String,
        default: null
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    },
    deliveryAddress: {
        type: mongoose.Schema.ObjectId,
        ref: 'address'
    },
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: "product"
    },
}, {
    timestamps: true
})

const OrderModel = mongoose.model('order', orderSchema)

export default OrderModel
