import {Router} from 'express'
import {UploadController} from '../controllers/uploadImage.controller.js'
import authMiddleware from "../middleware/auth.middleware.js";
import {uploadMiddlewareImage} from "../middleware/upload.middleware.js";

export class UploadRoutes {
    constructor() {
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.use(authMiddleware)
        this.router.post('/upload', uploadMiddlewareImage, UploadController.image);
    }

    getRouter() {
        return this.router
    }
}
