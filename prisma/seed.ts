import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
    console.log("🌱 Starting database seed...");

    // ------------------------------------------------------
    // Seed Artists
    // ------------------------------------------------------
    await prisma.artist.createMany({
        data: [
            {
                name: "Vincent van Gogh",
                description:
                    "Dutch Post-Impressionist painter known for bold colors and dramatic brushwork.",
            },
            {
                name: "Claude Monet",
                description:
                    "Founder of French Impressionism, known for his landscape series.",
            },
            {
                name: "Pablo Picasso",
                description:
                    "Spanish painter, co-founder of Cubism and influential 20th-century artist.",
            },
            {
                name: "Yayoi Kusama",
                description:
                    "Contemporary Japanese artist known for polka dots and infinity rooms.",
            },
        ],
    });

    console.log("✔️ Artists created");

    // Fetch all artists with IDs
    const artistList = await prisma.artist.findMany();

    // Helpers
    const rand = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    const getRandomArtistId = () => rand(artistList).id;

    // Random placeholder images
    const randomImage = () =>
        `https://picsum.photos/seed/${Math.floor(Math.random() * 10000)}/800/600`;

    // ------------------------------------------------------
    // Seed Artworks
    // ------------------------------------------------------
    const artworkData = [
        {
            title: "Starry Night",
            artistId: getRandomArtistId(),
            medium: "Oil on canvas",
            dimensions: { width: 74, height: 92, unit: "cm" },
            year: "1889",
            mainImageUrl: randomImage(),
            additionalImageUrls: [randomImage(), randomImage()],
            certificationUrl: randomImage(),
            status: "IN_HOME" as const,
            location: "Living Room",
            purchasePrice: "1200000.00",
            currency: "USD" as const,
            notes: "One of the most iconic paintings.",
        },
        {
            title: "Water Lilies",
            artistId: getRandomArtistId(),
            medium: "Oil on canvas",
            dimensions: { width: 200, height: 180, unit: "cm" },
            year: "1916",
            mainImageUrl: randomImage(),
            additionalImageUrls: [],
            certificationUrl: randomImage(),
            status: "IN_STORAGE" as const,
            location: "Basement Storage",
            purchasePrice: "850000.00",
            currency: "USD" as const,
            notes: null,
        },
        {
            title: "Les Demoiselles d'Avignon",
            artistId: getRandomArtistId(),
            medium: "Oil on canvas",
            dimensions: { width: 243, height: 233, unit: "cm" },
            year: "1907",
            mainImageUrl: randomImage(),
            additionalImageUrls: [randomImage()],
            certificationUrl: randomImage(),
            status: "ON_LOAN" as const,
            location: "Loaned to Museum of Modern Art",
            purchasePrice: "700000.00",
            currency: "USD" as const,
            notes: "Key work in the development of Cubism.",
        },
        {
            title: "Infinity Mirror Room",
            artistId: getRandomArtistId(),
            medium: "Mixed media installation",
            dimensions: {},
            year: "2013",
            mainImageUrl: randomImage(),
            additionalImageUrls: [],
            certificationUrl: randomImage(),
            status: "IN_EXHIBITION" as const,
            location: "Tokyo Exhibition Hall",
            purchasePrice: null,
            currency: "USD" as const,
            notes: "Installation piece; dimensions vary by exhibition.",
        },
    ];

    await Promise.all(
        artworkData.map((data) => prisma.artwork.create({ data }))
    );

    console.log("✔️ Artworks created");
    console.log("🌱 Seed finished!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
