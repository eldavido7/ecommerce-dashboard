import { prisma } from "@/lib/prisma";
import { Discount } from "@/types";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                discount: true,
                shippingOption: true, // Include shipping option
            },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error("[GET_ORDER]", error);
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const data = await request.json();
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
            status,
            items = [],
            discountId,
            shippingOptionId,
            shippingCost,
            paymentReference,
            subtotal: providedSubtotal,
            total: providedTotal,
        } = data;

        // Validate input
        if (
            (firstName !== undefined && !firstName) ||
            (lastName !== undefined && !lastName) ||
            (email !== undefined && !email) ||
            (phone !== undefined && !phone) ||
            (address !== undefined && !address) ||
            (city !== undefined && !city) ||
            (state !== undefined && !state) ||
            (postalCode !== undefined && !postalCode) ||
            (country !== undefined && !country)
        ) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (status && !["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const existingOrder = await prisma.order.findUnique({
            where: { id },
            include: { items: true, discount: true, shippingOption: true },
        });

        if (!existingOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Calculate subtotal
        let calculatedSubtotal = 0;
        let orderItems = [];

        if (items.length > 0) {
            for (const item of items) {
                if (!item.productId || !item.quantity || item.quantity <= 0) {
                    return NextResponse.json({ error: "Invalid item format" }, { status: 400 });
                }

                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
                }

                const itemSubtotal = product.price * item.quantity;
                calculatedSubtotal += itemSubtotal;

                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    subtotal: itemSubtotal,
                });
            }
        } else {
            calculatedSubtotal = existingOrder.items.reduce((acc, item) => acc + item.subtotal, 0);
        }

        // Validate provided subtotal
        if (providedSubtotal !== undefined && providedSubtotal !== calculatedSubtotal) {
            return NextResponse.json({ error: "Provided subtotal does not match calculated subtotal" }, { status: 400 });
        }

        // Validate shipping option
        let calculatedShippingCost = 0;
        let shippingOptionIdToUse = shippingOptionId !== undefined ? shippingOptionId : existingOrder.shippingOptionId;
        if (shippingOptionIdToUse) {
            const shippingOption = await prisma.shippingOption.findUnique({
                where: { id: shippingOptionIdToUse },
            });
            if (!shippingOption || shippingOption.status !== "ACTIVE") {
                return NextResponse.json({ error: "Invalid or inactive shipping option" }, { status: 400 });
            }
            calculatedShippingCost = shippingOption.price;
            if (shippingCost !== undefined && shippingCost !== calculatedShippingCost) {
                return NextResponse.json({ error: "Provided shipping cost does not match selected option" }, { status: 400 });
            }
        } else if (shippingCost !== undefined && shippingCost !== 0) {
            return NextResponse.json({ error: "Shipping cost provided without shipping option" }, { status: 400 });
        }

        // Discount logic
        let discount: Discount | null = null;
        let discountAmount = 0;
        let total = calculatedSubtotal + calculatedShippingCost;
        let discountIdToUse = discountId !== undefined ? discountId : existingOrder.discountId;

        if (discountIdToUse) {
            discount = await prisma.discount.findUnique({
                where: { id: discountIdToUse },
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

            if (discount.minSubtotal && calculatedSubtotal < discount.minSubtotal) {
                return NextResponse.json({ error: "Order subtotal below minimum for discount" }, { status: 400 });
            }

            if (discount.products?.length && !items.some((item: { productId: string }) => discount?.products?.some(p => p.id === item.productId))) {
                return NextResponse.json({ error: "Discount not applicable to order items" }, { status: 400 });
            }

            if (discount.type === "percentage") {
                discountAmount = (discount.value / 100) * calculatedSubtotal;
            } else if (discount.type === "fixed_amount") {
                discountAmount = discount.value;
            } else if (discount.type === "free_shipping") {
                discountAmount = calculatedShippingCost; // Free shipping nullifies shipping cost
            }

            total = Math.max(0, calculatedSubtotal + calculatedShippingCost - discountAmount);
        } else if (discountId === null) {
            total = calculatedSubtotal + calculatedShippingCost;
        }

        // Validate provided total
        if (providedTotal !== undefined && providedTotal !== total) {
            return NextResponse.json({ error: "Provided total does not match calculated total" }, { status: 400 });
        }

        // Validate paymentReference (optional, only for Paystack orders)
        if (paymentReference !== undefined && paymentReference !== existingOrder.paymentReference) {
            const existingOrderWithReference = await prisma.order.findFirst({
                where: { paymentReference },
            });
            if (existingOrderWithReference && existingOrderWithReference.id !== id) {
                return NextResponse.json({ error: "Payment reference already used" }, { status: 400 });
            }
        }

        // Update with transaction
        const updatedOrder = await prisma.$transaction(async (tx) => {
            // Delete and recreate items if provided
            if (items.length > 0) {
                await tx.orderItem.deleteMany({ where: { orderId: id } });
                await tx.orderItem.createMany({
                    data: orderItems.map(item => ({
                        orderId: id,
                        productId: item.productId,
                        quantity: item.quantity,
                        subtotal: item.subtotal,
                    })),
                });
            }

            // Update discount usage
            if (discount && discountId !== existingOrder.discountId) {
                await tx.discount.update({
                    where: { id: discount.id },
                    data: { usageCount: { increment: 1 } },
                });
            }

            // Update inventory for DELIVERED status
            if (status === "DELIVERED" && existingOrder.status !== "DELIVERED") {
                const itemsToUpdate = items.length > 0 ? orderItems : existingOrder.items;
                for (const item of itemsToUpdate) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { inventory: { decrement: item.quantity } },
                    });
                }
            }

            // Update order
            return tx.order.update({
                where: { id },
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
                    status,
                    subtotal: calculatedSubtotal,
                    shippingOptionId: shippingOptionIdToUse,
                    shippingCost: calculatedShippingCost,
                    total,
                    discountId: discountIdToUse,
                    paymentReference,
                },
                include: {
                    items: { include: { product: true } },
                    discount: true,
                    shippingOption: true,
                },
            });
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("[UPDATE_ORDER]", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}