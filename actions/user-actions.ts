"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function updateProfile(formData: FormData) {
  try {
    const currentUser = await requireAuth()

    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const jobTitle = formData.get("jobTitle") as string
    const bio = formData.get("bio") as string

    // Validate inputs
    if (!firstName || !lastName) {
      return {
        success: false,
        message: "Name fields are required",
      }
    }

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: `${firstName} ${lastName}`,
        // Store additional profile data in a real app
      },
    })

    revalidatePath("/settings")

    return {
      success: true,
      message: "Profile updated successfully",
      user,
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return {
      success: false,
      message: "Failed to update profile",
    }
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const currentUser = await requireAuth()

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        success: false,
        message: "All password fields are required",
      }
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: "New passwords do not match",
      }
    }

    // In a real app, you would verify the current password
    // and hash the new password before saving

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        password: newPassword, // This should be hashed in a real app
      },
    })

    return {
      success: true,
      message: "Password updated successfully",
    }
  } catch (error) {
    console.error("Error updating password:", error)
    return {
      success: false,
      message: "Failed to update password",
    }
  }
}

export async function updateNotificationSettings(formData: FormData) {
  try {
    const currentUser = await requireAuth()

    // In a real app, you would store these settings in a user_settings table
    // For simplicity, we'll just return success

    revalidatePath("/settings")

    return {
      success: true,
      message: "Notification settings updated successfully",
    }
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return {
      success: false,
      message: "Failed to update notification settings",
    }
  }
}
