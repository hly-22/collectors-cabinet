import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { CreateArtworkSchema } from "@/lib/schemas";

// Get all artworks
export async function GET() {
    try {
        const artworks = await prisma.artwork.findMany({
            include: { artist: true },
            orderBy: { id: "asc" },
        })

        return NextResponse.json(artworks);
    } catch (error) {
        console.error("[GET /api/artworks]", error);
        return NextResponse.json(
            { error: "Failed to fetch artworks" },
            { status: 500 },
        );
    }
}

// add an artwork
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const parsed = CreateArtworkSchema.safeParse(body);
        if (!parsed.success) {
            const tree = z.treeifyError(parsed.error);
            return NextResponse.json(
                { error: "Invalid payload", issues: tree },
                { status: 400 },
            )
        }

        const data = parsed.data;

        const created = await prisma.artwork.create({
            data: {
                title: data.title,
                artistId: data.artistId,
                medium: data.medium,
                dimensions: data.dimensions ?? {},
                year: data.year,
                mainImageUrl: data.mainImageUrl,
                additionalImageUrls: data.additionalImageUrls ?? [],
                certificationUrl: data.certificationUrl,
                status: data.status ?? "IN_HOME",
                location: data.location ?? null,
                purchasePrice: data.purchasePrice ?? null,
                currency: data.currency ?? "USD",
                notes: data.notes ?? null,
            },
            include: { artist: true },
        })

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error("[POST /api/artworks]", error);
        return NextResponse.json(
            { error: "Failed to create artwork" },
            { status: 500 }
        );
    }
}