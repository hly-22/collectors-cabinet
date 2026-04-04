import { deleteFromCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { UpdateArtistSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

// GET artist by id
export async function GET(
    _req: Request,
    { params }: RouteParams,
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "ID does not exist" }, { status: 400 });
    };

    try {
        const artist = await prisma.artist.findUnique({
            where: { id },
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

    if (!id) {
        return NextResponse.json({ error: "ID does not exist" }, { status: 400 });
    };

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
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Artist not found" }, { status: 404 });
        }

        const updated = await prisma.artist.update({
            where: { id },
            data: {
                name: parsed.data.name,
                description: parsed.data.description !== undefined ? parsed.data.description : existing.description,
            },
        });
        revalidatePath('/', 'layout');
        revalidatePath(`/artists/${id}`);

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

    if (!id) {
        return NextResponse.json({ error: "ID does not exist" }, { status: 400 });
    };

    try {
        // Fetch artist with all artworks and their image URLs
        const artist = await prisma.artist.findUnique({
            where: { id },
            include: { artworks: true },
        });

        if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

        // Delete artist + all artworks from DB (cascade)
        // We delete the artist which cascades to artworks via Prisma relation
        await prisma.artist.delete({ where: { id } });

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
