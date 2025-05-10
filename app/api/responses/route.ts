import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth()

    const data = await request.json()

    // Check if the user has already responded to this prompt
    const existingResponse = await prisma.response.findUnique({
      where: {
        promptId_userId: {
          promptId: data.promptId,
          userId: currentUser.id,
        },
      },
    })

    if (existingResponse) {
      // Update the existing response
      const response = await prisma.response.update({
        where: {
          id: existingResponse.id,
        },
        data: {
          textResponse: data.textResponse,
          videoResponse: data.videoResponse,
          submittedAt: new Date(),
        },
      })

      return NextResponse.json(response)
    } else {
      // Create a new response
      const response = await prisma.response.create({
        data: {
          promptId: data.promptId,
          userId: currentUser.id,
          textResponse: data.textResponse,
          videoResponse: data.videoResponse,
        },
      })

      // Update the prompt status if all team members have responded
      const prompt = await prisma.prompt.findUnique({
        where: { id: data.promptId },
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
          where: { id: data.promptId },
          data: {
            status: "COMPLETE",
          },
        })
      }

      return NextResponse.json(response, { status: 201 })
    }
  } catch (error) {
    console.error("Error submitting response:", error)
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 })
  }
}
