import {z} from "zod";
import {RegexPatterns} from "../constants/regex.js";

export const registerSchema = z.object({
    name: z
        .string()
        .min(2)
        .max(32)
        .regex(RegexPatterns.name, 'invalid name'),
    email: z
        .string()
        .regex(RegexPatterns.email, 'invalid email'),
    password: z
        .string()
        .min(6)
        .max(32),
    confirmPassword: z
        .string()
        .min(6)
        .max(32),
}).refine((data) => {
    return data.password === data.confirmPassword;
}, {
    path: ["confirmPassword"],
    message: "confirm password not match",
});

export const loginSchema = z.object({
    email: z
        .string()
        .regex(RegexPatterns.email, 'invalid email'),
    password: z
        .string()
        .min(6)
        .max(32),
});
