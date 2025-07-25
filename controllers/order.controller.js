import mongoose from "mongoose";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import CartModel from "../models/cart.model.js";

export async function cashOnDeliveryOrderController(req, res) {
    try {
        const userId = req.userId
        const {list_items, totalAmt, addressId, subTotalAmt} = req.body

        const payload = list_items.map(el => {
            return ({
                userId: userId,
                orderId: `ORD-${new mongoose.Types.ObjectId()}`,
                productId: el.productId._id,
                product_details: {
                    name: el.productId.name,
                    image: el.productId.image
                },
                paymentId: "",
                payment_status: "CASH ON DELIVERY",
                delivery_address: addressId,
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
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const priceWithDiscount = (price, dis = 1) => {
    const discountAmount = Math.ceil((Number(price) * Number(dis)) / 100)
    return Number(price) - Number(discountAmount)
}

export async function paymentController(req, res) {
    try {
        const userId = req.userId
        const {list_items, totalAmt, addressId, subTotalAmt} = req.body

        const user = await UserModel.findById(userId)

        const line_items = list_items.map(item => {
            return {
                price_data: {
                    currency: 'USD',
                    product_data: {
                        name: item.productId.name,
                        images: item.productId.image,
                        metadata: {
                            productId: item.productId._id
                        }
                    },
                    unit_amount: priceWithDiscount(item.productId.price, item.productId.discount) * 100
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
                userId: userId,
                addressId: addressId
            },
            line_items: line_items,
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`

        }

        const session = await Stripe.checkout.sessions.create(params)

        return res.status(200).json(session)
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
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
                product_details: {
                    name: product.name,
                    image: product.images
                },
                paymentId: paymentId,
                payment_status: payment_status,
                delivery_address: addressId,
                subTotalAmt: Number(item.amount_total / 100),
                totalAmt: Number(item.amount_total / 100),
            }

            productList.push(payload)
        }
    }

    return productList
}

export async function webhookStripe(req, res) {
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
                await UserModel.findByIdAndUpdate(userId, {shopping_cart: []})
                await CartModel.deleteMany({userId: userId})
            }

            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
}

export async function getOrderDetailsController(req, res) {
    try {
        const userId = req.userId

        const orderList = await OrderModel.find({userId: userId})
            .sort({createdAt: -1})
            .populate('delivery_address')

        return res.json({
            success: true,
            data: orderList,
            message: "order list",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}
