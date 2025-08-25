import CategoryModel from "../models/category.model.js";
import ProductModel from "../models/product.model.js";

export class CategoryController {
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

            return res.json({
                success: true,
                data: data,
                message: ''
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
            const {title, image, parent} = req.body

            const addCategory = new CategoryModel({
                title,
                image,
                parent,
            })

            await addCategory.save()

            return res.json({
                success: true,
                message: ''
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
            const {_id, title, image, parent} = req.body

            const update = await CategoryModel.updateOne({
                _id: _id
            }, {
                title,
                image,
                parent,
            })

            return res.json({
                success: true,
                message: ''
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

            return res.json({
                success: true,
                message: ''
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
