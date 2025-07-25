import {z} from "zod";

export const createCategorySchema = z.object({
    name: z
        .string()
        .min(2)
        .max(64)
        .regex(/^[a-zA-Z0-9 _-]+$/, 'name invalid'),
    slug: z
        .string()
        .min(2)
        .regex(/^[a-z0-9-]+$/, "slug invalid"),
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
    slug: z
        .string()
        .min(2)
        .regex(/^[a-z0-9-]+$/, "slug invalid")
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
