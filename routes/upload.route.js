import {Router} from 'express'
import uploadImageController from '../controllers/uploadImage.controller.js'
import {uploadMiddlewareImage} from "../utils/uploadImageLocal.js";
import authMiddleware from "../middleware/auth.middleware.js";

const uploadRouter = Router()

uploadRouter.post("/upload", authMiddleware, uploadMiddlewareImage, uploadImageController)

export default uploadRouter
