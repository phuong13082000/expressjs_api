import {Router} from 'express'
import authMiddleware from "../middleware/auth.middleware.js";
import {OrderController} from "../controllers/order.controller.js";

export class OrderRoutes {
    constructor() {
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        //stripe listen --forward-to localhost:8000/api/v1/order/webhook-stripe
        this.router.post('/webhook-stripe', OrderController.webhookStripe);

        this.router.use(authMiddleware);
        this.router.get("/get", OrderController.get)
        this.router.post("/create", OrderController.create);
    }

    getRouter() {
        return this.router
    }
}
