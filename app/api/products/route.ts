import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Fetch all products
export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("[GET_PRODUCTS]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// POST - Create new product
export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body || typeof body !== "object") {
            return new NextResponse("Invalid request payload", { status: 400 });
        }

        const {
            title,
            description,
            price,
            inventory,
            category,
            tags,
            barcode,
            imageUrl,
            imagePublicId,
        } = body;

        // Generate a unique barcode if not provided
        let finalBarcode = barcode || crypto.randomUUID().slice(0, 6);

        let existing = await prisma.product.findUnique({
            where: { barcode: finalBarcode },
        });

        while (existing) {
            finalBarcode = crypto.randomUUID().slice(0, 6);
            existing = await prisma.product.findUnique({
                where: { barcode: finalBarcode },
            });
        }

        const newProduct = await prisma.product.create({
            data: {
                title,
                description,
                price,
                inventory,
                category,
                tags,
                barcode: finalBarcode,
                imageUrl,
                imagePublicId,
            },
        });

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error: any) {
        console.error("[CREATE_PRODUCT]", error);
        return new NextResponse(error.message || "Error creating product", {
            status: 500,
        });
    }
}

// PUT - Update a product
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params; // Get id from URL
        const body = await req.json();
        const {
            title,
            description,
            price,
            inventory,
            category,
            tags,
            barcode,
            imageUrl,
            imagePublicId,
        } = body;

        // Validate required fields
        if (!id || !title || !description || !category) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return new NextResponse("Product not found", { status: 404 });
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                title,
                description,
                price,
                inventory,
                category,
                tags,
                barcode,
                imageUrl: imageUrl ?? existingProduct.imageUrl, // Preserve existing if not provided
                imagePublicId: imagePublicId ?? existingProduct.imagePublicId, // Preserve existing
            },
        });

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error("[UPDATE_PRODUCT]", error);
        return new NextResponse(error.message || "Error updating product", {
            status: 500,
        });
    }
}

// DELETE - Delete a product
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        await prisma.product.delete({
            where: { id },
        });

        return new NextResponse("Product deleted successfully");
    } catch (error: any) {
        console.error("[DELETE_PRODUCT]", error);
        return new NextResponse(error.message || "Error deleting product", {
            status: 500,
        });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, barcode } = body;

        if (!id || !barcode) {
            return new NextResponse("Product ID and barcode are required", {
                status: 400,
            });
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                barcode,
            },
        });

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error("[UPDATE_BARCODE]", error);
        return new NextResponse(error.message || "Error updating barcode", {
            status: 500,
        });
    }
}
