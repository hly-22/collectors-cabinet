import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

type CloudinaryUploadResult = {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    resource_type: "image" | "video" | "raw" | string;
}

function formatTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
}

function uploadToCloudinary(buffer: Buffer, publicId: string) {
    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "artwork-collection",
                resource_type: "image",
                public_id: publicId,
            },
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error("Cloudinary returned no result"));
                resolve(result as unknown as CloudinaryUploadResult);
            }
        )

        stream.end(buffer);
    })
}

export async function POST(req: Request) {
    try {
        const form = await req.formData();
        const file = form.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: 'Missing "file" in form-data' },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const filename = file.name.replace(/\.[^/.]+$/, "");
        const publicId = `${formatTimestamp()}-${filename}`;

        const result = await uploadToCloudinary(buffer, publicId);

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
        });

    } catch (error) {
        console.error("[POST /api/upload]", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}