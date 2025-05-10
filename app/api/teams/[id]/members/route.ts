import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAuth()

    const members = await prisma.teamMember.findMany({
      where: {
        teamId: params.id,
      },
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
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Only scrum masters and admins can add team members
    const currentUser = await requireRole("SCRUM_MASTER")

    const data = await request.json()

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      // Create a new user if they don't exist
      const newUser = await prisma.user.create({
        data: {
          name: data.email.split("@")[0], // Use part of email as name
          email: data.email,
          role: "TEAM_MEMBER",
          // In a real app, you would send an invitation email
        },
      })

      // Add the new user to the team
      const teamMember = await prisma.teamMember.create({
        data: {
          teamId: params.id,
          userId: newUser.id,
          role: data.role,
        },
      })

      return NextResponse.json({ ...teamMember, user: newUser, isNewUser: true }, { status: 201 })
    }

    // Check if user is already a member of the team
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: user.id,
          teamId: params.id,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member of this team" }, { status: 400 })
    }

    // Add the user to the team
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId: params.id,
        userId: user.id,
        role: data.role,
      },
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
    })

    return NextResponse.json(teamMember, { status: 201 })
  } catch (error) {
    console.error("Error adding team member:", error)
    return NextResponse.json({ error: "Failed to add team member" }, { status: 500 })
  }
}
