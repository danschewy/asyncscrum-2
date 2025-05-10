import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAuth()

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        projectTeams: {
          include: {
            team: {
              include: {
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
              },
            },
          },
        },
        prompts: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if user has access to this project
    if (currentUser.role === "TEAM_MEMBER") {
      const isMember = project.projectTeams.some((pt) => pt.team.members.some((m) => m.user.id === currentUser.id))

      if (!isMember) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Only scrum masters and admins can update projects
    const currentUser = await requireRole("SCRUM_MASTER")

    const data = await request.json()

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status.toUpperCase(),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        progress: data.progress,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Only scrum masters and admins can delete projects
    await requireRole("SCRUM_MASTER")

    // Delete all related records first
    await prisma.$transaction([
      prisma.response.deleteMany({
        where: {
          prompt: {
            projectId: params.id,
          },
        },
      }),
      prisma.prompt.deleteMany({
        where: {
          projectId: params.id,
        },
      }),
      prisma.projectTeam.deleteMany({
        where: {
          projectId: params.id,
        },
      }),
      prisma.project.delete({
        where: { id: params.id },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
