import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all discounts
export async function GET() {
    try {
        const discounts = await prisma.discount.findMany({
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(discounts)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 })
    }
}

// CREATE a new discount
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            code,
            description,
            type,
            value,
            usageLimit,
            startsAt,
            endsAt,
            isActive,
            conditions
        } = body

        const newDiscount = await prisma.discount.create({
            data: {
                code,
                description,
                type,
                value,
                usageLimit,
                startsAt: new Date(startsAt),
                endsAt: endsAt ? new Date(endsAt) : undefined,
                isActive,
                conditions
            }
        })

        return NextResponse.json(newDiscount)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create discount" }, { status: 500 })
    }
}
