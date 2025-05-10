"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole, requireAuth } from "@/lib/auth"

export async function createPrompt(formData: FormData) {
  try {
    const currentUser = await requireRole("SCRUM_MASTER")

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const teamId = formData.get("team") as string
    const ceremonyType = formData.get("ceremonyType") as string
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const videoUrl = (formData.get("videoUrl") as string) || null

    // Validate inputs
    if (!title || !description || !teamId || !ceremonyType || !date || !time) {
      return {
        success: false,
        message: "All required fields must be filled",
      }
    }

    // Get the team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        projectTeams: {
          include: {
            project: true,
          },
        },
      },
    })

    if (!team) {
      return {
        success: false,
        message: "Team not found",
      }
    }

    // Get the ceremony
    const ceremony = await prisma.ceremony.findFirst({
      where: {
        name: ceremonyType,
      },
    })

    if (!ceremony) {
      return {
        success: false,
        message: "Ceremony type not found",
      }
    }

    // Get the project (use the first one associated with the team)
    if (team.projectTeams.length === 0) {
      return {
        success: false,
        message: "Team is not associated with any project",
      }
    }

    const projectId = team.projectTeams[0].project.id

    // Combine date and time
    const deadlineDate = new Date(date)
    const [hours, minutes] = time.split(":").map(Number)
    deadlineDate.setHours(hours, minutes)

    // Create the prompt
    const prompt = await prisma.prompt.create({
      data: {
        title,
        description,
        projectId,
        teamId,
        ceremonyId: ceremony.id,
        deadline: deadlineDate,
        status: "PENDING",
        videoUrl,
        createdById: currentUser.id,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/prompts")

    return {
      success: true,
      message: "Prompt created successfully",
      prompt,
    }
  } catch (error) {
    console.error("Error creating prompt:", error)
    return {
      success: false,
      message: "Failed to create prompt",
    }
  }
}

export async function submitResponse(formData: FormData) {
  try {
    const currentUser = await requireAuth()

    const promptId = formData.get("promptId") as string
    const textResponse = formData.get("response") as string
    const videoResponse = (formData.get("videoResponse") as string) || null

    // Validate inputs
    if (!promptId || (!textResponse && !videoResponse)) {
      return {
        success: false,
        message: "Response content is required",
      }
    }

    // Check if the user has already responded to this prompt
    const existingResponse = await prisma.response.findUnique({
      where: {
        promptId_userId: {
          promptId,
          userId: currentUser.id,
        },
      },
    })

    let response

    if (existingResponse) {
      // Update the existing response
      response = await prisma.response.update({
        where: {
          id: existingResponse.id,
        },
        data: {
          textResponse,
          videoResponse,
          submittedAt: new Date(),
        },
      })
    } else {
      // Create a new response
      response = await prisma.response.create({
        data: {
          promptId,
          userId: currentUser.id,
          textResponse,
          videoResponse,
        },
      })

      // Update the prompt status if all team members have responded
      const prompt = await prisma.prompt.findUnique({
        where: { id: promptId },
        include: {
          team: {
            include: {
              members: true,
            },
          },
          responses: true,
        },
      })

      if (prompt && prompt.responses.length === prompt.team.members.length) {
        await prisma.prompt.update({
          where: { id: promptId },
          data: {
            status: "COMPLETE",
          },
        })
      } else {
        // Update the prompt status to in-progress if it's the first response
        if (prompt && prompt.status === "PENDING") {
          await prisma.prompt.update({
            where: { id: promptId },
            data: {
              status: "IN_PROGRESS",
            },
          })
        }
      }
    }

    revalidatePath(`/responses/${promptId}`)
    revalidatePath("/team-member")

    return {
      success: true,
      message: "Response submitted successfully",
      response,
    }
  } catch (error) {
    console.error("Error submitting response:", error)
    return {
      success: false,
      message: "Failed to submit response",
    }
  }
}

export async function sendFeedback(formData: FormData) {
  try {
    const currentUser = await requireRole("SCRUM_MASTER")

    const responseId = formData.get("responseId") as string
    const text = formData.get("text") as string

    // Validate inputs
    if (!responseId || !text) {
      return {
        success: false,
        message: "Feedback text is required",
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        responseId,
        userId: currentUser.id,
        text,
      },
    })

    revalidatePath(`/responses/${responseId}`)

    return {
      success: true,
      message: "Feedback sent successfully",
      feedback,
    }
  } catch (error) {
    console.error("Error sending feedback:", error)
    return {
      success: false,
      message: "Failed to send feedback",
    }
  }
}
