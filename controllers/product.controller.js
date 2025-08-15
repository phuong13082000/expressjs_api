import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";

export class ProductController {
    static async get(req, res) {
        try {
            let { page, limit, search, category } = req.query

            page = parseInt(page) > 0 ? parseInt(page) : 1;
            limit = parseInt(limit) > 0 && parseInt(limit) <= 20 ? parseInt(limit) : 10;

            const skip = (page - 1) * limit;

            const query = {};

            if (search) {
                query.$text = { $search: search };
            }

            if (category) {
                query.category = Array.isArray(category) ? { $in: category } : category;
            }

            const [data, totalCount] = await Promise.all([
                ProductModel.find(query)
                    .select("-createdAt -updatedAt -__v")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate({
                        path: "category",
                        select: "-createdAt -updatedAt -parent -__v",
                    }),
                ProductModel.countDocuments(query)
            ]);

            return res.json({
                success: true,
                data,
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                message: ''
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async detail(req, res) {
        try {
            const { id } = req.params

            const product = await ProductModel.findOne({ _id: id })
                .select("-createdAt -updatedAt -__v")
                .populate({
                    path: "category",
                    select: "-createdAt -updatedAt -parent -__v",
                })

            return res.json({
                success: true,
                data: product,
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

    static async favorite(req, res) {
        try {
            const userId = req.userId
            const { id } = req.params

            const product = await ProductModel.findOne({ _id: id })

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: 'not found product',
                })
            }

            const user = await UserModel.findById(userId);

            if (user.favoriteProduct.includes(product._id)) {
                await UserModel.findByIdAndUpdate(userId, {
                    $pull: { favoriteProduct: product._id }
                });

                return res.json({
                    success: true,
                    message: 'remove',
                })
            } else {
                await UserModel.findByIdAndUpdate(userId, {
                    $addToSet: { favoriteProduct: product._id }
                });

                return res.json({
                    success: true,
                    message: 'add',
                })
            }
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
            const { name, image, category, unit, stock, price, discount, description, moreDetails } = req.body

            if (!name || !image[0] || !category[0] || !unit || !price || !description) {
                return res.status(400).json({
                    success: false,
                    message: "Enter required fields",
                })
            }

            const product = new ProductModel({ name, image, category, unit, stock, price, discount, description, moreDetails })

            await product.save()

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

    static async update(req, res) {
        try {
            const { _id } = req.body

            if (!_id) {
                return res.status(400).json({
                    success: false,
                    message: "provide product _id",
                })
            }

            await ProductModel.updateOne({ _id: _id }, { ...req.body })

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
            const { _id } = req.body

            if (!_id) {
                return res.status(400).json({
                    success: false,
                    message: "provide _id ",
                })
            }

            await ProductModel.deleteOne({ _id: _id })

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
