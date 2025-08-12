import {Router} from 'express'
import {
    createProductController,
    deleteProductDetails,
    favoriteProduct,
    getProductByCategory,
    getProductController,
    getProductDetails,
    searchProduct,
    updateProductDetails
} from '../controllers/product.controller.js'
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const productRouter = Router()

productRouter.post('/get', getProductController)
productRouter.post("/get-product-by-category", getProductByCategory)
productRouter.post('/get-product-details', getProductDetails)
productRouter.post('/search-product', searchProduct)
productRouter.post("/create", authMiddleware, adminMiddleware, createProductController)
productRouter.post("/favorite/:id", authMiddleware, favoriteProduct)

productRouter.put('/update-product-details', authMiddleware, adminMiddleware, updateProductDetails)

productRouter.delete('/delete-product', authMiddleware, adminMiddleware, deleteProductDetails)

export default productRouter
