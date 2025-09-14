import {Router} from 'express'
import authMiddleware from "../middleware/auth.middleware.js";

export class OrderRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        //stripe listen --forward-to localhost:8000/api/v1/order/webhook-stripe
        this.router.post('/webhook-stripe', this.controller.webhookStripe.bind(this.controller));

        this.router.use(authMiddleware);
        this.router.get("/get", this.controller.get.bind(this.controller));
        this.router.post("/create", this.controller.create.bind(this.controller));
    }

    getRouter() {
        return this.router
    }
}
