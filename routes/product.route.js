import {Router} from 'express'
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

export class ProductRoutes {
    constructor(controller) {
        this.controller = controller
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.get('/get', this.controller.get.bind(this.controller))
        this.router.get('/detail/:id', this.controller.detail.bind(this.controller))

        this.router.use(authMiddleware)
        this.router.post("/favorite/:id", this.controller.favorite.bind(this.controller))

        this.router.use(adminMiddleware)
        this.router.post("/create", this.controller.create.bind(this.controller))
        this.router.put('/update', this.controller.update.bind(this.controller))
        this.router.delete('/delete', this.controller.delete.bind(this.controller))
    }

    getRouter() {
        return this.router
    }
}
