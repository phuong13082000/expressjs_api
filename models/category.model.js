import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            unique: true
        },
        description: String,
        color: String,
        icon: String,
        image: {
            type: String,
            default: null
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
            default: null,
        },
    },
    {timestamps: true}
);

categorySchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const CategoryModel = mongoose.model('category', categorySchema)

export default CategoryModel
