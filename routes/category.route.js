import {Router} from 'express'
import {
    addCategoryController,
    deleteCategoryController,
    getCategoryController,
    updateCategoryController
} from '../controllers/category.controller.js'
import authMiddleware from "../middleware/auth.middleware.js";
import {validateMiddleware} from "../middleware/validate.middleware.js";
import {createCategorySchema, updateCategorySchema} from "../schemas/category.schema.js";

const categoryRouter = Router()

categoryRouter.get('/get', getCategoryController)
categoryRouter.post("/add", validateMiddleware(createCategorySchema), authMiddleware, addCategoryController)
categoryRouter.put('/update', validateMiddleware(updateCategorySchema), authMiddleware, updateCategoryController)
categoryRouter.delete("/delete", authMiddleware, deleteCategoryController)

export default categoryRouter
