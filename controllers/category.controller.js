import CategoryModel from "../models/category.model.js";
import ProductModel from "../models/product.model.js";
import {BaseController} from "./base.controller.js";

class CategoryController extends BaseController {
    static async get(req, res) {
        try {
            const data = await CategoryModel.aggregate([
                {
                    $match: {
                        parent: null,
                        image: {$ne: null}
                    },
                },
                {
                    $sort: {createdAt: -1}
                },
                {
                    $lookup: {
                        from: "categories",
                        let: {
                            parentId: "$_id"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$parent", "$$parentId"]
                                    },
                                    image: {$ne: null}
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    title: 1,
                                    slug: 1,
                                    image: 1
                                }
                            }
                        ],
                        as: "children"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        slug: 1,
                        image: 1,
                        children: 1
                    }
                }
            ]);

            return this.success(res, data)
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }

    static async create(req, res) {
        try {
            const {title, description, color, icon, image, parent} = req.body

            const addCategory = new CategoryModel({
                title,
                description,
                color,
                icon,
                image,
                parent,
            })

            await addCategory.save()

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }

    static async update(req, res) {
        try {
            const {_id, title, description, color, icon, image, parent} = req.body

            await CategoryModel.updateOne({
                _id: _id
            }, {
                title,
                description,
                color,
                icon,
                image,
                parent,
            })

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }

    static async delete(req, res) {
        try {
            const {_id} = req.body

            const checkSubCategory = await CategoryModel.countDocuments({parent: _id});

            const checkProduct = await ProductModel.countDocuments({category: _id});

            if (checkSubCategory > 0 || checkProduct > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Category is already use can't delete",
                })
            }

            await CategoryModel.deleteOne({_id: _id})

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }
}

export default new CategoryController();
