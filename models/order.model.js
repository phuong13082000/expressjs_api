import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    product_details: {
        name: String,
        image: Array,
    },
    paymentId: {
        type: String,
        default: null
    },
    payment_status: {
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
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: 'address'
    },
    orderId: {
        type: String,
        required: [true, "Provide orderId"],
        unique: true
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
