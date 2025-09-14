import {Router} from 'express'
import authMiddleware from "../middleware/auth.middleware.js";
import {uploadMiddlewareImage} from "../middleware/upload.middleware.js";

export class UploadRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.use(authMiddleware)

        this.router.post(
            '/upload',
            uploadMiddlewareImage,
            this.controller.image.bind(this.controller),
        );
    }

    getRouter() {
        return this.router
    }
}
