import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import {fileURLToPath} from "url";
import Database from "./configs/database.js";

import {CategoryRoutes} from "./routes/category.route.js";
import {AddressRoutes} from "./routes/address.route.js";
import {UploadRoutes} from "./routes/upload.route.js";
import {ProductRoutes} from "./routes/product.route.js";
import {CartRoutes} from "./routes/cart.route.js";
import {OrderRoutes} from "./routes/order.route.js";
import {UserRoutes} from "./routes/user.route.js";
import {CouponRoutes} from "./routes/coupon.route.js";
import {ReviewRoutes} from "./routes/review.route.js";

import UserController from "./controllers/user.controller.js";
import AddressController from "./controllers/address.controller.js";
import UploadController from "./controllers/uploadImage.controller.js";
import CategoryController from "./controllers/category.controller.js";
import CartController from "./controllers/cart.controller.js";
import OrderController from "./controllers/order.controller.js";
import ProductController from "./controllers/product.controller.js";
import CouponController from "./controllers/coupon.controller.js";
import ReviewController from "./controllers/review.controller.js";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express()
const _dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
}))
app.use(express.json()) // limit: '10kb'
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(morgan('dev')) // combined > common > dev > short
app.use(helmet({
    crossOriginResourcePolicy: false,
    // hidePoweredBy: false,
    // xssFilter: false,
}))
app.use(express.static(path.join(_dirname, "public")));

app.use('/api/v1/user', new UserRoutes(UserController).getRouter())
app.use('/api/v1/address', new AddressRoutes(AddressController).getRouter())
app.use('/api/v1/category', new CategoryRoutes(CategoryController).getRouter())
app.use('/api/v1/file', new UploadRoutes(UploadController).getRouter())
app.use('/api/v1/product', new ProductRoutes(ProductController).getRouter())
app.use('/api/v1/cart', new CartRoutes(CartController).getRouter())
app.use('/api/v1/order', new OrderRoutes(OrderController).getRouter())
app.use('/api/v1/coupon', new CouponRoutes(CouponController).getRouter())
app.use('/api/v1/review', new ReviewRoutes(ReviewController).getRouter())

Database.connect().then(() => {
    app.listen(port, () => console.log("Server running on http://localhost:" + port))
})
