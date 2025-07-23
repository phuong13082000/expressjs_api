import {Router} from 'express'
import {
    cashOnDeliveryOrderController,
    getOrderDetailsController,
    paymentController,
    webhookStripe
} from '../controllers/order.controller.js'
import authMiddleware from "../middleware/auth.middleware.js";

const orderRouter = Router()

orderRouter.get("/order-list", authMiddleware, getOrderDetailsController)

orderRouter.post("/cash-on-delivery", authMiddleware, cashOnDeliveryOrderController)
orderRouter.post('/checkout', authMiddleware, paymentController)
orderRouter.post('/webhook', webhookStripe)

export default orderRouter
