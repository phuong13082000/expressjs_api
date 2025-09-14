import {Router} from "express";
import adminMiddleware from "../middleware/admin.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

export class CouponRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.get('/get', this.controller.get.bind(this.controller));

        this.router.use(authMiddleware);
        this.router.post('/use', this.controller.use.bind(this.controller));

        this.router.use(adminMiddleware);
        this.router.post('/create', this.controller.create.bind(this.controller));
        this.router.put('/update/:id', this.controller.update.bind(this.controller));
        this.router.delete('/delete/:id', this.controller.delete.bind(this.controller));
    }

    getRouter() {
        return this.router
    }
}
