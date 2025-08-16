import { z } from "zod";
import { RegexPatterns } from "../constants/regex.js";

class CategorySchema {
    constructor() {
        this.nameSchema = z
            .string()
            .min(2, { message: "name must be at least 2 characters" })
            .max(64, { message: "name must be at most 64 characters" })
            .regex(RegexPatterns.name, { message: "name invalid" });

        this.imageSchema = z
            .string()
            .nullable()
            .optional();

        this.parentSchema = z
            .string()
            .regex(RegexPatterns.id, { message: "id invalid" })
            .nullable()
            .optional();

        // Create
        this.createCategorySchema = z.object({
            name: this.nameSchema,
            image: this.imageSchema,
            parent: this.parentSchema,
        });

        // Update
        this.updateCategorySchema = z.object({
            name: this.nameSchema.optional(),
            image: this.imageSchema,
            parent: this.parentSchema,
        });
    }
}

export default new CategorySchema();
