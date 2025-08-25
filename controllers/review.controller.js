import ReviewModel from '../models/review.model.js'
import OrderModel from '../models/order.model.js'
import ProductModel from '../models/product.model.js'

export class ReviewController {
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

            return res.json({
                success: true,
                data: data,
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
                $push: {
                    reviews: review._id
                }
            })

            return res.json({
                success: true,
                message: 'create review successfully',
            });
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

            return res.json({
                success: true,
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

    static async delete(req, res) {
        try {
            const userId = req.userId

            return res.json({
                success: true,
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
}
