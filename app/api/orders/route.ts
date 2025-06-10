import { prisma } from "@/lib/prisma";
import { Discount } from "@/types";
import { NextResponse } from "next/server";

// Get all orders
export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: { product: true },
                },
                discount: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(orders);
    } catch (error) {
        console.error("[GET_ORDERS]", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

// Create a new order
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            state,
            postalCode,
            country,
            items,
            discountId,
            subtotal: providedSubtotal,
            total: providedTotal,
        } = body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !address || !city || !state || !postalCode || !country) {
            return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Order must include at least one item" }, { status: 400 });
        }

        // Validate and calculate item subtotals
        const orderItems: { product: { connect: { id: string } }, quantity: number, subtotal: number }[] = [];
        let calculatedSubtotal = 0;

        for (const item of items) {
            if (!item.productId || !item.quantity || item.quantity <= 0) {
                return NextResponse.json({ error: "Invalid item format" }, { status: 400 });
            }

            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                return NextResponse.json({ error: `Product with ID ${item.productId} not found` }, { status: 404 });
            }

            const itemSubtotal = product.price * item.quantity;
            calculatedSubtotal += itemSubtotal;

            orderItems.push({
                product: { connect: { id: product.id } },
                quantity: item.quantity,
                subtotal: itemSubtotal,
            });
        }

        // Validate provided subtotal
        if (providedSubtotal !== calculatedSubtotal) {
            return NextResponse.json({ error: "Provided subtotal does not match calculated subtotal" }, { status: 400 });
        }

        // Discount logic
        let discount: Discount | null = null;
        let discountAmount = 0;
        let total = calculatedSubtotal;

        if (discountId) {
            discount = await prisma.discount.findUnique({
                where: { id: discountId },
                include: { products: true },
            });

            if (
                !discount ||
                !discount.isActive ||
                (discount.usageLimit && discount.usageCount >= discount.usageLimit) ||
                new Date() < discount.startsAt ||
                (discount.endsAt && new Date() > discount.endsAt)
            ) {
                return NextResponse.json({ error: "Invalid or inapplicable discount" }, { status: 400 });
            }

            // Check discount constraints
            if (discount.minSubtotal && calculatedSubtotal < discount.minSubtotal) {
                return NextResponse.json({ error: "Order subtotal below minimum for discount" }, { status: 400 });
            }

            if (discount.products?.length && !items.some(item => discount?.products?.some(p => p.id === item.productId))) {
                return NextResponse.json({ error: "Discount not applicable to order items" }, { status: 400 });
            }

            // Apply discount
            if (discount.type === "percentage") {
                discountAmount = (discount.value / 100) * calculatedSubtotal;
            } else if (discount.type === "fixed_amount") {
                discountAmount = discount.value;
            } else if (discount.type === "free_shipping") {
                discountAmount = 0; // Adjust if shipping cost is added
            }

            total = Math.max(0, calculatedSubtotal - discountAmount);
        }

        // Validate provided total
        if (providedTotal !== total) {
            return NextResponse.json({ error: "Provided total does not match calculated total" }, { status: 400 });
        }

        // Create order with transaction
        const order = await prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    phone,
                    address,
                    city,
                    state,
                    postalCode,
                    country,
                    status: "PENDING",
                    subtotal: calculatedSubtotal,
                    total,
                    discount: discount ? { connect: { id: discount.id } } : undefined,
                    items: { create: orderItems },
                },
                include: {
                    items: { include: { product: true } },
                    discount: true,
                },
            });

            if (discount) {
                await tx.discount.update({
                    where: { id: discount.id },
                    data: { usageCount: { increment: 1 } },
                });
            }

            return createdOrder;
        },
            { timeout: 15000 } // Set timeout to 15 seconds (15000 ms)
        );

        return NextResponse.json(order);
    } catch (error) {
        console.error("[CREATE_ORDER]", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}