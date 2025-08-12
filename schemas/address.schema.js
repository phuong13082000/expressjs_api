import {z} from "zod";
import {RegexPatterns} from "../constants/regex.js";

export const createAddressSchema = z.object({
    addressLine: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.name, 'address invalid'),
    city: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.name, 'city invalid'),
    state: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.name, 'state invalid'),
    pinCode: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.number, 'pin code invalid'),
    country: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.name, 'country invalid'),
    mobile: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.phoneNumber, 'mobile invalid'),
});

export const updateAddressSchema = z.object({
    id: z
        .string()
        .regex(RegexPatterns.id, "id invalid"),
    addressLine: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.name, 'address invalid')
        .optional(),
    city: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.name, 'city invalid')
        .optional(),
    state: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.name, 'state invalid')
        .optional(),
    pinCode: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.number, 'pin code invalid')
        .optional(),
    country: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.name, 'country invalid')
        .optional(),
    mobile: z
        .string()
        .min(2)
        .max(64)
        .regex(RegexPatterns.phoneNumber, 'mobile invalid')
        .optional(),
});
