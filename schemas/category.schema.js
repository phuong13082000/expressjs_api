import {z} from "zod";

export const createCategorySchema = z.object({
    name: z
        .string()
        .min(2)
        .max(64)
        .regex(/^[a-zA-Z0-9 _-]+$/, 'name invalid'),
    image: z
        .string()
        .nullable()
        .optional(),
    parent: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "id invalid")
        .nullable()
        .optional(),
});

export const updateCategorySchema = z.object({
    name: z
        .string()
        .min(2)
        .max(64)
        .regex(/^[a-zA-Z0-9 _-]+$/, 'name invalid')
        .optional(),
    image: z
        .string()
        .nullable()
        .optional(),
    parent: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "id invalid")
        .nullable()
        .optional(),
});
