import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Provide name"]
    },
    email: {
        type: String,
        required: [true, "provide email"],
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return this.provider !== 'google';
        }
    },
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
    avatar: {
        type: String,
        default: null
    },
    mobile: {
        type: Number,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    },
    verifyEmail: {
        type: Boolean,
        default: false
    },
    lastLoginDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Suspended"],
        default: "Active"
    },
    forgotPasswordOtp: {
        type: String,
        default: null
    },
    forgotPasswordExpiry: {
        type: Date,
        default: null
    },
    role: {
        type: String,
        enum: ['ADMIN', "USER"],
        default: "USER"
    },
    addressDetails: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'address'
        }
    ],
    shoppingCart: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'cartProduct'
        }
    ],
    orderHistory: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'order'
        }
    ],
    favoriteProduct: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'product'
        }
    ],
    usedCoupons: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'coupon'
        }
    ]
}, {
    timestamps: true
})

const UserModel = mongoose.model("user", userSchema)

export default UserModel
