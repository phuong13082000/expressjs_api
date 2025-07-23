import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        default: 1
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "user"
    },
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: 'product'
    },
}, {
    timestamps: true
})

const CartModel = mongoose.model('cart', cartSchema)

export default CartModel
