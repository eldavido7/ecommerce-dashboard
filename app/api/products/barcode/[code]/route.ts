import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_: NextRequest, { params }: { params: { code: string } }) {
    try {
        const product = await prisma.product.findFirst({
            where: {
                barcode: params.code,
            },
        })

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
    }
}
