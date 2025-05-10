"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TeamCreationModal } from "@/components/team-creation-modal"
import { InviteUserModal } from "@/components/invite-user-modal"

// Sample data for teams
const teamsData = [
  {
    id: 1,
    name: "Team Alpha",
    description: "Frontend development team focused on user experience",
    members: [
      { id: 1, name: "Alex Johnson", role: "Frontend Developer", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 2, name: "Jamie Smith", role: "UX Designer", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 3, name: "Taylor Wilson", role: "Product Manager", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 4, name: "Morgan Lee", role: "QA Engineer", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 5, name: "Casey Brown", role: "Frontend Developer", avatar: "/placeholder.svg?height=40&width=40" },
    ],
    projects: ["Project Alpha", "Project Delta"],
  },
  {
    id: 2,
    name: "Team Beta",
    description: "Backend development team specializing in API development",
    members: [
      { id: 6, name: "Jordan Rivera", role: "Backend Developer", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 7, name: "Riley Cooper", role: "DevOps Engineer", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 8, name: "Avery Martinez", role: "Database Admin", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 9, name: "Quinn Foster", role: "Backend Developer", avatar: "/placeholder.svg?height=40&width=40" },
    ],
    projects: ["Project Alpha"],
  },
  {
    id: 3,
    name: "Team Gamma",
    description: "Data science team working on analytics and machine learning",
    members: [
      { id: 10, name: "Drew Parker", role: "Data Scientist", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 11, name: "Skyler Adams", role: "ML Engineer", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 12, name: "Reese Campbell", role: "Data Analyst", avatar: "/placeholder.svg?height=40&width=40" },
    ],
    projects: ["Project Beta"],
  },
  {
    id: 4,
    name: "Team Delta",
    description: "QA and testing team ensuring product quality",
    members: [
      { id: 13, name: "Jordan Kim", role: "QA Lead", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 14, name: "Casey Morgan", role: "Test Automation", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 15, name: "Taylor Reed", role: "Manual Tester", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 16, name: "Alex Bailey", role: "Security Tester", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 17, name: "Jamie Cruz", role: "Performance Tester", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 18, name: "Riley Jordan", role: "QA Engineer", avatar: "/placeholder.svg?height=40&width=40" },
    ],
    projects: ["Project Gamma"],
  },
]

export function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)

  // Filter teams based on search term
  const filteredTeams = teamsData.filter((team) => {
    return team.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleInviteUser = (teamId: number) => {
    setSelectedTeam(teamId)
    setIsInviteModalOpen(true)
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-500">Manage your Scrum teams and members</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#1E90FF] hover:bg-blue-600">
            <Plus className="mr-2 h-4 w-4" />
            Create New Team
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search teams..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-[#1E90FF]" />
                    <span className="text-sm text-gray-500">{team.members.length} members</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleInviteUser(team.id)}>Invite User</DropdownMenuItem>
                      <DropdownMenuItem>Edit Team</DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Delete Team</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg">{team.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="mb-4 text-sm text-gray-500 line-clamp-2">{team.description}</p>

                <div className="flex flex-wrap gap-1">
                  {team.members.slice(0, 5).map((member) => (
                    <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {team.members.length > 5 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs">
                      +{team.members.length - 5}
                    </div>
                  )}
                </div>

                {team.projects.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-1 text-xs font-medium text-gray-500">Projects</p>
                    <div className="flex flex-wrap gap-1">
                      {team.projects.map((project, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                        >
                          {project}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/teams/${team.id}`}>View Team</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-full bg-gray-100 p-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No teams found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search" : "Create your first team to get started"}
            </p>
            {searchTerm && (
              <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

      <TeamCreationModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <InviteUserModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} teamId={selectedTeam} />
    </>
  )
}
