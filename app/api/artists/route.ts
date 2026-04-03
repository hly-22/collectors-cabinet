import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { CreateArtistSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

// get all artists
export async function GET() {
    try {
        const artists = await prisma.artist.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json(artists);
    } catch (error) {
        console.error("[GET /api/artists]", error);
        return NextResponse.json(
            { error: "Failed to fetch artists" },
            { status: 500 },
        );
    }
}

// add an artist
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const parsed = CreateArtistSchema.safeParse(body);
        if (!parsed.success) {
            const tree = z.treeifyError(parsed.error);
            return NextResponse.json(
                { error: "Invalid payload", issues: tree },
                { status: 400 },
            )
        }

        const data = parsed.data;

        const artist = await prisma.artist.create({
            data: {
                name: data.name,
                description: data.description ?? null,
            }
        })
        revalidatePath('/', 'layout');

        return NextResponse.json(artist, { status: 201 });
    } catch (error) {
        console.error("[POST /api/artists]", error);
        return NextResponse.json(
            { error: "Failed to create artist" },
            { status: 500 },
        )
    }
}