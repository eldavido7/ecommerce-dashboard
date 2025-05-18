import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET a specific order
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> } // Assuming params is a Promise
) {
    try {
        const { id } = await context.params; // Await the params object

        const order = await prisma.order.findUnique({
            where: { id }, // Use the awaited id
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error("[GET_ORDER]", error);
        return NextResponse.json(
            { message: "Failed to fetch order" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> } // Assuming params is a Promise
) {
    try {
        const { id } = await context.params; // Await the params object

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
        } = data;

        const existingOrder = await prisma.order.findUnique({
            where: { id }, // Use the awaited id
            include: { items: true },
        });

        if (!existingOrder) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        // 🧹 Remove existing items if new ones are provided
        if (items.length > 0) {
            await prisma.orderItem.deleteMany({
                where: { orderId: id }, // Use the awaited id
            });

            for (const item of items) {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    return NextResponse.json(
                        { message: `Product ${item.productId} not found` },
                        { status: 400 }
                    );
                }

                await prisma.orderItem.create({
                    data: {
                        orderId: id, // Use the awaited id
                        productId: item.productId,
                        quantity: item.quantity,
                        subtotal: product.price * item.quantity,
                    },
                });
            }
        }

        // ✅ Deduct inventory stock if status changed to DELIVERED
        if (status === "DELIVERED" && existingOrder.status !== "DELIVERED") {
            const updatedItems = await prisma.orderItem.findMany({
                where: { orderId: id }, // Use the awaited id
            });

            for (const item of updatedItems) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        inventory: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
        }

        const updatedOrder = await prisma.order.update({
            where: { id }, // Use the awaited id
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
            },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("[UPDATE_ORDER]", error);
        return NextResponse.json(
            { message: "Failed to update order" },
            { status: 500 }
        );
    }
}