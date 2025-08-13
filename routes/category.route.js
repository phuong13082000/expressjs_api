import {Router} from 'express'
import authMiddleware from "../middleware/auth.middleware.js";
import {validateMiddleware} from "../middleware/validate.middleware.js";
import {createCategorySchema, updateCategorySchema} from "../schemas/category.schema.js";
import {CategoryController} from "../controllers/category.controller.js";

export class CategoryRoutes {
    constructor() {
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.get('/get', CategoryController.get);

        this.router.use(authMiddleware)
        this.router.post("/add", validateMiddleware(createCategorySchema), CategoryController.create);
        this.router.put('/update', validateMiddleware(updateCategorySchema), CategoryController.update)
        this.router.delete("/delete", CategoryController.delete);
    }

    getRouter() {
        return this.router
    }
}
