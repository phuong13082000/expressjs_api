import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
}, {timestamps: true});

reviewSchema.index({user: 1, product: 1}, {unique: true});

const ReviewModel = mongoose.model("review", reviewSchema);

export default ReviewModel
