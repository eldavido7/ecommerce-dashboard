import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT: Update product by ID
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json()
        const params = await context.params
        const { id } = params

        const updated = await prisma.product.update({
            where: { id },
            data: body,
        })

        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }
}

// DELETE: Delete product by ID
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params
        const { id } = params

        await prisma.product.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Product deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }
}