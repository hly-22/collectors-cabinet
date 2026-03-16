import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { UpdateArtistSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

// Extract public_id from Cloudinary URL
function extractPublicId(url: string): string {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return "";

    let after = url.slice(uploadIndex + "/upload/".length);
    after = after.replace(/^v\d+\//, "");

    const dotIndex = after.lastIndexOf(".");
    if (dotIndex !== -1) {
        after = after.slice(0, dotIndex);
    }

    return after;
}

async function deleteFromCloudinary(url: string) {
    const publicId = extractPublicId(url);
    if (!publicId) return;

    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (err) {
        console.error(`Failed to delete Cloudinary asset: ${publicId}`, err);
    }
}

// GET artist by id
export async function GET(
    _req: Request,
    { params }: RouteParams,
) {
    const { id } = await params;
    const artistId = Number(id);

    if (Number.isNaN(artistId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
        const artist = await prisma.artist.findUnique({
            where: { id: artistId },
            include: { artworks: true },
        });

        if (!artist) {
            return NextResponse.json({ error: "Artist not found" }, { status: 404 });
        }

        return NextResponse.json(artist);
    } catch (error) {
        console.error("[GET /api/artists/:id]", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

}

// Update artist
export async function PUT(
    req: Request,
    { params }: RouteParams,
) {
    const { id } = await params;
    const artistId = Number(id);

    if (Number.isNaN(artistId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const parsed = UpdateArtistSchema.safeParse(body);

        if (!parsed.success) {
            const tree = z.treeifyError(parsed.error);
            return NextResponse.json(
                { error: "Invalid payload", issues: tree },
                { status: 400 }
            );
        }

        const existing = await prisma.artist.findUnique({
            where: { id: artistId },
        });

        if (!existing) {
            return NextResponse.json({ error: "Artist not found" }, { status: 404 });
        }

        const updated = await prisma.artist.update({
            where: { id: artistId },
            data: {
                name: parsed.data.name,
                description: parsed.data.description ?? null,
            },
        });
        revalidatePath('/', 'layout');
        revalidatePath(`/artists/${artistId}`);

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PUT /api/artists/:id]", error);
        return NextResponse.json({ error: "Failed to update artist" }, { status: 500 });
    }
}

// Delete artist and all their artworks + Cloudinary assets
export async function DELETE(
    _req: Request,
    { params }: RouteParams
) {
    const { id } = await params;
    const artistId = Number(id);

    if (Number.isNaN(artistId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
        // Fetch artist with all artworks and their image URLs
        const artist = await prisma.artist.findUnique({
            where: { id: artistId },
            include: { artworks: true },
        });

        if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

        // Delete artist + all artworks from DB (cascade)
        // We delete the artist which cascades to artworks via Prisma relation
        await prisma.artwork.deleteMany({ where: { artistId } });
        await prisma.artist.delete({ where: { id: artistId } });

        // Collect all Cloudinary URLs from all artworks
        const cloudinaryDeletions: Promise<void>[] = [];
        for (const artwork of artist.artworks) {
            if (artwork.mainImageUrl) cloudinaryDeletions.push(deleteFromCloudinary(artwork.mainImageUrl));
            if (artwork.certificationUrl) cloudinaryDeletions.push(deleteFromCloudinary(artwork.certificationUrl));
            for (const url of artwork.additionalImageUrls) {
                cloudinaryDeletions.push(deleteFromCloudinary(url));
            };
        }

        await Promise.allSettled(cloudinaryDeletions);
        revalidatePath('/', 'layout');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/artists/:id]", error);
        return NextResponse.json({ error: "Failed to delete artist" }, { status: 500 });
    }
}
