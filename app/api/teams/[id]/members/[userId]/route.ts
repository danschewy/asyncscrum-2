import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    // Only scrum masters and admins can update team members
    const currentUser = await requireRole("SCRUM_MASTER")

    const data = await request.json()

    const teamMember = await prisma.teamMember.update({
      where: {
        userId_teamId: {
          userId: params.userId,
          teamId: params.id,
        },
      },
      data: {
        role: data.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(teamMember)
  } catch (error) {
    console.error("Error updating team member:", error)
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    // Only scrum masters and admins can remove team members
    const currentUser = await requireRole("SCRUM_MASTER")

    await prisma.teamMember.delete({
      where: {
        userId_teamId: {
          userId: params.userId,
          teamId: params.id,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing team member:", error)
    return NextResponse.json({ error: "Failed to remove team member" }, { status: 500 })
  }
}
