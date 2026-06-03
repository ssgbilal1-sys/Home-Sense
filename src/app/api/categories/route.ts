import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/categories — Rename a category (updates all products in that category)
export async function PUT(request: Request) {
  try {
    const { oldName, newName } = await request.json()

    if (!oldName || !newName || oldName.trim() === '' || newName.trim() === '') {
      return NextResponse.json({ error: 'Old name and new name are required' }, { status: 400 })
    }

    if (oldName.trim().toLowerCase() === newName.trim().toLowerCase()) {
      return NextResponse.json({ error: 'New name is the same as old name' }, { status: 400 })
    }

    // Find all products with the old category name
    const products = await db.product.findMany({
      where: { category: { equals: oldName.trim() } }
    })

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found in this category' }, { status: 404 })
    }

    // Update each product's category to the new name
    let updated = 0
    for (const product of products) {
      await db.product.update({
        where: { id: product.id },
        data: { category: newName.trim() }
      })
      updated++
    }

    return NextResponse.json({
      success: true,
      message: `Category renamed from "${oldName}" to "${newName}". ${updated} products updated.`,
      updatedCount: updated,
    })
  } catch (error: any) {
    console.error('Error renaming category:', error)
    return NextResponse.json({ error: 'Failed to rename category: ' + (error.message || 'Unknown error') }, { status: 500 })
  }
}

// DELETE /api/categories — Delete a category (reassign products to another category or delete them)
export async function DELETE(request: Request) {
  try {
    const { categoryName, action, reassignTo } = await request.json()

    if (!categoryName) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    // Find all products in this category
    const products = await db.product.findMany({
      where: { category: { equals: categoryName.trim() } }
    })

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found in this category' }, { status: 404 })
    }

    if (action === 'delete') {
      // Delete all products in this category
      let deleted = 0
      for (const product of products) {
        await db.product.delete({ where: { id: product.id } })
        deleted++
      }
      return NextResponse.json({
        success: true,
        message: `Category "${categoryName}" deleted. ${deleted} products removed.`,
        deletedCount: deleted,
      })
    } else if (action === 'reassign') {
      if (!reassignTo || reassignTo.trim() === '') {
        return NextResponse.json({ error: 'Target category is required for reassignment' }, { status: 400 })
      }
      // Reassign all products to the new category
      let reassigned = 0
      for (const product of products) {
        await db.product.update({
          where: { id: product.id },
          data: { category: reassignTo.trim() }
        })
        reassigned++
      }
      return NextResponse.json({
        success: true,
        message: `${reassigned} products reassigned from "${categoryName}" to "${reassignTo}".`,
        reassignedCount: reassigned,
      })
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "delete" or "reassign".' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category: ' + (error.message || 'Unknown error') }, { status: 500 })
  }
}
