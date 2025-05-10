import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string; feedbackId: string } }) {
  try {
    const currentUser = await requireAuth()

    const feedback = await prisma.feedback.findUnique({
      where: { id: params.feedbackId },
      select: {
        userId: true,
      },
    })

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Users can only update their own feedback unless they're an admin
    if (currentUser.role !== "ADMIN" && currentUser.id !== feedback.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()

    const updatedFeedback = await prisma.feedback.update({
      where: { id: params.feedbackId },
      data: {
        text: data.text,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(updatedFeedback)
  } catch (error) {
    console.error("Error updating feedback:", error)
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; feedbackId: string } }) {
  try {
    const currentUser = await requireAuth()

    const feedback = await prisma.feedback.findUnique({
      where: { id: params.feedbackId },
      select: {
        userId: true,
      },
    })

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Users can only delete their own feedback unless they're an admin
    if (currentUser.role !== "ADMIN" && currentUser.id !== feedback.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.feedback.delete({
      where: { id: params.feedbackId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting feedback:", error)
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 })
  }
}
