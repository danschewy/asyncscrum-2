"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

export async function createCeremony(formData: FormData) {
  try {
    const currentUser = await requireRole("SCRUM_MASTER")

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const duration = formData.get("duration") as string
    const frequency = formData.get("frequency") as string
    const color = formData.get("color") as string

    // Validate inputs
    if (!name || !description || !duration || !frequency || !color) {
      return {
        success: false,
        message: "All fields are required",
      }
    }

    const ceremony = await prisma.ceremony.create({
      data: {
        name,
        description,
        duration: Number.parseInt(duration),
        frequency,
        color,
        createdById: currentUser.id,
      },
    })

    revalidatePath("/ceremonies")

    return {
      success: true,
      message: "Ceremony created successfully",
      ceremony,
    }
  } catch (error) {
    console.error("Error creating ceremony:", error)
    return {
      success: false,
      message: "Failed to create ceremony",
    }
  }
}

export async function updateCeremony(formData: FormData) {
  try {
    await requireRole("SCRUM_MASTER")

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const duration = formData.get("duration") as string
    const frequency = formData.get("frequency") as string
    const color = formData.get("color") as string

    // Validate inputs
    if (!id || !name || !description || !duration || !frequency || !color) {
      return {
        success: false,
        message: "All fields are required",
      }
    }

    const ceremony = await prisma.ceremony.update({
      where: { id },
      data: {
        name,
        description,
        duration: Number.parseInt(duration),
        frequency,
        color,
      },
    })

    revalidatePath(`/ceremonies/${id}`)
    revalidatePath("/ceremonies")

    return {
      success: true,
      message: "Ceremony updated successfully",
      ceremony,
    }
  } catch (error) {
    console.error("Error updating ceremony:", error)
    return {
      success: false,
      message: "Failed to update ceremony",
    }
  }
}

export async function deleteCeremony(formData: FormData) {
  try {
    await requireRole("SCRUM_MASTER")

    const id = formData.get("id") as string

    // Check if there are any prompts using this ceremony
    const promptCount = await prisma.prompt.count({
      where: {
        ceremonyId: id,
      },
    })

    if (promptCount > 0) {
      return {
        success: false,
        message: "Cannot delete ceremony with associated prompts",
      }
    }

    await prisma.ceremony.delete({
      where: { id },
    })

    revalidatePath("/ceremonies")

    return {
      success: true,
      message: "Ceremony deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting ceremony:", error)
    return {
      success: false,
      message: "Failed to delete ceremony",
    }
  }
}
