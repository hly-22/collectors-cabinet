import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { UpdateArtworkSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import z from "zod";

type RouteParams = { params: Promise<{ id: string }> };

// Extract public_id from Cloudinary URL
function extractPublicId(url: string): string {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return "";

    let after = url.slice(uploadIndex + "/upload/".length);

    // Remove version segment if presented
    after = after.replace(/^v\d+\//, "");

    // Remove file extension
    const dotIndex = after.lastIndexOf(".");
    if (dotIndex !== -1) {
        after = after.slice(0, dotIndex);
    }

    return after;
}

// Delete a single asset from Cloudinary, detect if it's raw (PDF) or image
async function deleteFromCloudinary(url: string) {
    const publicId = extractPublicId(url);
    if (!publicId) return;

    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (error) {
        console.error(`Failed to delete Cloudinary asset: ${publicId}`, error);
    }
}


// Get artwork by ID
export async function GET(
    _req: Request,
    { params }: RouteParams,
) {
    const { id: idString } = await params;
    const id = Number(idString);

    if (Number.isNaN(id)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
        const artwork = await prisma.artwork.findUnique({
            where: { id },
            include: { artist: true },
        });

        if (!artwork) {
            return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
        }

        return NextResponse.json(artwork);
    } catch (error) {
        console.error("[GET /api/artworks/:id]", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// Edit artwork by ID
export async function PUT(
    req: Request,
    { params }: RouteParams,
) {
    try {
        const { id } = await params;
        const artworkId = Number(id);

        if (Number.isNaN(artworkId)) {
            return NextResponse.json({ error: "Invalid artwork ID" }, { status: 400 });
        };

        const body = await req.json();
        const parsed = UpdateArtworkSchema.safeParse(body);

        if (!parsed.success) {
            const tree = z.treeifyError(parsed.error);
            return NextResponse.json(
                { error: "Invalid payload", issues: tree },
                { status: 400 },
            );
        };

        const data = parsed.data;

        const existing = await prisma.artwork.findUnique({
            where: { id: artworkId },
        });

        if (!existing) {
            return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
        }

        const updated = await prisma.artwork.update({
            where: { id: artworkId },
            data: {
                title: data.title,
                medium: data.medium,
                year: data.year ?? existing.year,
                mainImageUrl: data.mainImageUrl !== undefined ? data.mainImageUrl : existing.mainImageUrl,
                certificationUrl: data.certificationUrl !== undefined ? data.certificationUrl : existing.certificationUrl,
                additionalImageUrls: data.additionalImageUrls ?? existing.additionalImageUrls,
                dimensions: data.dimensions ?? existing.dimensions ?? {},
                status: data.status ?? existing.status,
                location: data.location !== undefined ? data.location : existing.location,
                purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : existing.purchasePrice,
                currency: data.currency ?? existing.currency,
                notes: data.notes !== undefined ? data.notes : existing.notes,
            },
            include: { artist: true },
        });

        // Clean up replaced/removed Cloudinary assets
        const cloudinaryDeletions: Promise<void>[] = [];

        if (existing.mainImageUrl && existing.mainImageUrl !== data.mainImageUrl) {
            cloudinaryDeletions.push(deleteFromCloudinary(existing.mainImageUrl));
        }
        if (existing.certificationUrl && existing.certificationUrl !== data.certificationUrl) {
            cloudinaryDeletions.push(deleteFromCloudinary(existing.certificationUrl));
        }
        if (data.additionalImageUrls) {
            const removedUrls = (existing.additionalImageUrls as string[]).filter(
                (url) => !data.additionalImageUrls!.includes(url)
            );
            for (const url of removedUrls) {
                cloudinaryDeletions.push(deleteFromCloudinary(url));
            }
        }
        await Promise.allSettled(cloudinaryDeletions);

        revalidatePath('/', 'layout');
        revalidatePath(`/artworks/${artworkId}`);
        return NextResponse.json(updated, { status: 200 });

    } catch (error) {
        console.error("[PUT /api/artworks/:id]", error);
        return NextResponse.json(
            { error: "Failed to update artwork" },
            { status: 500 }
        );
    }
}

// Delete artwork by ID
export async function DELETE(
    _req: Request,
    { params }: RouteParams,
) {
    const { id: idString } = await params;
    const artworkId = Number(idString);

    if (Number.isNaN(artworkId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
        const artwork = await prisma.artwork.findUnique({
            where: { id: artworkId },
        });

        if (!artwork) {
            return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
        }

        // Delete DB record first
        await prisma.artwork.delete({ where: { id: artworkId } });

        // Then delete assests one by one
        const cloudinaryDeletions: Promise<void>[] = [];

        if (artwork.mainImageUrl) cloudinaryDeletions.push(deleteFromCloudinary(artwork.mainImageUrl));
        if (artwork.certificationUrl) cloudinaryDeletions.push(deleteFromCloudinary(artwork.certificationUrl));
        for (const url of artwork.additionalImageUrls) {
            cloudinaryDeletions.push(deleteFromCloudinary(url));
        }

        await Promise.allSettled(cloudinaryDeletions);
        revalidatePath('/', 'layout');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/artworks/:id]", error);
        return NextResponse.json({ error: "Unable to delete artwork." }, { status: 500 });
    }
}