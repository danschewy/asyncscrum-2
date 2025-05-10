import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth()

    // Get query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status")

    // Build the where clause
    const where: any = {}
    if (status) {
      where.status = status
    }

    // If not an admin or scrum master, only show projects the user is part of
    if (currentUser.role === "TEAM_MEMBER") {
      where.projectTeams = {
        some: {
          team: {
            members: {
              some: {
                userId: currentUser.id,
              },
            },
          },
        },
      }
    }

    const projects = await prisma.project.findMany({
      where,
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
              select: {
                id: true,
                name: true,
                _count: {
                  select: {
                    members: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            prompts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data to match the expected format
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status.toLowerCase(),
      progress: project.progress,
      teamCount: project.projectTeams.length,
      teams: project.projectTeams.map((pt) => pt.team.name),
      startDate: project.startDate.toISOString().split("T")[0],
      endDate: project.endDate.toISOString().split("T")[0],
      promptCount: project._count.prompts,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
    }))

    return NextResponse.json(formattedProjects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only scrum masters and admins can create projects
    const currentUser = await requireRole("SCRUM_MASTER")

    const data = await request.json()

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status.toUpperCase(),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        progress: 0,
        createdById: currentUser.id,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
