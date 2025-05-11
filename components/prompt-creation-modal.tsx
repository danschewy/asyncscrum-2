"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar, Clock, Upload, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { createPrompt } from "@/actions/prompt-actions"
import { useToast } from "@/hooks/use-toast"

interface PromptCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface Team {
  id: string
  name: string
}

interface CeremonyType {
  id: string
  name: string
}

export function PromptCreationModal({ isOpen, onClose, onSuccess }: PromptCreationModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [team, setTeam] = useState("")
  const [ceremonyType, setCeremonyType] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [ceremonyTypes, setCeremonyTypes] = useState<CeremonyType[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchTeams()
      fetchCeremonyTypes()
    }
  }, [isOpen])

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams")
      if (!response.ok) {
        throw new Error("Failed to fetch teams")
      }
      const data = await response.json()
      setTeams(data.map((team: any) => ({ id: team.id, name: team.name })))
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast({
        title: "Error",
        description: "Failed to load teams. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchCeremonyTypes = async () => {
    try {
      const response = await fetch("/api/ceremonies")
      if (!response.ok) {
        throw new Error("Failed to fetch ceremonies")
      }
      const data = await response.json()
      setCeremonyTypes(data.map((ceremony: any) => ({ id: ceremony.id, name: ceremony.name })))
    } catch (error) {
      console.error("Error fetching ceremonies:", error)
      toast({
        title: "Error",
        description: "Failed to load ceremony types. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("video/")) {
        handleFileUpload(file)
      } else {
        setErrors({ video: "Please upload a video file" })
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.type.startsWith("video/")) {
        handleFileUpload(file)
      } else {
        setErrors({ video: "Please upload a video file" })
      }
    }
  }

  const handleFileUpload = (file: File) => {
    setVideoFile(file)
    setErrors({})

    // Simulate upload progress
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleSubmit = async () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!title) newErrors.title = "Title is required"
    if (!description) newErrors.description = "Description is required"
    if (!team) newErrors.team = "Team is required"
    if (!ceremonyType) newErrors.ceremonyType = "Ceremony type is required"
    if (!date) newErrors.date = "Date is required"
    if (!time) newErrors.time = "Time is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, you would upload the video file to a storage service
      // and get a URL to store in the database
      let videoUrl = null
      if (videoFile) {
        // This is a placeholder for video upload logic
        videoUrl = URL.createObjectURL(videoFile)
      }

      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("team", team)
      formData.append("ceremonyType", ceremonyType)
      formData.append("date", date)
      formData.append("time", time)
      if (videoUrl) {
        formData.append("videoUrl", videoUrl)
      }

      const result = await createPrompt(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Prompt created successfully",
        })
        resetForm()
        if (onSuccess) {
          onSuccess()
        } else {
          onClose()
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create prompt",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating prompt:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setTeam("")
    setCeremonyType("")
    setDate("")
    setTime("")
    setVideoFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Prompt</DialogTitle>
          <DialogDescription>Create a new prompt for your team to respond to asynchronously.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Daily Standup - Week 12"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about what you want the team to respond to..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ceremony-type">Ceremony Type</Label>
              <Select value={ceremonyType} onValueChange={setCeremonyType}>
                <SelectTrigger id="ceremony-type" className={errors.ceremonyType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select ceremony type" />
                </SelectTrigger>
                <SelectContent>
                  {ceremonyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ceremonyType && <p className="text-xs text-red-500">{errors.ceremonyType}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="team">Team</Label>
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger id="team" className={errors.team ? "border-red-500" : ""}>
                  <Users className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.team && <p className="text-xs text-red-500">{errors.team}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`pl-10 ${errors.date ? "border-red-500" : ""}`}
                />
              </div>
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`pl-10 ${errors.time ? "border-red-500" : ""}`}
                />
              </div>
              {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Video Prompt (Optional)</Label>
            <div
              className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 transition-colors hover:bg-gray-50 ${errors.video ? "border-red-500" : ""}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("video-upload")?.click()}
            >
              {!videoFile ? (
                <>
                  <Upload className="mb-2 h-10 w-10 text-gray-400" />
                  <p className="text-sm text-gray-500">Drag and drop a video file here, or click to browse</p>
                  <p className="mt-1 text-xs text-gray-400">MP4, WebM or MOV up to 100MB</p>
                </>
              ) : (
                <>
                  {isUploading ? (
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Uploading...</span>
                        <span className="text-sm text-gray-500">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  ) : (
                    <div className="flex w-full items-center gap-2">
                      <div className="flex-1">
                        <p className="truncate text-sm font-medium">{videoFile.name}</p>
                        <p className="text-xs text-gray-500">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setVideoFile(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
              <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            </div>
            {errors.video && <p className="text-xs text-red-500">{errors.video}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#1E90FF] hover:bg-blue-600"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              "Create Prompt"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
