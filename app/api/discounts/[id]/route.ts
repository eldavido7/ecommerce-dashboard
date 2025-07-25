import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET a single discount
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; // Await the params object

        const discount = await prisma.discount.findUnique({
            where: { id },
            include: {
                products: true, // 👈 include related products
            },
        });
        if (!discount) {
            return NextResponse.json({ error: "Discount not found" }, { status: 404 });
        }
        return NextResponse.json(discount);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch discount" }, { status: 500 });
    }
}

// UPDATE a discount
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const {
            code,
            description,
            type,
            value,
            usageLimit,
            startsAt,
            endsAt,
            isActive,
            minSubtotal,
            productIds,
        } = body;

        // First, update the discount fields
        const updatedDiscount = await prisma.discount.update({
            where: { id },
            data: {
                code,
                description,
                type,
                value,
                usageLimit,
                startsAt: new Date(startsAt),
                endsAt: endsAt ? new Date(endsAt) : undefined,
                isActive,
                minSubtotal,
                products: productIds
                    ? {
                        set: productIds.map((pid: string) => ({ id: pid })), // overwrite existing links
                    }
                    : undefined,
            },
            include: {
                products: true,
            },
        });

        return NextResponse.json(updatedDiscount);
    } catch (error) {
        console.error("[DISCOUNT_PATCH]", error);
        return NextResponse.json({ error: "Failed to update discount" }, { status: 500 });
    }
}

// DELETE a discount
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; // Await the params object

        await prisma.discount.delete({ where: { id } });
        return NextResponse.json({ message: "Discount deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete discount" }, { status: 500 });
    }
}
