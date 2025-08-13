import {Router} from 'express'
import authMiddleware from "../middleware/auth.middleware.js";
import {OrderController} from "../controllers/order.controller.js";

export class OrderRoutes {
    constructor() {
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.post('/webhook', OrderController.webhookStripe);

        this.router.use(authMiddleware);
        this.router.get("/order-list", OrderController.get)
        this.router.post("/cash-on-delivery", OrderController.create);
        this.router.post('/checkout-stripe', OrderController.paymentStripe)
    }

    getRouter() {
        return this.router
    }
}
