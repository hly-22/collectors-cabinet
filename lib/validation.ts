import z from "zod";
import { ArtworkStatus, Currency } from "./enums";

export const DimensionsSchema = z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    unit: z.string().optional(),
});

export const CreateArtworkSchema = z.object({
    title: z.string().min(1, "Title is required"),
    artistId: z.uuid(),
    medium: z.string().optional(),
    dimensions: DimensionsSchema.optional(),
    year: z.string()
        .min(1, "Year is required")
        .regex(/^\d{1,4}$/, "Year must be a number"),
    description: z.string().optional(),
    mainImageUrl: z.url().optional(),
    additionalImageUrls: z.array(z.url()).optional(),
    certificationUrl: z.url(),
    status: ArtworkStatus.optional(),
    location: z.string().optional(),
    purchasePrice: z.string()
        .regex(/^\d+(\.\d{1,2})?$/, "Purchase price must be a valid number")
        .optional(),
    currency: Currency.optional(),
    notes: z.string().optional(),
});

export const UpdateArtworkSchema = z.object({
    title: z.string().min(1, "Title is required"),
    medium: z.string().optional(),
    dimensions: DimensionsSchema.optional(),
    year: z.string()
        .min(1, "Year is required")
        .regex(/^\d{1,4}$/, "Year must be a number"),
    description: z.string().nullable().optional(),
    mainImageUrl: z.url().nullable().optional(),
    additionalImageUrls: z.array(z.url()).optional(),
    certificationUrl: z.url().optional(),
    status: ArtworkStatus.optional(),
    location: z.string().nullable().optional(),
    purchasePrice: z.string()
        .regex(/^\d+(\.\d{1,2})?$/, "Purchase price must be a valid number")
        .optional(),
    currency: Currency.optional(),
    notes: z.string().nullable().optional(),
});

export const CreateArtistSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
});

export const UpdateArtistSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().nullable().optional(),
});