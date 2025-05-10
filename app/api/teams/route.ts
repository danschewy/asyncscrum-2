import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth()

    // Build the where clause
    const where: any = {}

    // If not an admin or scrum master, only show teams the user is part of
    if (currentUser.role === "TEAM_MEMBER") {
      where.members = {
        some: {
          userId: currentUser.id,
        },
      }
    }

    const teams = await prisma.team.findMany({
      where,
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data to match the expected format
    const formattedTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      members: team.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        role: member.role,
        avatar: member.user.avatar,
      })),
      projects: team.projectTeams.map((pt) => pt.project.name),
      createdBy: team.createdBy,
      createdAt: team.createdAt,
    }))

    return NextResponse.json(formattedTeams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only scrum masters and admins can create teams
    const currentUser = await requireRole("SCRUM_MASTER")

    const data = await request.json()

    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        createdById: currentUser.id,
      },
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}
