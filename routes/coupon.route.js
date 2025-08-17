import {Router} from "express";
import {CouponController} from "../controllers/coupon.controller.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

export class CouponRoutes {
    constructor() {
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.post('/use', CouponController.use)

        this.router.use(authMiddleware);
        this.router.use(adminMiddleware);
        this.router.get('/get', CouponController.get)
        this.router.post('/create', CouponController.create)
        this.router.put('/update/:id', CouponController.update)
        this.router.delete('/delete/:id', CouponController.delete)
    }

    getRouter() {
        return this.router
    }
}
