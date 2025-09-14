import {Router} from "express";
import authMiddleware from "../middleware/auth.middleware.js";

export class CartRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.use(authMiddleware);
        this.router.get("/get", this.controller.get.bind(this.controller));
        this.router.post('/add', this.controller.create.bind(this.controller));
        this.router.put('/update', this.controller.update.bind(this.controller));
        this.router.delete('/delete', this.controller.delete.bind(this.controller));
    }

    getRouter() {
        return this.router
    }
}
