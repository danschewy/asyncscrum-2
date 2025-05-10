"use client"

import { useState } from "react"
import { Clock, Edit, MoreHorizontal, Plus, Search, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CeremonyCreationModal } from "@/components/ceremony-creation-modal"
import { CeremonyEditModal } from "@/components/ceremony-edit-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Sample data for ceremonies
const ceremoniesData = [
  {
    id: 1,
    name: "Daily Standup",
    description:
      "A short daily meeting where team members share what they did yesterday, what they plan to do today, and any blockers they're facing.",
    duration: 15,
    frequency: "Daily",
    color: "blue",
    promptCount: 24,
  },
  {
    id: 2,
    name: "Sprint Planning",
    description:
      "A meeting at the beginning of each sprint where the team decides what work to complete in the upcoming sprint.",
    duration: 120,
    frequency: "Every 2 weeks",
    color: "green",
    promptCount: 6,
  },
  {
    id: 3,
    name: "Sprint Review",
    description:
      "A meeting at the end of each sprint where the team demonstrates what they've accomplished during the sprint.",
    duration: 60,
    frequency: "Every 2 weeks",
    color: "purple",
    promptCount: 6,
  },
  {
    id: 4,
    name: "Sprint Retrospective",
    description:
      "A meeting at the end of each sprint where the team reflects on what went well, what could be improved, and what actions to take.",
    duration: 60,
    frequency: "Every 2 weeks",
    color: "orange",
    promptCount: 6,
  },
  {
    id: 5,
    name: "Backlog Refinement",
    description:
      "A meeting where the team reviews and refines the product backlog to ensure the backlog items are ready for future sprints.",
    duration: 60,
    frequency: "Weekly",
    color: "yellow",
    promptCount: 12,
  },
  {
    id: 6,
    name: "Team Health Check",
    description:
      "A meeting to assess the team's health and identify areas for improvement in team dynamics and processes.",
    duration: 30,
    frequency: "Monthly",
    color: "red",
    promptCount: 3,
  },
]

export function CeremoniesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCeremony, setSelectedCeremony] = useState<number | null>(null)

  // Filter ceremonies based on search term
  const filteredCeremonies = ceremoniesData.filter((ceremony) => {
    return ceremony.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleEditCeremony = (ceremonyId: number) => {
    setSelectedCeremony(ceremonyId)
    setIsEditModalOpen(true)
  }

  const handleDeleteCeremony = (ceremonyId: number) => {
    setSelectedCeremony(ceremonyId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    console.log(`Deleting ceremony ${selectedCeremony}`)
    setIsDeleteDialogOpen(false)
  }

  // Get color class based on ceremony color
  const getColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "green":
        return "bg-green-100 text-green-800 border-green-300"
      case "purple":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "orange":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "red":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ceremonies</h1>
            <p className="text-gray-500">Manage your Scrum ceremonies and templates</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#1E90FF] hover:bg-blue-600">
            <Plus className="mr-2 h-4 w-4" />
            Create New Ceremony
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search ceremonies..."
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
          {filteredCeremonies.map((ceremony) => (
            <Card key={ceremony.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Badge variant="outline" className={getColorClass(ceremony.color)}>
                    {ceremony.frequency}
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
                      <DropdownMenuItem onClick={() => handleEditCeremony(ceremony.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Ceremony
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteCeremony(ceremony.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Ceremony
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg">{ceremony.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="mb-4 text-sm text-gray-500 line-clamp-3">{ceremony.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{ceremony.duration} minutes</span>
                  </div>
                  <span className="text-sm text-gray-500">{ceremony.promptCount} prompts</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/ceremonies/${ceremony.id}`}>View Templates</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredCeremonies.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-full bg-gray-100 p-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No ceremonies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search" : "Create your first ceremony to get started"}
            </p>
            {searchTerm && (
              <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

      <CeremonyCreationModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <CeremonyEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        ceremonyId={selectedCeremony}
        ceremony={selectedCeremony ? ceremoniesData.find((c) => c.id === selectedCeremony) : undefined}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this ceremony and all associated templates. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
