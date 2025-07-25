import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        image: {
            type: String,
            default: null
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
            default: null
        },
    },
    {timestamps: true}
);

const CategoryModel = mongoose.model('category', categorySchema)

export default CategoryModel
