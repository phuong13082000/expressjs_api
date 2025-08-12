import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    addressLine: String,
    city: String,
    state: String,
    pinCode: String,
    country: String,
    mobile: Number,
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
