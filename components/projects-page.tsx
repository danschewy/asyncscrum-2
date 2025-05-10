"use client"

import { useState, useEffect } from "react"
import { CalendarDays, Clock, Filter, MoreHorizontal, Plus, Search, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProjectCreationModal } from "@/components/project-creation-modal"
import { AssignTeamModal } from "@/components/assign-team-modal"
import { useToast } from "@/hooks/use-toast"

interface Project {
  id: string
  name: string
  description: string
  status: string
  progress: number
  teamCount: number
  teams: string[]
  startDate: string
  endDate: string
  promptCount: number
}

const statusOptions = ["All", "Active", "Planning", "Completed"]

export function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [statusFilter])

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const status = statusFilter !== "All" ? statusFilter.toLowerCase() : ""
      const response = await fetch(`/api/projects${status ? `?status=${status}` : ""}`)

      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }

      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter projects based on search term
  const filteredProjects = projects.filter((project) => {
    return project.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300"
      case "planning":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Get progress color
  const getProgressColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "planning":
        return "bg-blue-500"
      case "completed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleAssignTeam = (projectId: string) => {
    setSelectedProject(projectId)
    setIsAssignTeamModalOpen(true)
  }

  const handleProjectCreated = () => {
    fetchProjects()
    setIsCreateModalOpen(false)
  }

  const handleTeamsAssigned = () => {
    fetchProjects()
    setIsAssignTeamModalOpen(false)
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500">Manage your Scrum projects and teams</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#1E90FF] hover:bg-blue-600">
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search projects..."
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

          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAssignTeam(project.id)}>Assign Team</DropdownMenuItem>
                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Archive Project</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="mb-4 text-sm text-gray-500 line-clamp-2">{project.description}</p>

                  <div className="mb-4 flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <CalendarDays className="mr-1 h-4 w-4 text-gray-400" />
                      <span>{project.startDate}</span>
                    </div>
                    <span>to</span>
                    <div className="flex items-center">
                      <CalendarDays className="mr-1 h-4 w-4 text-gray-400" />
                      <span>{project.endDate}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress
                      value={project.progress}
                      className="h-2"
                      indicatorClassName={getProgressColor(project.status)}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4 text-gray-400" />
                      <span className="text-sm">{project.teamCount} Teams</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4 text-gray-400" />
                      <span className="text-sm">{project.promptCount} Prompts</span>
                    </div>
                  </div>

                  {project.teams.length > 0 && (
                    <div className="mt-4">
                      <div className="flex -space-x-2">
                        {project.teams.slice(0, 3).map((team, index) => (
                          <Avatar key={index} className="border-2 border-white">
                            <AvatarFallback>{team.substring(5, 6)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {project.teams.length > 3 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs">
                            +{project.teams.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/projects/${project.id}`}>View Project</a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredProjects.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-full bg-gray-100 p-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "All"
                ? "Try adjusting your search or filters"
                : "Create your first project to get started"}
            </p>
            {(searchTerm || statusFilter !== "All") && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("All")
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      <ProjectCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleProjectCreated}
      />
      <AssignTeamModal
        isOpen={isAssignTeamModalOpen}
        onClose={() => setIsAssignTeamModalOpen(false)}
        projectId={selectedProject}
        onSuccess={handleTeamsAssigned}
      />
    </>
  )
}
