import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";

import CategoryModel from "./models/category.model.js";

dotenv.config();

const buildImagePath = (folder, filename) => {
    return `${process.env.SERVER_URL}/${folder}/${filename}`;
};

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected to mongodb");

        await CategoryModel.deleteMany({});

        const categories = [
            {
                name: "Atta, Rice & Dal",
                image: buildImagePath('category', 'Atta, Rice & Dal.png'),
                subcategories: [
                    {
                        name: "Atta",
                        image: buildImagePath('sub-category/Atta, Rice & Dal', 'Atta.jpg'),
                    },
                    {
                        name: "Besan, Sooji & Maida",
                        image: buildImagePath('sub-category/Atta, Rice & Dal', 'Besan, Sooji & Maida.webp'),
                    },
                    {
                        name: "Millet & Other Flours",
                        image: buildImagePath('sub-category/Atta, Rice & Dal', 'Millet & Other Flours.webp'),
                    },
                    {
                        name: "Moong & Masoor",
                        image: buildImagePath('sub-category/Atta, Rice & Dal', 'Moong & Masoor.webp'),
                    },
                    {
                        name: "Poha, Daliya & Other Grains",
                        image: buildImagePath('sub-category/Atta, Rice & Dal', 'Poha, Daliya & Other Grains.jpg'),
                    },
                    {
                        name: "Rajma, Chhole & Others",
                        image: buildImagePath('sub-category/Atta, Rice & Dal', 'Rajma, Chhole & Others.webp'),
                    },
                    {
                        name: "Rice",
                        image: buildImagePath('sub-category/Atta, Rice & Dal', 'Rice.webp'),
                    },
                    {
                        name: "Toor, Urad & Chana",
                        image: buildImagePath('sub-category/Atta, Rice & Dal', 'Toor, Urad & Chana.webp'),
                    },
                ],
            },
            {
                name: "Baby Care",
                image: buildImagePath('category', 'Baby Care.png'),
                subcategories: [],
            },
            {
                name: "Bakery & Biscuits",
                image: buildImagePath('category', 'Bakery & Biscuits.png'),
                subcategories: [],
            },
            {
                name: "Breakfast & Instant Food",
                image: buildImagePath('category', 'Breakfast & Instant Food.png'),
                subcategories: [],
            },
        ];

        for (const category of categories) {
            const parent = await CategoryModel.create({
                name: category.name,
                slug: category.slug || slugify(category.name, { lower: true, strict: true }),
                image: category.image,
            });

            if (category.subcategories?.length) {
                const subs = category.subcategories.map((sub) => ({
                    ...sub,
                    slug: sub.slug || slugify(sub.name, { lower: true, strict: true }),
                    parent: parent._id,
                }));

                await CategoryModel.insertMany(subs);
            }
        }

        console.log("seed category successfully created");
    } catch (err) {
        console.error("error seed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("disconnected to mongodb");
    }
};

seedCategories();
