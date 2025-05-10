import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()

    const ceremony = await prisma.ceremony.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        prompts: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    })

    if (!ceremony) {
      return NextResponse.json({ error: "Ceremony not found" }, { status: 404 })
    }

    return NextResponse.json(ceremony)
  } catch (error) {
    console.error("Error fetching ceremony:", error)
    return NextResponse.json({ error: "Failed to fetch ceremony" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Only scrum masters and admins can update ceremonies
    const currentUser = await requireRole("SCRUM_MASTER")

    const data = await request.json()

    const ceremony = await prisma.ceremony.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        duration: Number.parseInt(data.duration),
        frequency: data.frequency,
        color: data.color,
      },
    })

    return NextResponse.json(ceremony)
  } catch (error) {
    console.error("Error updating ceremony:", error)
    return NextResponse.json({ error: "Failed to update ceremony" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Only scrum masters and admins can delete ceremonies
    await requireRole("SCRUM_MASTER")

    // Check if there are any prompts using this ceremony
    const promptCount = await prisma.prompt.count({
      where: {
        ceremonyId: params.id,
      },
    })

    if (promptCount > 0) {
      return NextResponse.json({ error: "Cannot delete ceremony with associated prompts" }, { status: 400 })
    }

    await prisma.ceremony.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting ceremony:", error)
    return NextResponse.json({ error: "Failed to delete ceremony" }, { status: 500 })
  }
}
