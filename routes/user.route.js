import {Router} from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import {validateMiddleware} from "../middleware/validate.middleware.js";
import {uploadMiddlewareAvatar} from "../middleware/upload.middleware.js";
import AuthSchema from "../schemas/user.schema.js";

export class UserRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.post(
            '/register',
            validateMiddleware(AuthSchema.registerSchema),
            this.controller.register.bind(this.controller),
        );

        this.router.post(
            '/login',
            validateMiddleware(AuthSchema.loginSchema),
            this.controller.login.bind(this.controller),
        );

        this.router.post(
            '/refresh-token',
            this.controller.refreshToken.bind(this.controller),
        );

        this.router.post(
            '/login-google',
            this.controller.googleLogin.bind(this.controller),
        );

        this.router.post(
            '/verify-email',
            this.controller.verifyEmail.bind(this.controller),
        );

        this.router.put(
            '/forgot-password',
            this.controller.forgotPassword.bind(this.controller),
        );

        this.router.put(
            '/verify-forgot-password-otp',
            this.controller.verifyForgotPasswordOtp.bind(this.controller),
        );

        this.router.put(
            '/reset-password',
            this.controller.resetPassword.bind(this.controller),
        );

        this.router.use(authMiddleware);

        this.router.get(
            '/user-details',
            this.controller.userDetails.bind(this.controller),
        );

        this.router.put(
            '/upload-avatar',
            uploadMiddlewareAvatar,
            this.controller.uploadAvatar.bind(this.controller),
        );

        this.router.put(
            '/update-user',
            this.controller.updateDetails.bind(this.controller),
        )

        this.router.post(
            '/logout',
            this.controller.logout.bind(this.controller),
        );

        this.router.post(
            '/deactivate',
            this.controller.deactivate.bind(this.controller),
        );
    }

    getRouter() {
        return this.router
    }
}
