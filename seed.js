import mongoose from "mongoose";
import dotenv from "dotenv";
import CategoryModel from "./models/category.model.js";

dotenv.config();

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected to mongodb");

        await CategoryModel.deleteMany({});

        const categories = [
            {
                name: "Business & Money",
                slug: "business-money",
                subcategories: [
                    { name: "Accounting", slug: "accounting" },
                    { name: "Entrepreneurship", slug: "entrepreneurship" },
                    { name: "Gigs & Side Projects", slug: "gigs-side-projects" },
                    { name: "Investing", slug: "investing" },
                    { name: "Management & Leadership", slug: "management-leadership" },
                    { name: "Marketing & Sales", slug: "marketing-sales" },
                    { name: "Networking, Careers & Jobs", slug: "networking-careers-jobs" },
                    { name: "Personal Finance", slug: "personal-finance" },
                    { name: "Real Estate", slug: "real-estate" },
                ],
            },
            {
                name: "Software Development",
                slug: "software-development",
                subcategories: [
                    { name: "Web Development", slug: "web-development" },
                    { name: "Mobile Development", slug: "mobile-development" },
                    { name: "Game Development", slug: "game-development" },
                    { name: "Programming Languages", slug: "programming-languages" },
                    { name: "DevOps", slug: "devops" },
                ],
            },
            {
                name: "Writing & Publishing",
                slug: "writing-publishing",
                subcategories: [
                    { name: "Fiction", slug: "fiction" },
                    { name: "Non-Fiction", slug: "non-fiction" },
                    { name: "Blogging", slug: "blogging" },
                    { name: "Copywriting", slug: "copywriting" },
                    { name: "Self-Publishing", slug: "self-publishing" },
                ],
            },
            {
                name: "Education",
                slug: "education",
                subcategories: [
                    { name: "Online Courses", slug: "online-courses" },
                    { name: "Tutoring", slug: "tutoring" },
                    { name: "Test Preparation", slug: "test-preparation" },
                    { name: "Language Learning", slug: "language-learning" },
                ],
            },
            {
                name: "Self Improvement",
                slug: "self-improvement",
                subcategories: [
                    { name: "Productivity", slug: "productivity" },
                    { name: "Personal Development", slug: "personal-development" },
                    { name: "Mindfulness", slug: "mindfulness" },
                    { name: "Career Growth", slug: "career-growth" },
                ],
            },
            {
                name: "Fitness & Health",
                slug: "fitness-health",
                subcategories: [
                    { name: "Workout Plans", slug: "workout-plans" },
                    { name: "Nutrition", slug: "nutrition" },
                    { name: "Mental Health", slug: "mental-health" },
                    { name: "Yoga", slug: "yoga" },
                ],
            },
            {
                name: "Design",
                slug: "design",
                subcategories: [
                    { name: "UI/UX", slug: "ui-ux" },
                    { name: "Graphic Design", slug: "graphic-design" },
                    { name: "3D Modeling", slug: "3d-modeling" },
                    { name: "Typography", slug: "typography" },
                ],
            },
            {
                name: "Drawing & Painting",
                slug: "drawing-painting",
                subcategories: [
                    { name: "Watercolor", slug: "watercolor" },
                    { name: "Acrylic", slug: "acrylic" },
                    { name: "Oil", slug: "oil" },
                    { name: "Pastel", slug: "pastel" },
                    { name: "Charcoal", slug: "charcoal" },
                ],
            },
            {
                name: "Music",
                slug: "music",
                subcategories: [
                    { name: "Songwriting", slug: "songwriting" },
                    { name: "Music Production", slug: "music-production" },
                    { name: "Music Theory", slug: "music-theory" },
                    { name: "Music History", slug: "music-history" },
                ],
            },
            {
                name: "Photography",
                slug: "photography",
                subcategories: [
                    { name: "Portrait", slug: "portrait" },
                    { name: "Landscape", slug: "landscape" },
                    { name: "Street Photography", slug: "street-photography" },
                    { name: "Nature", slug: "nature" },
                    { name: "Macro", slug: "macro" },
                ],
            },
        ];

        for (const category of categories) {
            const parent = await CategoryModel.create({
                name: category.name,
                slug: category.slug,
            });

            if (category.subcategories?.length) {
                const subs = category.subcategories.map((sub) => ({
                    ...sub,
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
