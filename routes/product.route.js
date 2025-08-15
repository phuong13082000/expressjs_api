import {Router} from 'express'
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import {ProductController} from "../controllers/product.controller.js";

export class ProductRoutes {
    constructor() {
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.get('/get', ProductController.get)
        this.router.get('/detail/:id', ProductController.detail)

        this.router.use(authMiddleware)
        this.router.post("/favorite/:id", ProductController.favorite)

        this.router.use(adminMiddleware)
        this.router.post("/create", ProductController.create);
        this.router.put('/update', ProductController.update);
        this.router.delete('/delete', ProductController.delete);
    }

    getRouter() {
        return this.router
    }
}
