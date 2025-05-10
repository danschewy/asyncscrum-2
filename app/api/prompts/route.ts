import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth()

    // Get query parameters
    const url = new URL(request.url)
    const projectId = url.searchParams.get("projectId")
    const teamId = url.searchParams.get("teamId")
    const ceremonyId = url.searchParams.get("ceremonyId")
    const status = url.searchParams.get("status")

    // Build the where clause
    const where: any = {}

    if (projectId) {
      where.projectId = projectId
    }

    if (teamId) {
      where.teamId = teamId
    }

    if (ceremonyId) {
      where.ceremonyId = ceremonyId
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    // If not an admin or scrum master, only show prompts for teams the user is part of
    if (currentUser.role === "TEAM_MEMBER") {
      where.team = {
        members: {
          some: {
            userId: currentUser.id,
          },
        },
      }
    }

    const prompts = await prisma.prompt.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
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
        ceremony: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data to match the expected format
    const formattedPrompts = await Promise.all(
      prompts.map(async (prompt) => {
        // Get the total number of team members
        const totalTeamMembers = prompt.team._count.members

        // Calculate the status based on deadline and responses
        let status = prompt.status.toLowerCase()
        if (status === "in_progress") status = "in-progress"
        if (status === "near_deadline") status = "near-deadline"

        return {
          id: prompt.id,
          title: prompt.title,
          deadline: new Date(prompt.deadline).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          }),
          responses: prompt._count.responses,
          totalTeamMembers,
          status,
          project: prompt.project.name,
          ceremonyType: prompt.ceremony.name,
          team: prompt.team.name,
          createdAt: new Date(prompt.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          }),
        }
      }),
    )

    return NextResponse.json(formattedPrompts)
  } catch (error) {
    console.error("Error fetching prompts:", error)
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only scrum masters and admins can create prompts
    const currentUser = await requireRole("SCRUM_MASTER")

    const data = await request.json()

    // Combine date and time
    const deadlineDate = new Date(data.date)
    const [hours, minutes] = data.time.split(":").map(Number)
    deadlineDate.setHours(hours, minutes)

    const prompt = await prisma.prompt.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        teamId: data.teamId,
        ceremonyId: data.ceremonyId,
        deadline: deadlineDate,
        status: "PENDING",
        videoUrl: data.videoUrl,
        createdById: currentUser.id,
      },
    })

    return NextResponse.json(prompt, { status: 201 })
  } catch (error) {
    console.error("Error creating prompt:", error)
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 })
  }
}
