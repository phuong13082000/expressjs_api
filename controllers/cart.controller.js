import UserModel from "../models/user.model.js";
import CartModel from "../models/cart.model.js";

export const addCartController = async (req, res) => {
    try {
        const userId = req.userId
        const {productId} = req.body

        if (!productId) {
            return res.status(402).json({
                message: "Provide productId",
                success: false
            })
        }

        const checkItemCart = await CartModel.findOne({
            userId: userId,
            productId: productId
        })

        if (checkItemCart) {
            return res.status(400).json({
                success: false,
                message: "Item already in cart"
            })
        }

        const cartItem = new CartModel({
            quantity: 1,
            userId: userId,
            productId: productId
        })

        await cartItem.save()

        await UserModel.updateOne({_id: userId}, {
            $push: {
                shopping_cart: productId
            }
        })

        return res.json({
            success: true,
            message: "Item add successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const getCartController = async (req, res) => {
    try {
        const userId = req.userId

        const cartItem = await CartModel.find({userId: userId}).populate('productId')

        return res.json({
            success: true,
            data: cartItem,
            message: "list cart item",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const updateCartController = async (req, res) => {
    try {
        const userId = req.userId
        const {_id, qty} = req.body

        if (!_id || !qty) {
            return res.status(400).json({
                success: false,
                message: "provide _id, qty"
            })
        }

        await CartModel.updateOne({_id: _id, userId: userId}, {quantity: qty})

        return res.json({
            success: true,
            message: "Update cart",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const deleteCartController = async (req, res) => {
    try {
        const userId = req.userId
        const {_id} = req.body

        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Provide _id",
            })
        }

        await CartModel.deleteOne({_id: _id, userId: userId})

        return res.json({
            success: true,
            message: "Item remove",
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}
