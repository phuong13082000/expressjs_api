import UserModel from "../models/user.model.js";
import CartModel from "../models/cart.model.js";

export class CartController {
    static async get(req, res) {
        try {
            const userId = req.userId

            const cartItem = await CartModel.find({userId: userId})
                .select('-userId -__v -createdAt -updatedAt')
                .populate({
                    path: 'product',
                    select: '-createdAt -updatedAt -__v',
                    populate: {
                        path: 'category',
                        select: '-createdAt -updatedAt -parent -__v',
                    }
                })

            return res.json({
                success: true,
                data: cartItem,
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async create(req, res) {
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
                product: productId
            })

            await cartItem.save()

            await UserModel.updateOne({_id: userId}, {
                $push: {
                    shoppingCart: cartItem._id
                }
            })

            return res.json({
                success: true,
                message: "Item add successfully",
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async update(req, res) {
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
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async delete(req, res) {
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

            await UserModel.findByIdAndUpdate(userId, {
                $pull: {shoppingCart: _id}
            });

            return res.json({
                success: true,
                message: "Item remove",
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }
}
