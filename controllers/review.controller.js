import ReviewModel from '../models/review.model.js'
import OrderModel from '../models/order.model.js'
import ProductModel from '../models/product.model.js'
import {BaseController} from "./base.controller.js";

class ReviewController extends BaseController {
    static async get(req, res) {
        try {
            const userId = req.userId
            const data = await ReviewModel.find({ user: userId })
                .select('-createdAt -updatedAt -__v')
                .populate({
                    path: 'user',
                    select: 'name email avatar'
                })
                .populate({
                    path: 'product',
                    select: '-createdAt -updatedAt -__v -reviews',
                    populate: {
                        path: 'category',
                        select: '-createdAt -updatedAt -__v -parent',
                    }
                })

            return this.success(res, data)
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async create(req, res) {
        try {
            const userId = req.userId
            const { rating, comment, productId } = req.body

            const orders = await OrderModel.find({ userId: userId }).lean()

            const hasPurchased = orders.some(order =>
                order.products.some(item => String(item.productId) === String(productId))
            );

            if (!hasPurchased) {
                return res.status(400).json({
                    success: false,
                    message: 'fail',
                });
            }

            const review = new ReviewModel({
                rating,
                comment,
                user: userId,
                product: productId,
            });

            await review.save();

            await ProductModel.updateOne({ _id: productId }, {
                $push: {reviews: review._id}
            })

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async update(req, res) {
        try {
            const userId = req.userId

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async delete(req, res) {
        try {
            const userId = req.userId

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }
}

export default new ReviewController();
