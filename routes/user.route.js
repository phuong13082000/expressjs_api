import {Router} from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import {validateMiddleware} from "../middleware/validate.middleware.js";
import {loginSchema, registerSchema} from "../schemas/user.schema.js";
import {UserController} from "../controllers/user.controller.js";
import {uploadMiddlewareAvatar} from "../middleware/upload.middleware.js";

export class UserRoutes {
    constructor() {
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.authRoutes()
        this.profileRoutes()
        this.passwordRoutes()
    }

    authRoutes() {
        this.router.post('/register', validateMiddleware(registerSchema), UserController.register);
        this.router.post('/verify-email', UserController.verifyEmail);
        this.router.post('/login', validateMiddleware(loginSchema), UserController.login);
        this.router.post('/refresh-token', UserController.refreshToken);
        this.router.post('/login-google', UserController.googleLogin);
        this.router.post('/logout', authMiddleware, UserController.logout);
        this.router.post('/deactivate', authMiddleware, UserController.deactivate);
    }

    profileRoutes() {
        this.router.get('/user-details', authMiddleware, UserController.userDetails);
        this.router.put('/upload-avatar', authMiddleware, uploadMiddlewareAvatar, UserController.uploadAvatar);
        this.router.put('/update-user', authMiddleware, UserController.updateDetails)
    }

    passwordRoutes() {
        this.router.put('/forgot-password', UserController.forgotPassword);
        this.router.put('/verify-forgot-password-otp', UserController.verifyForgotPasswordOtp)
        this.router.put('/reset-password', UserController.resetPassword);
    }

    getRouter() {
        return this.router
    }
}
