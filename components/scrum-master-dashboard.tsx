"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Filter, Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PromptCreationModal } from "@/components/prompt-creation-modal"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface Prompt {
  id: string
  title: string
  deadline: string
  responses: number
  totalTeamMembers: number
  status: string
  project: string
  ceremonyType: string
}

export function ScrumMasterDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("All Projects")
  const [ceremonyFilter, setCeremonyFilter] = useState("All Ceremonies")
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [ceremonyTypes, setCeremonyTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPrompts()
    fetchProjects()
    fetchCeremonyTypes()
  }, [])

  const fetchPrompts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/prompts")
      if (!response.ok) {
        throw new Error("Failed to fetch prompts")
      }
      const data = await response.json()
      setPrompts(data)
    } catch (error) {
      console.error("Error fetching prompts:", error)
      toast({
        title: "Error",
        description: "Failed to load prompts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }
      const data = await response.json()
      const projectNames = ["All Projects", ...data.map((project: any) => project.name)]
      setProjects(projectNames)
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const fetchCeremonyTypes = async () => {
    try {
      const response = await fetch("/api/ceremonies")
      if (!response.ok) {
        throw new Error("Failed to fetch ceremonies")
      }
      const data = await response.json()
      const ceremonyNames = ["All Ceremonies", ...data.map((ceremony: any) => ceremony.name)]
      setCeremonyTypes(ceremonyNames)
    } catch (error) {
      console.error("Error fetching ceremonies:", error)
    }
  }

  // Filter prompts based on search term and filters
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = projectFilter === "All Projects" || prompt.project === projectFilter
    const matchesCeremony = ceremonyFilter === "All Ceremonies" || prompt.ceremonyType === ceremonyFilter

    return matchesSearch && matchesProject && matchesCeremony
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

  const handlePromptCreated = () => {
    fetchPrompts()
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
            <p className="text-gray-500">Manage your Scrum prompts and responses</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#1E90FF] hover:bg-blue-600">
            <Plus className="mr-2 h-4 w-4" />
            Create New Prompt
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
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

          <div className="flex gap-2">
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
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
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
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/responses/${prompt.id}`}>View Responses</a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredPrompts.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-full bg-gray-100 p-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No prompts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || projectFilter !== "All Projects" || ceremonyFilter !== "All Ceremonies"
                ? "Try adjusting your search or filters"
                : "Create your first prompt to get started"}
            </p>
            {(searchTerm || projectFilter !== "All Projects" || ceremonyFilter !== "All Ceremonies") && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("")
                  setProjectFilter("All Projects")
                  setCeremonyFilter("All Ceremonies")
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      <PromptCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handlePromptCreated} />
    </>
  )
}
