"use client"

import { useState, useEffect } from "react"
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
import { deleteCeremony } from "@/actions/ceremony-actions"
import { useToast } from "@/hooks/use-toast"

interface Ceremony {
  id: string
  name: string
  description: string
  duration: number
  frequency: string
  color: string
  promptCount: number
}

export function CeremoniesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCeremony, setSelectedCeremony] = useState<string | null>(null)
  const [ceremonies, setCeremonies] = useState<Ceremony[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCeremonies()
  }, [])

  const fetchCeremonies = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/ceremonies")
      if (!response.ok) {
        throw new Error("Failed to fetch ceremonies")
      }
      const data = await response.json()
      setCeremonies(data)
    } catch (error) {
      console.error("Error fetching ceremonies:", error)
      toast({
        title: "Error",
        description: "Failed to load ceremonies. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter ceremonies based on search term
  const filteredCeremonies = ceremonies.filter((ceremony) => {
    return ceremony.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleEditCeremony = (ceremonyId: string) => {
    setSelectedCeremony(ceremonyId)
    setIsEditModalOpen(true)
  }

  const handleDeleteCeremony = (ceremonyId: string) => {
    setSelectedCeremony(ceremonyId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedCeremony) return

    setIsDeleting(true)

    try {
      const formData = new FormData()
      formData.append("id", selectedCeremony)

      const result = await deleteCeremony(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Ceremony deleted successfully",
        })
        fetchCeremonies()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete ceremony",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting ceremony:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
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

  const handleCeremonyCreated = () => {
    fetchCeremonies()
    setIsCreateModalOpen(false)
  }

  const handleCeremonyUpdated = () => {
    fetchCeremonies()
    setIsEditModalOpen(false)
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

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
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
        )}

        {!isLoading && filteredCeremonies.length === 0 && (
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

      <CeremonyCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCeremonyCreated}
      />
      <CeremonyEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        ceremonyId={selectedCeremony}
        ceremony={selectedCeremony ? ceremonies.find((c) => c.id === selectedCeremony) : undefined}
        onSuccess={handleCeremonyUpdated}
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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
