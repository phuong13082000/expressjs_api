import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import {fileURLToPath} from "url";

import connectDb from "./configs/connectDb.js";
import {CategoryRoutes} from "./routes/category.route.js";
import {AddressRoutes} from "./routes/address.route.js";
import {UploadRoutes} from "./routes/upload.route.js";
import {ProductRoutes} from "./routes/product.route.js";
import {CartRoutes} from "./routes/cart.route.js";
import {OrderRoutes} from "./routes/order.route.js";
import {UserRoutes} from "./routes/user.route.js";

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

const userRouter = new UserRoutes();
const uploadRouter = new UploadRoutes();
const addressRouter = new AddressRoutes();
const cartRouter = new CartRoutes();
const orderRouter = new OrderRoutes();
const productRouter = new ProductRoutes();
const categoryRouter = new CategoryRoutes();

app.use('/api/v1/user', userRouter.getRouter())
app.use('/api/v1/address', addressRouter.getRouter())
app.use('/api/v1/category', categoryRouter.getRouter())
app.use('/api/v1/file', uploadRouter.getRouter())
app.use('/api/v1/product', productRouter.getRouter())
app.use('/api/v1/cart', cartRouter.getRouter())
app.use('/api/v1/order', orderRouter.getRouter())

connectDb().then(() => {
    app.listen(port, () => console.log("Server running on http://localhost:" + port))
})
