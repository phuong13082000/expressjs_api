import {Router} from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import {validateMiddleware} from "../middleware/validate.middleware.js";
import {UserController} from "../controllers/user.controller.js";
import {uploadMiddlewareAvatar} from "../middleware/upload.middleware.js";
import AuthSchema from "../schemas/user.schema.js";

export class UserRoutes {
    constructor() {
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.post('/register', validateMiddleware(AuthSchema.registerSchema), UserController.register);
        this.router.post('/login', validateMiddleware(AuthSchema.loginSchema), UserController.login);
        this.router.post('/refresh-token', UserController.refreshToken);
        this.router.post('/login-google', UserController.googleLogin);
        this.router.post('/verify-email', UserController.verifyEmail);
        this.router.put('/forgot-password', UserController.forgotPassword);
        this.router.put('/verify-forgot-password-otp', UserController.verifyForgotPasswordOtp)
        this.router.put('/reset-password', UserController.resetPassword);

        this.router.use(authMiddleware);
        this.router.get('/user-details', UserController.userDetails);
        this.router.put('/upload-avatar', uploadMiddlewareAvatar, UserController.uploadAvatar);
        this.router.put('/update-user', UserController.updateDetails)
        this.router.post('/logout', UserController.logout);
        this.router.post('/deactivate', UserController.deactivate);
    }

    getRouter() {
        return this.router
    }
}
