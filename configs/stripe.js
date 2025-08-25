import dotenv from 'dotenv'
import stripe from "stripe";

dotenv.config()

class Stripe {
    constructor() {
        stripe(process.env.STRIPE_SECRET_KEY)
    }
}

export default new Stripe()

