import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import CartModel from "../models/cart.model.js";
import Stripe from "../configs/stripe.js";
import ProductModel from "../models/product.model.js";

const priceWithDiscount = (price, dis = 1) => {
    const discountAmount = Math.ceil((Number(price) * Number(dis)) / 100)
    return Number(price) - Number(discountAmount)
}

export class OrderController {
    static async get(req, res) {
        try {
            const userId = req.userId

            const orderList = await OrderModel.find({ userId: userId })
                .select('-userId -createdAt -updatedAt -__v')
                .populate({
                    path: 'deliveryAddress',
                    select: '-createdAt -updatedAt -__v -userId',
                })
                .sort({ createdAt: -1 })

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
            const { listItems, addressId, paymentMethod } = req.body

            if (!Array.isArray(listItems) || listItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No items to purchase"
                });
            }

            switch (paymentMethod) {
                case 'cod':
                    let subTotal = 0;
                    const productDetails = [];

                    for (const item of listItems) {
                        const product = await ProductModel.findById(item.productId);
                        if (!product) continue;

                        const price = priceWithDiscount(product.price, product.discount)
                        const quantity = item.quantity || 1;
                        subTotal += price * quantity;

                        productDetails.push({
                            productId: product._id,
                            title: product.title,
                            images: product.images,
                            quantity: quantity,
                            price: price,
                        });
                    }

                    const order = await OrderModel.create({
                        orderId: `ORD-${Date.now()}`,
                        userId: userId,
                        deliveryAddress: addressId,
                        products: productDetails,
                        subTotalAmt: subTotal,
                        totalAmt: subTotal,
                        paymentMethod: paymentMethod,
                        paymentStatus: "pending",
                        status: "pending",
                    });

                    await CartModel.deleteMany({ userId: userId })
                    await UserModel.updateOne({ _id: userId }, { shoppingCart: [] })
                    await UserModel.updateOne({ _id: userId }, { orderHistory: order._id })

                    for (const item of productDetails) {
                        await ProductModel.findByIdAndUpdate(item.productId, {
                            $inc: { stock: -item.quantity }
                        })
                    }

                    return res.json({
                        success: true,
                        message: "Order successfully created with cod",
                    })

                case 'stripe':
                    let subTotalStripe = 0;
                    const stripeItems = [];

                    for (const item of listItems) {
                        const product = await ProductModel.findById(item.productId);
                        if (!product) continue;

                        const price = priceWithDiscount(product.price, product.discount);
                        const quantity = item.quantity || 1;
                        subTotalStripe += price * quantity;

                        stripeItems.push({
                            price_data: {
                                currency: 'USD',
                                product_data: {
                                    name: product.title,
                                    metadata: { productId: product._id.toString() }
                                },
                                unit_amount: priceWithDiscount(product.price, product.discount) * 100
                            },
                            adjustable_quantity: {
                                enabled: true,
                                minimum: 1
                            },
                            quantity: quantity
                        });
                    }

                    const user = await UserModel.findById(userId);

                    const params = {
                        submit_type: 'pay',
                        mode: 'payment',
                        payment_method_types: ['card'],
                        customer_email: user.email,
                        metadata: {
                            userId: userId.toString(),
                            addressId: addressId?.toString(),
                            paymentMethod: "stripe"
                        },
                        line_items: stripeItems,
                        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                        cancel_url: `${process.env.FRONTEND_URL}/cancel`
                    }

                    const session = await Stripe.checkout.sessions.create(params)

                    return res.status(200).json(session)

                default:
                    return res.status(400).json({
                        success: false,
                        message: "Invalid payment method"
                    });
            }
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
            // checkout completed
            case 'checkout.session.completed':
                const session = event.data.object;
                const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
                const userId = session.metadata.userId

                const { products, subTotal } = await getOrderProductItems({ lineItems: lineItems });

                const order = await OrderModel.create({
                    orderId: `ORD-${Date.now()}`,
                    userId: userId,
                    deliveryAddress: session.metadata.addressId,
                    products: products,
                    subTotalAmt: subTotal,
                    totalAmt: subTotal,
                    paymentId: session.payment_intent,
                    paymentStatus: session.payment_status,
                    paymentMethod: "stripe",
                    status: 'paid'
                });

                if (order) {
                    await UserModel.findByIdAndUpdate(userId, { shoppingCart: [] })
                    await UserModel.updateOne({ _id: userId }, { orderHistory: order._id })
                    await CartModel.deleteMany({ userId: userId })

                    for (const item of products) {
                        await ProductModel.findByIdAndUpdate(item.productId, {
                            $inc: { stock: -item.quantity }
                        })
                    }
                }

                break;

            // payment succeeded
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
                break;
            }

            // payment failed
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                console.log(`PaymentIntent ${paymentIntent.id} failed`);
                await OrderModel.updateOne(
                    { paymentId: paymentIntent.payment_intent },
                    { $set: { paymentStatus: "failed" } }
                );
                break;
            }

            // charge succeeded
            case 'charge.succeeded': {
                const charge = event.data.object;
                console.log(`Charge ${charge.id} succeeded`);
                break;
            }

            // refund succeeded
            case 'charge.refunded': {
                const charge = event.data.object;
                console.log(`Charge ${charge.id} refunded`);
                await OrderModel.updateOne(
                    { paymentId: charge.payment_intent },
                    { $set: { paymentStatus: "refunded" } }
                );
                break;
            }

            // refund created
            case 'refund.created': {
                const refund = event.data.object;
                console.log(`Refund ${refund.id} created`);
                break;
            }

            // refund updated status
            case 'refund.updated': {
                const refund = event.data.object;
                console.log(`Refund ${refund.id} updated - status: ${refund.status}`);
                break;
            }

            // subscription event
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                console.log(`Subscription event: ${event.type}`, subscription.id);
                break;
            }

            // invoice event (subscription payment)
            case 'invoice.payment_succeeded':
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                console.log(`Invoice event: ${event.type}`, invoice.id);
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    }
}

const getOrderProductItems = async ({ lineItems }) => {
    const products = [];
    let subTotal = 0;

    if (lineItems?.data?.length) {
        for (const item of lineItems.data) {
            const product = await Stripe.products.retrieve(item.price.product);

            const quantity = item.quantity;
            const unitPrice = item.price.unit_amount / 100;
            const total = unitPrice * quantity;

            products.push({
                productId: product.metadata.productId,
                title: product.name,
                images: product.images,
                quantity: quantity,
                price: unitPrice
            });

            subTotal += total;
        }
    }

    return { products, subTotal };
};
