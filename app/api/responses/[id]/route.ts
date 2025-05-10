import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAuth()

    const response = await prisma.response.findUnique({
      where: { id: params.id },
      include: {
        prompt: {
          select: {
            id: true,
            title: true,
            teamId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        feedback: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 })
    }

    // Check if user has access to this response
    if (currentUser.role === "TEAM_MEMBER" && currentUser.id !== response.user.id) {
      // Check if the user is part of the same team
      const isTeamMember = await prisma.teamMember.findFirst({
        where: {
          userId: currentUser.id,
          teamId: response.prompt.teamId,
        },
      })

      if (!isTeamMember) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching response:", error)
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAuth()

    const response = await prisma.response.findUnique({
      where: { id: params.id },
      select: {
        userId: true,
      },
    })

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 })
    }

    // Users can only delete their own responses unless they're an admin or scrum master
    if (currentUser.role === "TEAM_MEMBER" && currentUser.id !== response.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete all feedback first
    await prisma.feedback.deleteMany({
      where: {
        responseId: params.id,
      },
    })

    // Delete the response
    await prisma.response.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting response:", error)
    return NextResponse.json({ error: "Failed to delete response" }, { status: 500 })
  }
}
