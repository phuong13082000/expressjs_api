import {Router} from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    addCartController,
    deleteCartController,
    getCartController,
    updateCartController
} from "../controllers/cart.controller.js";

const cartRouter = Router()

cartRouter.post('/add', authMiddleware, addCartController)
cartRouter.get("/get", authMiddleware, getCartController)
cartRouter.put('/update', authMiddleware, updateCartController)
cartRouter.delete('/delete', authMiddleware, deleteCartController)

export default cartRouter
