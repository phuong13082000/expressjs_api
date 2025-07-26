import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
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

categorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const CategoryModel = mongoose.model('category', categorySchema)

export default CategoryModel
