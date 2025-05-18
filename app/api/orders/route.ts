// app/api/orders/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get all orders
export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("[GET_ORDERS]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
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
        } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "Order must include at least one item." },
                { status: 400 }
            );
        }

        const orderItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                return NextResponse.json(
                    { error: `Product with ID ${item.productId} not found.` },
                    { status: 404 }
                );
            }

            orderItems.push({
                product: { connect: { id: product.id } },
                quantity: item.quantity,
                subtotal: product.price * item.quantity,
            });
        }

        const order = await prisma.order.create({
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
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("[CREATE_ORDER]", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}