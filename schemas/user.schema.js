import {z} from "zod";

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const regexName = /^[a-zA-Z0-9 _-]+$/

export const registerSchema = z
    .object({
        name: z.string().min(2).max(32).regex(regexName, 'invalid name'),
        email: z.string().regex(regexEmail, 'invalid email'),
        password: z.string().min(6).max(32),
        confirmPassword: z.string().min(6).max(32),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "confirm password not match",
    });

export const loginSchema = z
    .object({
        email: z.string().regex(regexEmail, 'invalid email'),
        password: z.string().min(6).max(32),
    });
