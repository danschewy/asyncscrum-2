import { cookies } from "next/headers"
import { prisma } from "./prisma"
import type { UserRole } from "@prisma/client"

export async function getCurrentUser() {
  const sessionToken = cookies().get("session_token")?.value

  if (!sessionToken) {
    return null
  }

  // In a real app, you would verify the session token
  // This is a simplified version for demonstration
  try {
    // For demo purposes, we'll just get the first user
    // In a real app, you would decode the token and get the user ID
    const user = await prisma.user.findFirst()
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth()

  if (user.role !== role && user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  return user
}
