import dotenv from "dotenv";
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from "morgan";
import helmet from "helmet";
import path from "path"
import {fileURLToPath} from "url"

import connectDb from "./configs/connectDb.js";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express()

app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
}))
app.use(express.json()) //limit: '10kb'
app.use(cookieParser())
app.use(morgan('dev')) //combined > common > dev > short
app.use(helmet({
    crossOriginResourcePolicy: false,
    // hidePoweredBy: false,
    // xssFilter: false,
}))

app.use(express.static(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "public")
));
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Server running on http://localhost:" + port,
    })
})
// app.use('/api/v1/user', userRouter)
// app.use("/api/v1/category", categoryRouter)
// app.use("/api/v1/file", uploadRouter)
// app.use("/api/v1/subcategory", subCategoryRouter)
// app.use("/api/v1/product", productRouter)
// app.use("/api/v1/cart", cartRouter)
// app.use("/api/v1/address", addressRouter)
// app.use('/api/v1/order', orderRouter)

connectDb().then(() => {
    app.listen(port, () => {
        console.log("Server running on http://localhost:" + port)
    })
})
