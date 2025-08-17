import dotenv from "dotenv";
import slugify from "slugify";
import fs from 'fs';
import path from 'path';

import Database from "./configs/connectDb.js";
import CategoryModel from "./models/category.model.js";
import ProductModel from "./models/product.model.js";

dotenv.config();

const CATEGORY_PATH = './public/category';
const SUB_CATEGORY_PATH = './public/sub-category';
const PRODUCT_PATH = './public/product'
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const buildImagePath = (folder, filename) => {
    return `${process.env.SERVER_URL}/${folder}/${filename}`;
};

function scanAllCategories() {
    const categoryImages = fs.readdirSync(CATEGORY_PATH);
    const categories = [];

    categoryImages.forEach(file => {
        const ext = path.extname(file);
        const title = path.basename(file, ext);
        const slug = slugify(title, { lower: true, strict: true });
        const subCatFolder = path.join(SUB_CATEGORY_PATH, title);

        let subCategories = [];

        if (fs.existsSync(subCatFolder) && fs.statSync(subCatFolder).isDirectory()) {
            const subImages = fs.readdirSync(subCatFolder).filter(f => {
                const ext = path.extname(f).toLowerCase();
                return imageExtensions.includes(ext);
            });

            subCategories = subImages.map(sub => {
                const subName = path.basename(sub, path.extname(sub));
                return {
                    title: subName,
                    slug: slugify(subName, { lower: true, strict: true }),
                    description: "",
                    color: "#a569bd",
                    icon: "fas fa-edit",
                    image: buildImagePath(`sub-category/${title}`, sub)
                };
            });
        }

        categories.push({
            title: title,
            slug: slug,
            description: "",
            color: "#a569bd",
            icon: "fas fa-edit",
            image: buildImagePath('category', file),
            subCategories
        });
    });

    return categories;
}

function scanAllProducts(root) {
    const products = [];

    const catDirs = fs.readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory());

    catDirs.forEach(cat => {
        const catPath = path.join(root, cat.name);
        const subCatDirs = fs.readdirSync(catPath, { withFileTypes: true }).filter(d => d.isDirectory());

        subCatDirs.forEach(sub => {
            const subPath = path.join(catPath, sub.name);
            const productDirs = fs.readdirSync(subPath, { withFileTypes: true }).filter(d => d.isDirectory());

            productDirs.forEach(prod => {
                const prodPath = path.join(subPath, prod.name);
                const images = fs.readdirSync(prodPath)
                    .filter(f => imageExtensions.includes(path.extname(f).toLowerCase()))
                    .map(file => ({
                        src: buildImagePath(`product/${cat.name}/${sub.name}/${prod.name}`, file),
                        alt: slugify(path.basename(file, path.extname(file)), { lower: true, strict: true }),
                    }));

                products.push({
                    title: prod.name,
                    slug: slugify(prod.name, { lower: true, strict: true }),
                    images: images,
                    unit: 10,
                    stock: 10,
                    price: 20,
                    discount: 0,
                    description: slugify(prod.name, { lower: true, strict: true }),
                    moreDetails: {},
                    publish: true,
                    category: sub.name,
                });
            });
        });
    });

    return products;
}

async function saveCategoryFromJson() {
    try {
        await CategoryModel.deleteMany({});

        // Read JSON
        const data = JSON.parse(fs.readFileSync('./data/categories.json', 'utf-8'));

        for (const cat of data) {
            const parentDoc = await CategoryModel.create({
                title: cat.title,
                slug: cat.slug,
                image: cat.image,
                description: "",
                color: "#a569bd",
                icon: "fas fa-edit",
                parent: null,
            });
            console.log(`category: ${cat.title}`);
            for (const sub of cat.subCategories) {
                await CategoryModel.create({
                    title: sub.title,
                    slug: sub.slug,
                    image: sub.image,
                    description: "",
                    color: "#a569bd",
                    icon: "fas fa-edit",
                    parent: parentDoc._id
                });
                console.log(`sub-category: ${sub.title}`);
            }
        }
    } catch (err) {
        console.error("error:", err);
    }
}

async function saveProductFromJson() {
    try {
        await ProductModel.deleteMany({});

        // Read JSON
        const data = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));

        for (const item of data) {
            let categoryDoc = await CategoryModel.findOne({ title: item.category });

            if (!categoryDoc) {
                categoryDoc = new CategoryModel({
                    title: item.category,
                    slug: slugify(item.category, { lower: true, strict: true }),
                    image: null,
                    description: "",
                    color: "#a569bd",
                    icon: "fas fa-edit",
                    parent: null,
                });

                await categoryDoc.save();
                console.log(`category: ${item.category}`);
            }

            const product = new ProductModel({
                ...item,
                category: [categoryDoc._id],
            });

            await product.save();
            console.log(`product: ${item.title}`);
        }
    } catch (err) {
        console.error("error:", err);
    }
}

const dataCategories = scanAllCategories();
fs.writeFileSync('./data/categories.json', JSON.stringify(dataCategories, null, 2), 'utf-8');
console.log('created file: categories.json');

const dataProducts = scanAllProducts(PRODUCT_PATH);
fs.writeFileSync('./data/products.json', JSON.stringify(dataProducts, null, 2), 'utf-8');
console.log('created file: products.json');

async function main() {
    try {
        await Database.connect();

        await saveCategoryFromJson();
        console.log('Created categories!');

        await saveProductFromJson();
        console.log('Created products!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await Database.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

main();
