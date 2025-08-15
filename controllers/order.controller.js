import mongoose from "mongoose";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import CartModel from "../models/cart.model.js";
import Stripe from "../configs/stripe.js";

export class OrderController {
    static async get(req, res) {
        try {
            const userId = req.userId

            const orderList = await OrderModel.find({userId: userId})
                .sort({createdAt: -1})
                .populate('deliveryAddress')

            return res.json({
                success: true,
                data: orderList,
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async create(req, res) {
        try {
            const userId = req.userId
            const {listItems, totalAmt, addressId, subTotalAmt} = req.body

            const payload = listItems.map(el => {
                return ({
                    userId: userId,
                    orderId: `ORD-${new mongoose.Types.ObjectId()}`,
                    productId: el.productId._id,
                    productDetails: {
                        name: el.productId.name,
                        image: el.productId.image
                    },
                    paymentId: "",
                    paymentStatus: "CASH ON DELIVERY",
                    deliveryAddress: addressId,
                    subTotalAmt: subTotalAmt,
                    totalAmt: totalAmt,
                })
            })

            const generatedOrder = await OrderModel.insertMany(payload)

            await CartModel.deleteMany({userId: userId})
            await UserModel.updateOne({_id: userId}, {shopping_cart: []})

            return res.json({
                success: true,
                data: generatedOrder,
                message: "Order successfully",
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async paymentStripe(req, res) {
        try {
            const userId = req.userId
            const {listItems, addressId} = req.body

            if (!Array.isArray(listItems) || listItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No items to purchase"
                });
            }

            const user = await UserModel.findById(userId)
                .populate({
                    path: 'shoppingCart',
                    populate: {
                        path: 'products',
                    }
                });

            const line_items = user.shoppingCart.map(item => {
                const product = item.products;

                return {
                    price_data: {
                        currency: 'USD',
                        product_data: {
                            name: product.name,
                            // images: [product.images[0]],
                            metadata: {productId: product._id.toString()}
                        },
                        unit_amount: priceWithDiscount(product.price, product.discount) * 100
                    },
                    adjustable_quantity: {
                        enabled: true,
                        minimum: 1
                    },
                    quantity: item.quantity
                }
            })

            const params = {
                submit_type: 'pay',
                mode: 'payment',
                payment_method_types: ['card'],
                customer_email: user.email,
                metadata: {
                    userId: userId.toString(),
                    addressId: addressId?.toString(),
                },
                line_items: line_items,
                success_url: `${process.env.FRONTEND_URL}/success`,
                cancel_url: `${process.env.FRONTEND_URL}/cancel`
            }

            const session = await Stripe.checkout.sessions.create(params)

            return res.status(200).json(session)
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async webhookStripe(req, res) {
        const event = req.body;

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
                const userId = session.metadata.userId
                const orderProduct = await getOrderProductItems(
                    {
                        lineItems: lineItems,
                        userId: userId,
                        addressId: session.metadata.addressId,
                        paymentId: session.payment_intent,
                        payment_status: session.payment_status,
                    })

                const order = await OrderModel.insertMany(orderProduct)

                if (Boolean(order[0])) {
                    await UserModel.findByIdAndUpdate(userId, {shoppingCart: []})
                    await CartModel.deleteMany({userId: userId})
                }

                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({received: true});
    }
}

const priceWithDiscount = (price, dis = 1) => {
    const discountAmount = Math.ceil((Number(price) * Number(dis)) / 100)
    return Number(price) - Number(discountAmount)
}

const getOrderProductItems = async ({lineItems, userId, addressId, paymentId, payment_status}) => {
    const productList = []

    if (lineItems?.data?.length) {
        for (const item of lineItems.data) {
            const product = await Stripe.products.retrieve(item.price.product)

            const payload = {
                userId: userId,
                orderId: `ORD-${new mongoose.Types.ObjectId()}`,
                productId: product.metadata.productId,
                productDetails: {
                    name: product.name,
                    image: product.images
                },
                paymentId: paymentId,
                paymentStatus: payment_status,
                deliveryAddress: addressId,
                subTotalAmt: Number(item.amount_total / 100),
                totalAmt: Number(item.amount_total / 100),
            }

            productList.push(payload)
        }
    }

    return productList
}
