import UserModel from "../models/user.model.js";
import CartModel from "../models/cart.model.js";
import {BaseController} from "./base.controller.js";

class CartController extends BaseController {
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

            return this.success(res, cartItem);
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async create(req, res) {
        try {
            const userId = req.userId
            const {productId} = req.body

            if (!productId) {
                return this.error(res, 'product?', 402);
            }

            const checkItemCart = await CartModel.findOne({
                userId: userId,
                productId: productId
            })

            if (checkItemCart) {
                return this.error(res, 'item already in cart', 400);
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

            return this.success(res);
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async update(req, res) {
        try {
            const userId = req.userId
            const {_id, qty} = req.body

            if (!_id || !qty) {
                return this.error(res, 'product? qty?', 400);
            }

            await CartModel.updateOne({_id: _id, userId: userId}, {quantity: qty})

            return this.success(res);
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async delete(req, res) {
        try {
            const userId = req.userId
            const {_id} = req.body

            if (!_id) {
                return this.error(res, 'product?', 400);
            }

            await CartModel.deleteOne({_id: _id, userId: userId})

            await UserModel.findByIdAndUpdate(userId, {
                $pull: {shoppingCart: _id}
            });

            return this.success(res);
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }
}

export default new CartController();
