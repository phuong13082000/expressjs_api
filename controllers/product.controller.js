import ProductModel from "../models/product.model.js";

export const createProductController = async (req, res) => {
    try {
        const {
            name,
            image,
            category,
            unit,
            stock,
            price,
            discount,
            description,
            moreDetails,
        } = req.body

        if (!name || !image[0] || !category[0] || !unit || !price || !description) {
            return res.status(400).json({
                success: false,
                message: "Enter required fields",
            })
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
            moreDetails,
        })

        await product.save()

        return res.json({
            success: true,
            message: '',
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const getProductController = async (req, res) => {
    try {
        let {page, limit, search} = req.body

        if (!page || page < 0) {
            page = 1
        }

        if (!limit || limit < 0 || limit > 20) {
            limit = 10
        }

        const query = search ? {
            $text: {
                $search: search
            }
        } : {}

        const skip = (page - 1) * limit

        const [data, totalCount] = await Promise.all([
            ProductModel.find(query)
                .select('-createdAt -updatedAt -__v')
                .sort({createdAt: -1})
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'category',
                    select: '-createdAt -updatedAt -parent -__v',
                }),
            ProductModel.countDocuments(query)
        ])

        return res.json({
            success: true,
            data: {
                data,
                totalCount: totalCount,
                totalNoPage: Math.ceil(totalCount / limit),
            },
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const getProductByCategory = async (req, res) => {
    try {
        const {id} = req.body

        if (!id) {
            return res.status(400).json({
                message: "provide category id",
                success: false
            })
        }

        const product = await ProductModel.find({category: {$in: id}}).limit(15)

        return res.json({
            success: true,
            data: product,
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const getProductDetails = async (req, res) => {
    try {
        const {productId} = req.body

        const product = await ProductModel.findOne({_id: productId})

        return res.json({
            success: true,
            data: product,
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const updateProductDetails = async (req, res) => {
    try {
        const {_id} = req.body

        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "provide product _id",
            })
        }

        await ProductModel.updateOne({_id: _id}, {...req.body})

        return res.json({
            success: true,
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const deleteProductDetails = async (req, res) => {
    try {
        const {_id} = req.body

        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "provide _id ",
            })
        }

        await ProductModel.deleteOne({_id: _id})

        return res.json({
            success: true,
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const searchProduct = async (req, res) => {
    try {
        let {search, page, limit} = req.body

        if (!page) {
            page = 1
        }

        if (!limit) {
            limit = 10
        }

        const query = search ? {
            $text: {
                $search: search
            }
        } : {}

        const skip = (page - 1) * limit

        const [data, dataCount] = await Promise.all([
            ProductModel.find(query)
                .select('-createdAt -updatedAt -__v')
                .sort({createdAt: -1})
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'category',
                    select: '-createdAt -updatedAt -parent -__v',
                }),
            ProductModel.countDocuments(query)
        ])

        return res.json({
            success: true,
            data: {
                data,
                totalCount: dataCount,
                totalPage: Math.ceil(dataCount / limit),
                page: page,
                limit: limit,
            },
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}
