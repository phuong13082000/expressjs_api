import { z } from "zod";
import { RegexPatterns } from "../constants/regex.js";

class AddressSchema {
    constructor() {
        this.addressLineSchema = z
            .string()
            .min(2, { message: "address must be at least 2 characters" })
            .max(64, { message: "address must be at most 64 characters" })
            .regex(RegexPatterns.name, { message: "address invalid" });

        this.citySchema = z
            .string()
            .min(2, { message: "city must be at least 2 characters" })
            .max(64, { message: "city must be at most 64 characters" })
            .regex(RegexPatterns.name, { message: "city invalid" });

        this.stateSchema = z
            .string()
            .min(2, { message: "state must be at least 2 characters" })
            .max(64, { message: "state must be at most 64 characters" })
            .regex(RegexPatterns.name, { message: "state invalid" });

        this.pinCodeSchema = z
            .string()
            .min(2, { message: "pin code too short" })
            .max(64, { message: "pin code too long" })
            .regex(RegexPatterns.number, { message: "pin code invalid" });

        this.countrySchema = z
            .string()
            .min(2, { message: "country must be at least 2 characters" })
            .max(64, { message: "country must be at most 64 characters" })
            .regex(RegexPatterns.name, { message: "country invalid" });

        this.mobileSchema = z
            .string()
            .min(2, { message: "mobile too short" })
            .max(64, { message: "mobile too long" })
            .regex(RegexPatterns.phoneNumber, { message: "mobile invalid" });

        this.idSchema = z
            .string()
            .regex(RegexPatterns.id, { message: "id invalid" });

        // Create
        this.createAddressSchema = z.object({
            addressLine: this.addressLineSchema,
            city: this.citySchema,
            state: this.stateSchema,
            pinCode: this.pinCodeSchema,
            country: this.countrySchema,
            mobile: this.mobileSchema,
        });

        // Update
        this.updateAddressSchema = z.object({
            id: this.idSchema,
            addressLine: this.addressLineSchema.optional(),
            city: this.citySchema.optional(),
            state: this.stateSchema.optional(),
            pinCode: this.pinCodeSchema.optional(),
            country: this.countrySchema.optional(),
            mobile: this.mobileSchema.optional(),
        });
    }
}

export default new AddressSchema();
