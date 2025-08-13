import {Router} from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {CartController} from "../controllers/cart.controller.js";

export class CartRoutes {
    constructor() {
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.use(authMiddleware);
        this.router.get("/get", CartController.get)
        this.router.post('/add', CartController.create);
        this.router.put('/update', CartController.update);
        this.router.delete('/delete', CartController.delete);
    }

    getRouter() {
        return this.router
    }
}
