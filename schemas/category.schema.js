import {z} from "zod";
import {RegexPatterns} from "../constants/regex.js";

export const createCategorySchema = z.object({
    name: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.name, 'name invalid'),
    image: z
        .string()
        .nullable()
        .optional(),
    parent: z
        .string()
        .regex(RegexPatterns.id, "id invalid")
        .nullable()
        .optional(),
});

export const updateCategorySchema = z.object({
    name: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.name, 'name invalid')
        .optional(),
    image: z
        .string()
        .nullable()
        .optional(),
    parent: z
        .string()
        .regex(RegexPatterns.id, "id invalid")
        .nullable()
        .optional(),
});
