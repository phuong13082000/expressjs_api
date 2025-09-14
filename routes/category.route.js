import {Router} from 'express'
import {validateMiddleware} from "../middleware/validate.middleware.js";
import CategorySchema from "../schemas/category.schema.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

export class CategoryRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.get(
            '/get',
            this.controller.get.bind(this.controller),
        );

        this.router.use(authMiddleware);
        this.router.use(adminMiddleware)

        this.router.post(
            "/add",
            validateMiddleware(CategorySchema.createCategorySchema),
            this.controller.create.bind(this.controller),
        );

        this.router.put(
            '/update',
            validateMiddleware(CategorySchema.updateCategorySchema),
            this.controller.update.bind(this.controller),
        );

        this.router.delete(
            "/delete",
            this.controller.delete.bind(this.controller),
        );
    }

    getRouter() {
        return this.router
    }
}
