"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

export async function createTeam(formData: FormData) {
  try {
    const currentUser = await requireRole("SCRUM_MASTER")

    const name = formData.get("name") as string
    const description = formData.get("description") as string

    // Validate inputs
    if (!name || !description) {
      return {
        success: false,
        message: "All fields are required",
      }
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        createdById: currentUser.id,
      },
    })

    revalidatePath("/teams")

    return {
      success: true,
      message: "Team created successfully",
      team,
    }
  } catch (error) {
    console.error("Error creating team:", error)
    return {
      success: false,
      message: "Failed to create team",
    }
  }
}

export async function inviteUserToTeam(formData: FormData) {
  try {
    const currentUser = await requireRole("SCRUM_MASTER")

    const teamId = formData.get("teamId") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as string

    // Validate inputs
    if (!teamId || !email || !role) {
      return {
        success: false,
        message: "All fields are required",
      }
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Create a new user if they don't exist
      user = await prisma.user.create({
        data: {
          name: email.split("@")[0], // Use part of email as name
          email,
          role: "TEAM_MEMBER",
          // In a real app, you would send an invitation email
        },
      })
    }

    // Check if user is already a member of the team
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: user.id,
          teamId,
        },
      },
    })

    if (existingMember) {
      return {
        success: false,
        message: "User is already a member of this team",
      }
    }

    // Add the user to the team
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: user.id,
        role,
      },
    })

    revalidatePath(`/teams/${teamId}`)
    revalidatePath("/teams")

    return {
      success: true,
      message: "User invited successfully",
      teamMember,
    }
  } catch (error) {
    console.error("Error inviting user to team:", error)
    return {
      success: false,
      message: "Failed to invite user to team",
    }
  }
}
