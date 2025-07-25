import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    addressLine: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    state: {
        type: String,
        default: null
    },
    pinCode: {
        type: String
    },
    country: {
        type: String
    },
    mobile: {
        type: Number,
        default: null
    },
    status: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        default: null
    }
}, {
    timestamps: true
})

const AddressModel = mongoose.model('address', addressSchema)

export default AddressModel
