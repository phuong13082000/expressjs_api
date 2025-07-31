import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true
    },
    images: {
        type: Array,
        default: []
    },
    unit: {
        type: String,
        default: null
    },
    stock: {
        type: Number,
        default: null
    },
    price: {
        type: Number,
        default: null
    },
    discount: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        default: ""
    },
    moreDetails: {
        type: Object,
        default: {}
    },
    publish: {
        type: Boolean,
        default: true
    },
    category: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'category',
            default: null,
        }
    ],
}, {
    timestamps: true
})

productSchema.index({
    name: "text",
    description: "text"
}, {
    name: 10,
    description: 5
})

productSchema.pre("save", function (next) {
    if (!this.slug && this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

const ProductModel = mongoose.model('product', productSchema)

export default ProductModel
