import z from "zod";

export const ArtworkStatus = z.enum([
    "IN_HOME",
    "IN_STORAGE",
    "ON_LOAN",
    "IN_EXHIBITION",
]);

export const Currency = z.enum(["USD", "VND"]);

export const DimensionsSchema = z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    unit: z.string().optional(),
});

export const CreateArtworkSchema = z.object({
    title: z.string().min(1),
    artistId: z.number().int().positive(),
    medium: z.string().min(1),
    dimensions: DimensionsSchema,
    year: z.string().min(1),
    mainImageUrl: z.url(),
    additionalImageUrls: z.array(z.url()).optional(),
    certificationUrl: z.url(),
    status: ArtworkStatus.optional(),
    location: z.string().optional(),
    purchasePrice: z.string().optional(),
    currency: Currency.optional(),
    notes: z.string().optional(),
});

export const UpdateArtworkSchema = z.object({
    title: z.string().min(1),
    medium: z.string().min(1),
    year: z.string().optional(),
    mainImageUrl: z.url().optional(),
    certificationUrl: z.url().optional(),
    additionalImageUrls: z.array(z.url()).optional(),
    dimensions: DimensionsSchema.optional(),
    status: ArtworkStatus.optional(),
    location: z.string().nullable().optional(),
    purchasePrice: z.string().nullable().optional(),
    currency: Currency.optional(),
    notes: z.string().nullable().optional(),
});

export const CreateArtistSchema = z.object({
    name: z.string().min(1),
    description: z.string().nullable().optional(),
});

export const UpdateArtistSchema = z.object({
    name: z.string().min(1),
    description: z.string().nullable().optional(),
});