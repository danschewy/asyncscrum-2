import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAuth()

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        members: {
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
        },
        projectTeams: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Check if user has access to this team
    if (currentUser.role === "TEAM_MEMBER") {
      const isMember = team.members.some((m) => m.user.id === currentUser.id)

      if (!isMember) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Only scrum masters and admins can update teams
    const currentUser = await requireRole("SCRUM_MASTER")

    const data = await request.json()

    const team = await prisma.team.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
      },
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Only scrum masters and admins can delete teams
    await requireRole("SCRUM_MASTER")

    // Delete all related records first
    await prisma.$transaction([
      prisma.teamMember.deleteMany({
        where: {
          teamId: params.id,
        },
      }),
      prisma.projectTeam.deleteMany({
        where: {
          teamId: params.id,
        },
      }),
      prisma.team.delete({
        where: { id: params.id },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 })
  }
}
