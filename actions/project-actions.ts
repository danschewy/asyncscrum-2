"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

export async function createProject(formData: FormData) {
  try {
    const currentUser = await requireRole("SCRUM_MASTER")

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const status = formData.get("status") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string

    // Validate inputs
    if (!name || !description || !status || !startDate || !endDate) {
      return {
        success: false,
        message: "All fields are required",
      }
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status.toUpperCase(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        progress: 0,
        createdById: currentUser.id,
      },
    })

    revalidatePath("/projects")

    return {
      success: true,
      message: "Project created successfully",
      project,
    }
  } catch (error) {
    console.error("Error creating project:", error)
    return {
      success: false,
      message: "Failed to create project",
    }
  }
}

export async function assignTeamToProject(formData: FormData) {
  try {
    await requireRole("SCRUM_MASTER")

    const projectId = formData.get("projectId") as string
    const teamIds = formData.getAll("teamIds") as string[]

    // Validate inputs
    if (!projectId || teamIds.length === 0) {
      return {
        success: false,
        message: "Project ID and at least one team are required",
      }
    }

    // Get current team assignments
    const currentAssignments = await prisma.projectTeam.findMany({
      where: {
        projectId,
      },
    })

    // Get the current team IDs
    const currentTeamIds = currentAssignments.map((a) => a.teamId)

    // Teams to add
    const teamsToAdd = teamIds.filter((id) => !currentTeamIds.includes(id))

    // Teams to remove
    const teamsToRemove = currentTeamIds.filter((id) => !teamIds.includes(id))

    // Create a transaction to update the assignments
    await prisma.$transaction([
      // Remove teams that are no longer assigned
      prisma.projectTeam.deleteMany({
        where: {
          projectId,
          teamId: {
            in: teamsToRemove,
          },
        },
      }),

      // Add new team assignments
      ...teamsToAdd.map((teamId) =>
        prisma.projectTeam.create({
          data: {
            projectId,
            teamId,
          },
        }),
      ),
    ])

    revalidatePath(`/projects/${projectId}`)
    revalidatePath("/projects")

    return {
      success: true,
      message: "Teams assigned successfully",
    }
  } catch (error) {
    console.error("Error assigning teams to project:", error)
    return {
      success: false,
      message: "Failed to assign teams to project",
    }
  }
}
