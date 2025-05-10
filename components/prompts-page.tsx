"use client"

import { useState } from "react"
import { Calendar, Clock, Filter, MoreHorizontal, Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PromptCreationModal } from "@/components/prompt-creation-modal"

// Sample data for prompts (similar to dashboard but with more details)
const promptsData = [
  {
    id: 1,
    title: "Daily Standup",
    deadline: "Apr 30, 2025, 9:00 AM",
    responses: 3,
    totalTeamMembers: 5,
    status: "in-progress", // in-progress, near-deadline, overdue, complete
    project: "Project Alpha",
    ceremonyType: "Standup",
    team: "Team Alpha",
    createdAt: "Apr 28, 2025, 10:00 AM",
  },
  {
    id: 2,
    title: "Sprint 3 Retrospective",
    deadline: "May 2, 2025, 2:00 PM",
    responses: 4,
    totalTeamMembers: 4,
    status: "complete",
    project: "Project Beta",
    ceremonyType: "Retrospective",
    team: "Team Gamma",
    createdAt: "Apr 27, 2025, 3:00 PM",
  },
  {
    id: 3,
    title: "Sprint Planning",
    deadline: "Apr 29, 2025, 10:00 AM",
    responses: 1,
    totalTeamMembers: 5,
    status: "near-deadline",
    project: "Project Alpha",
    ceremonyType: "Planning",
    team: "Team Alpha",
    createdAt: "Apr 26, 2025, 11:00 AM",
  },
  {
    id: 4,
    title: "Backlog Refinement",
    deadline: "Apr 28, 2025, 11:00 AM",
    responses: 0,
    totalTeamMembers: 5,
    status: "overdue",
    project: "Project Gamma",
    ceremonyType: "Refinement",
    team: "Team Delta",
    createdAt: "Apr 25, 2025, 2:00 PM",
  },
  {
    id: 5,
    title: "Team Health Check",
    deadline: "May 5, 2025, 3:00 PM",
    responses: 2,
    totalTeamMembers: 5,
    status: "in-progress",
    project: "Project Beta",
    ceremonyType: "Health Check",
    team: "Team Gamma",
    createdAt: "Apr 28, 2025, 9:00 AM",
  },
  {
    id: 6,
    title: "Sprint Demo",
    deadline: "May 1, 2025, 1:00 PM",
    responses: 3,
    totalTeamMembers: 5,
    status: "in-progress",
    project: "Project Alpha",
    ceremonyType: "Demo",
    team: "Team Beta",
    createdAt: "Apr 27, 2025, 4:00 PM",
  },
]

const projects = ["All Projects", "Project Alpha", "Project Beta", "Project Gamma"]
const ceremonyTypes = ["All Ceremonies", "Standup", "Retrospective", "Planning", "Refinement", "Demo", "Health Check"]
const teams = ["All Teams", "Team Alpha", "Team Beta", "Team Gamma", "Team Delta"]
const statuses = ["All Statuses", "In Progress", "Near Deadline", "Overdue", "Complete"]

export function PromptsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("All Projects")
  const [ceremonyFilter, setCeremonyFilter] = useState("All Ceremonies")
  const [teamFilter, setTeamFilter] = useState("All Teams")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter prompts based on search term and filters
  const filteredPrompts = promptsData.filter((prompt) => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = projectFilter === "All Projects" || prompt.project === projectFilter
    const matchesCeremony = ceremonyFilter === "All Ceremonies" || prompt.ceremonyType === ceremonyFilter
    const matchesTeam = teamFilter === "All Teams" || prompt.team === teamFilter
    const matchesStatus =
      statusFilter === "All Statuses" ||
      (statusFilter === "In Progress" && prompt.status === "in-progress") ||
      (statusFilter === "Near Deadline" && prompt.status === "near-deadline") ||
      (statusFilter === "Overdue" && prompt.status === "overdue") ||
      (statusFilter === "Complete" && prompt.status === "complete")

    return matchesSearch && matchesProject && matchesCeremony && matchesTeam && matchesStatus
  })

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800 border-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "near-deadline":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Get progress color
  const getProgressColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "near-deadline":
        return "bg-yellow-500"
      case "overdue":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setProjectFilter("All Projects")
    setCeremonyFilter("All Ceremonies")
    setTeamFilter("All Teams")
    setStatusFilter("All Statuses")
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prompts</h1>
            <p className="text-gray-500">Manage all your Scrum prompts across projects</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#1E90FF] hover:bg-blue-600">
            <Plus className="mr-2 h-4 w-4" />
            Create New Prompt
          </Button>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search prompts..."
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

          <div className="flex flex-wrap gap-2">
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ceremonyFilter} onValueChange={setCeremonyFilter}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Ceremony Type" />
              </SelectTrigger>
              <SelectContent>
                {ceremonyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchTerm ||
              projectFilter !== "All Projects" ||
              ceremonyFilter !== "All Ceremonies" ||
              teamFilter !== "All Teams" ||
              statusFilter !== "All Statuses") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Badge variant="outline">{prompt.ceremonyType}</Badge>
                  <Badge variant="outline" className={getStatusColor(prompt.status)}>
                    {prompt.status === "complete"
                      ? "Complete"
                      : prompt.status === "in-progress"
                        ? "In Progress"
                        : prompt.status === "near-deadline"
                          ? "Due Soon"
                          : "Overdue"}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{prompt.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
                  <span>{prompt.project}</span>
                  <span>{prompt.team}</span>
                </div>

                <div className="mb-4 flex items-center text-sm text-gray-500">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>Due: {prompt.deadline}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Responses</span>
                    <span className="font-medium">
                      {prompt.responses}/{prompt.totalTeamMembers}
                    </span>
                  </div>
                  <Progress
                    value={(prompt.responses / prompt.totalTeamMembers) * 100}
                    className="h-2"
                    indicatorClassName={getProgressColor(prompt.status)}
                  />
                </div>

                <div className="mt-4 text-xs text-gray-500">Created: {prompt.createdAt}</div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/responses/${prompt.id}`}>View Responses</a>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Edit Prompt</DropdownMenuItem>
                    <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Delete Prompt</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-full bg-gray-100 p-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No prompts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ||
              projectFilter !== "All Projects" ||
              ceremonyFilter !== "All Ceremonies" ||
              teamFilter !== "All Teams" ||
              statusFilter !== "All Statuses"
                ? "Try adjusting your search or filters"
                : "Create your first prompt to get started"}
            </p>
            {(searchTerm ||
              projectFilter !== "All Projects" ||
              ceremonyFilter !== "All Ceremonies" ||
              teamFilter !== "All Teams" ||
              statusFilter !== "All Statuses") && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      <PromptCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
