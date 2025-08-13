import dotenv from 'dotenv'
import stripe from "stripe";

dotenv.config()

const Stripe = stripe(process.env.STRIPE_SECRET_KEY)

export default Stripe
