import {Router} from 'express'
import {AddressController} from '../controllers/address.controller.js'
import authMiddleware from "../middleware/auth.middleware.js";
import {validateMiddleware} from "../middleware/validate.middleware.js";
import AddressSchema from "../schemas/address.schema.js";

export class AddressRoutes {
    constructor() {
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.use(authMiddleware);
        this.router.get("/get", AddressController.get)
        this.router.post('/add', validateMiddleware(AddressSchema.createAddressSchema), AddressController.add)
        this.router.put('/update', validateMiddleware(AddressSchema.updateAddressSchema), AddressController.update)
        this.router.delete("/disable", AddressController.delete)
    }

    getRouter() {
        return this.router
    }
}
