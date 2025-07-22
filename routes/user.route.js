import {Router} from 'express'
import {
    forgotPasswordController,
    loginController,
    logoutController,
    refreshToken,
    registerController,
    resetPassword,
    updateDetails,
    uploadAvatar,
    userDetails,
    verifyEmailController,
    verifyForgotPasswordOtp
} from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
import {uploadMiddlewareAvatar} from "../utils/uploadImageLocal.js";

const userRouter = Router()

userRouter.get('/logout', auth, logoutController)
userRouter.get('/user-details', auth, userDetails)

userRouter.post('/register', registerController)
userRouter.post('/verify-email', verifyEmailController)
userRouter.post('/login', loginController)
userRouter.post('/refresh-token', refreshToken)

userRouter.put('/upload-avatar', auth, uploadMiddlewareAvatar, uploadAvatar)
userRouter.put('/update-user', auth, updateDetails)
userRouter.put('/forgot-password', forgotPasswordController)
userRouter.put('/verify-forgot-password-otp', verifyForgotPasswordOtp)
userRouter.put('/reset-password', resetPassword)

export default userRouter
