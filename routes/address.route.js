import {Router} from 'express'
import {
    addAddressController,
    deleteAddressController,
    getAddressController,
    updateAddressController
} from '../controllers/address.controller.js'
import authMiddleware from "../middleware/auth.middleware.js";

const addressRouter = Router()

addressRouter.get("/get", authMiddleware, getAddressController)
addressRouter.post('/add', authMiddleware, addAddressController)
addressRouter.put('/update', authMiddleware, updateAddressController)
addressRouter.delete("/disable", authMiddleware, deleteAddressController)

export default addressRouter
