import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Only admins and scrum masters can list all users
    await requireRole("SCRUM_MASTER")

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        timezone: true,
        createdAt: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only admins can create users
    await requireRole("ADMIN")

    const data = await request.json()

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password, // In a real app, you would hash this
        role: data.role,
        avatar: data.avatar,
        timezone: data.timezone,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
