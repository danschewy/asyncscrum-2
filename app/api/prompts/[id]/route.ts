import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAuth()

    const prompt = await prisma.prompt.findUnique({
      where: { id: params.id },
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
        responses: {
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
            },
          },
        },
      },
    })

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    // Check if user has access to this prompt
    if (currentUser.role === "TEAM_MEMBER") {
      const isMember = prompt.team.members.some((m) => m.user.id === currentUser.id)

      if (!isMember) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    // Format the data
    const formattedPrompt = {
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      deadline: new Date(prompt.deadline).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
      responses: prompt.responses.length,
      totalTeamMembers: prompt.team.members.length,
      status: prompt.status.toLowerCase().replace("_", "-"),
      project: prompt.project.name,
      ceremonyType: prompt.ceremony.name,
      videoUrl: prompt.videoUrl,
      teamMembers: prompt.team.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        role: member.role,
        avatar: member.user.avatar,
        hasResponded: prompt.responses.some((r) => r.user.id === member.user.id),
        responseTime: prompt.responses
          .find((r) => r.user.id === member.user.id)
          ?.submittedAt.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          }),
        response: prompt.responses.find((r) => r.user.id === member.user.id)?.textResponse,
        videoResponse: prompt.responses.find((r) => r.user.id === member.user.id)?.videoResponse,
      })),
    }

    return NextResponse.json(formattedPrompt)
  } catch (error) {
    console.error("Error fetching prompt:", error)
    return NextResponse.json({ error: "Failed to fetch prompt" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Only scrum masters and admins can update prompts
    const currentUser = await requireRole("SCRUM_MASTER")

    const data = await request.json()

    // Combine date and time if provided
    let deadlineDate
    if (data.date && data.time) {
      deadlineDate = new Date(data.date)
      const [hours, minutes] = data.time.split(":").map(Number)
      deadlineDate.setHours(hours, minutes)
    }

    const prompt = await prisma.prompt.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        teamId: data.teamId,
        ceremonyId: data.ceremonyId,
        deadline: deadlineDate,
        status: data.status?.toUpperCase(),
        videoUrl: data.videoUrl,
      },
    })

    return NextResponse.json(prompt)
  } catch (error) {
    console.error("Error updating prompt:", error)
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Only scrum masters and admins can delete prompts
    await requireRole("SCRUM_MASTER")

    // Delete all related records first
    await prisma.$transaction([
      prisma.feedback.deleteMany({
        where: {
          response: {
            promptId: params.id,
          },
        },
      }),
      prisma.response.deleteMany({
        where: {
          promptId: params.id,
        },
      }),
      prisma.prompt.delete({
        where: { id: params.id },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prompt:", error)
    return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 })
  }
}
