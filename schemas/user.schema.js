import {z} from "zod";
import {RegexPatterns} from "../constants/regex.js";

class AuthSchema {
    constructor() {
        this.nameSchema = z
            .string()
            .min(2, {message: "name must be at least 2 characters"})
            .max(32, {message: "name must be at most 32 characters"})
            .regex(RegexPatterns.name, {message: "invalid name"});

        this.emailSchema = z
            .string()
            .email({message: "invalid email"});

        this.passwordSchema = z
            .string()
            .min(6, {message: "password too short"})
            .max(32, {message: "password too long"});

        this.registerSchema = z
            .object({
                name: this.nameSchema,
                email: this.emailSchema,
                password: this.passwordSchema,
                confirmPassword: this.passwordSchema,
            })
            .refine((data) => {
                return data.password === data.confirmPassword;
            }, {
                message: "confirm password not match",
                path: ["confirmPassword"],
            });

        this.loginSchema = z.object({
            email: this.emailSchema,
            password: this.passwordSchema,
        });
    }
}

export default new AuthSchema();
