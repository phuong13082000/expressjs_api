import {Router} from 'express'
import authMiddleware from "../middleware/auth.middleware.js";
import { ReviewController } from '../controllers/review.controller.js';

export class ReviewRoutes {
    constructor() {
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.use(authMiddleware);
        this.router.get("/get", ReviewController.get)
        this.router.post('/create', ReviewController.create)
        this.router.put('/update', ReviewController.update)
        this.router.delete("/delete", ReviewController.delete)
    }

    getRouter() {
        return this.router
    }
}
