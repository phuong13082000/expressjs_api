import {Router} from 'express'
import {
    AddCategoryController,
    deleteCategoryController,
    getCategoryController,
    updateCategoryController
} from '../controllers/category.controller.js'
import authMiddleware from "../middleware/auth.middleware.js";
import {validateMiddleware} from "../middleware/validate.middleware.js";
import {createCategorySchema} from "../schemas/category.schema.js";

const categoryRouter = Router()

categoryRouter.get('/get', getCategoryController)
categoryRouter.post("/add", validateMiddleware(createCategorySchema), authMiddleware, AddCategoryController)
categoryRouter.put('/update', authMiddleware, updateCategoryController)
categoryRouter.delete("/delete", authMiddleware, deleteCategoryController)

export default categoryRouter
