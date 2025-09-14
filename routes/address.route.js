import {Router} from 'express'
import authMiddleware from "../middleware/auth.middleware.js";
import {validateMiddleware} from "../middleware/validate.middleware.js";
import AddressSchema from "../schemas/address.schema.js";

export class AddressRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = Router()
        this.registerRoutes()
    }

    registerRoutes() {
        this.router.use(authMiddleware);

        this.router.get(
            "/get",
            this.controller.get.bind(this.controller),
        );

        this.router.post(
            '/add',
            validateMiddleware(AddressSchema.createAddressSchema),
            this.controller.add.bind(this.controller),
        );

        this.router.put(
            '/update',
            validateMiddleware(AddressSchema.updateAddressSchema),
            this.controller.update.bind(this.controller),
        );

        this.router.delete(
            "/disable",
            this.controller.delete.bind(this.controller),
        );
    }

    getRouter() {
        return this.router
    }
}
