import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const ceremonies = await prisma.ceremony.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
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
    const formattedCeremonies = ceremonies.map((ceremony) => ({
      id: ceremony.id,
      name: ceremony.name,
      description: ceremony.description,
      duration: ceremony.duration,
      frequency: ceremony.frequency,
      color: ceremony.color,
      promptCount: ceremony._count.prompts,
      createdBy: ceremony.createdBy,
      createdAt: ceremony.createdAt,
    }))

    return NextResponse.json(formattedCeremonies)
  } catch (error) {
    console.error("Error fetching ceremonies:", error)
    return NextResponse.json({ error: "Failed to fetch ceremonies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only scrum masters and admins can create ceremonies
    const currentUser = await requireRole("SCRUM_MASTER")

    const data = await request.json()

    const ceremony = await prisma.ceremony.create({
      data: {
        name: data.name,
        description: data.description,
        duration: Number.parseInt(data.duration),
        frequency: data.frequency,
        color: data.color,
        createdById: currentUser.id,
      },
    })

    return NextResponse.json(ceremony, { status: 201 })
  } catch (error) {
    console.error("Error creating ceremony:", error)
    return NextResponse.json({ error: "Failed to create ceremony" }, { status: 500 })
  }
}
