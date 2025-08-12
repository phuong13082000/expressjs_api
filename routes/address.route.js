import {Router} from 'express'
import {
    addAddressController,
    deleteAddressController,
    getAddressController,
    updateAddressController
} from '../controllers/address.controller.js'
import authMiddleware from "../middleware/auth.middleware.js";
import {validateMiddleware} from "../middleware/validate.middleware.js";
import {createAddressSchema, updateAddressSchema} from "../schemas/address.schema.js";

const addressRouter = Router()

addressRouter.get("/get", authMiddleware, getAddressController)
addressRouter.post('/add', authMiddleware, validateMiddleware(createAddressSchema), addAddressController)
addressRouter.put('/update', authMiddleware, validateMiddleware(updateAddressSchema), updateAddressController)
addressRouter.delete("/disable", authMiddleware, deleteAddressController)

export default addressRouter
