import {Router} from 'express'
import {validateMiddleware} from "../middleware/validate.middleware.js";
import CategorySchema from "../schemas/category.schema.js";
import {CategoryController} from "../controllers/category.controller.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

export class CategoryRoutes {
    constructor() {
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.get('/get', CategoryController.get);

        this.router.use(authMiddleware);
        this.router.use(adminMiddleware)
        this.router.post("/add", validateMiddleware(CategorySchema.createCategorySchema), CategoryController.create);
        this.router.put('/update', validateMiddleware(CategorySchema.updateCategorySchema), CategoryController.update)
        this.router.delete("/delete", CategoryController.delete);
    }

    getRouter() {
        return this.router
    }
}
