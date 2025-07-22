import CategoryModel from "../models/category.model.js";

export const AddCategoryController = async (req, res) => {
    try {
        const {name, slug, image, parent} = req.body

        const addCategory = new CategoryModel({
            name,
            slug,
            image,
            parent,
        })

        const saveCategory = await addCategory.save()

        return res.json({
            success: true,
            data: saveCategory,
            message: "Add Category"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error
        })
    }
}

export const getCategoryController = async (req, res) => {
    try {
        const data = await CategoryModel.aggregate([
            {
                $match: { parent: null },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "parent",
                    as: "children"
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    image: 1,
                    children: {
                        _id: 1,
                        name: 1,
                        slug: 1,
                        image: 1,
                    }
                }
            }
        ]);

        return res.json({
            success: true,
            data: data,
            message: "list category"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const updateCategoryController = async (req, res) => {
    try {
        const {_id, name, slug, image, parent} = req.body

        const update = await CategoryModel.updateOne({
            _id: _id
        }, {
            name,
            slug,
            image,
            parent,
        })

        return res.json({
            success: true,
            data: update,
            message: "Updated Category"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error
        })
    }
}

export const deleteCategoryController = async (req, res) => {
    try {
        const {_id} = req.body

        const checkSubCategory = await CategoryModel.countDocuments({ parent: _id });

        // const checkProduct = await ProductModel.countDocuments({ category: _id });

        // if (checkSubCategory > 0 || checkProduct > 0) {
        if (checkSubCategory > 0) {
            return res.status(400).json({
                success: false,
                message: "Category is already use can't delete",
            })
        }

        await CategoryModel.deleteOne({_id: _id})

        return res.json({
            success: true,
            message: "Delete category successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error
        })
    }
}
