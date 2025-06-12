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
                shippingOption: true, // Include shipping option
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

    let body;
    try {
        body = await req.json();
    } catch (err) {
        console.error("[PARSE_JSON_ERROR]", err);
        return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    try {
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
            shippingOptionId,
            shippingCost,
            paymentReference,
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

        // Validate shipping option
        let calculatedShippingCost = 0;
        if (shippingOptionId) {
            const shippingOption = await prisma.shippingOption.findUnique({
                where: { id: shippingOptionId },
            });
            if (!shippingOption || shippingOption.status !== "ACTIVE") {
                return NextResponse.json({ error: "Invalid or inactive shipping option" }, { status: 400 });
            }
            calculatedShippingCost = shippingOption.price;
            if (shippingCost !== calculatedShippingCost) {
                return NextResponse.json({ error: "Provided shipping cost does not match selected option" }, { status: 400 });
            }
        } else if (shippingCost !== 0) {
            return NextResponse.json({ error: "Shipping cost provided without shipping option" }, { status: 400 });
        }

        // Discount logic
        let discount: Discount | null = null;
        let discountAmount = 0;
        let total = calculatedSubtotal + calculatedShippingCost;

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

            if ((discount?.products ?? []).length > 0) {
                const applicable = items.some(item =>
                    discount?.products!.some(p => p.id === item.productId)
                );
                if (!applicable) {
                    return NextResponse.json({ error: "Discount not applicable to order items" }, { status: 400 });
                }
            }

            // Apply discount
            if (discount.type === "percentage") {
                discountAmount = (discount.value / 100) * calculatedSubtotal;
            } else if (discount.type === "fixed_amount") {
                discountAmount = discount.value;
            } else if (discount.type === "free_shipping") {
                discountAmount = calculatedShippingCost; // Free shipping nullifies shipping cost
            }

            total = Math.max(0, calculatedSubtotal + calculatedShippingCost - discountAmount);
        }

        // Validate provided total
        if (providedTotal !== total) {
            return NextResponse.json({ error: "Provided total does not match calculated total" }, { status: 400 });
        }

        // Validate paymentReference (optional, only for Paystack orders)
        if (paymentReference) {
            const existingOrder = await prisma.order.findFirst({
                where: { paymentReference },
            });
            if (existingOrder) {
                return NextResponse.json({ error: "Payment reference already used" }, { status: 400 });
            }
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
                    shippingOption: shippingOptionId
                        ? { connect: { id: shippingOptionId } }
                        : undefined, // ✅ Proper relation linking
                    shippingCost: calculatedShippingCost,
                    total,
                    discount: discount ? { connect: { id: discount.id } } : undefined,
                    paymentReference,
                    items: { create: orderItems },
                },
                include: {
                    items: { include: { product: true } },
                    discount: true,
                    shippingOption: true,
                },
            });

            if (discount) {
                await tx.discount.update({
                    where: { id: discount.id },
                    data: { usageCount: { increment: 1 } },
                });
            }

            return createdOrder;
        }, { timeout: 15000 });

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("[CREATE_ORDER]", error?.message ?? error);
        if (error?.code) console.error("Prisma Error Code:", error.code);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}