import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";
import {BaseController} from "./base.controller.js";

class ProductController extends BaseController {
    static async get(req, res) {
        try {
            let {page, limit, search, category} = req.query

            if (parseInt(page) > 0) {
                page = parseInt(page);
            } else {
                page = 1;
            }

            if (parseInt(limit) > 0 && parseInt(limit) <= 20) {
                limit = parseInt(limit);
            } else {
                limit = 10;
            }

            const skip = (page - 1) * limit;

            const query = {};

            if (search) {
                query.$text = {$search: search};
            }

            if (category) {
                if (Array.isArray(category)) {
                    query.category = {$in: category};
                } else {
                    query.category = category;
                }
            }

            const [data, totalCount] = await Promise.all([
                ProductModel.find(query)
                    .select("-createdAt -updatedAt -__v")
                    .sort({createdAt: -1})
                    .skip(skip)
                    .limit(limit)
                    .populate({
                        path: "category",
                        select: "-createdAt -updatedAt -parent -__v",
                    }),
                ProductModel.countDocuments(query)
            ]);

            return this.success(res, {
                data,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                },
            });
        } catch (e) {
            console.error(e);
            return this.error(res)
        }
    }

    static async detail(req, res) {
        try {
            const {id} = req.params

            const product = await ProductModel.findOne({_id: id})
                .select("-createdAt -updatedAt -__v")
                .populate({
                    path: "category",
                    select: "-createdAt -updatedAt -parent -__v",
                })
                .populate({
                    path: "reviews",
                    select: "-createdAt -updatedAt -product -__v",
                    populate: ({
                        path: 'user',
                        select: 'name email avatar'
                    })
                })

            return this.success(res, product)
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }

    static async favorite(req, res) {
        try {
            const userId = req.userId
            const {id} = req.params

            const product = await ProductModel.findOne({_id: id})

            if (!product) {
                return this.error(res, 'product not found', 400)
            }

            const user = await UserModel.findById(userId);

            if (user.favoriteProduct.includes(product._id)) {
                await UserModel.findByIdAndUpdate(userId, {
                    $pull: {favoriteProduct: product._id}
                });

                return this.success(res, {}, 'remove')
            } else {
                await UserModel.findByIdAndUpdate(userId, {
                    $addToSet: {favoriteProduct: product._id}
                });

                return this.success(res, {}, 'add')
            }
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }

    static async create(req, res) {
        try {
            const {name, image, category, unit, stock, price, discount, description, moreDetails} = req.body

            if (!name || !image[0] || !category[0] || !unit || !price || !description) {
                return this.error(res, 'enter required fields', 400)
            }

            const product = new ProductModel({
                name,
                image,
                category,
                unit,
                stock,
                price,
                discount,
                description,
                moreDetails
            })

            await product.save()

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }

    static async update(req, res) {
        try {
            const {_id} = req.body

            if (!_id) {
                return this.error(res, 'id not found', 400)
            }

            await ProductModel.updateOne({_id: _id}, {...req.body})

            return this.success(res)
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
            const {_id} = req.body

            if (!_id) {
                return this.error(res, 'id not found', 400)
            }

            await ProductModel.deleteOne({_id: _id})

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }
}

export default new ProductController();
