"use client"

import { useEffect, useState } from "react"
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
import { updateCeremony } from "@/actions/ceremony-actions"
import { useToast } from "@/hooks/use-toast"

interface CeremonyEditModalProps {
  isOpen: boolean
  onClose: () => void
  ceremonyId: string | null
  ceremony?: {
    id: string
    name: string
    description: string
    duration: number
    frequency: string
    color: string
  }
  onSuccess?: () => void
}

export function CeremonyEditModal({ isOpen, onClose, ceremonyId, ceremony, onSuccess }: CeremonyEditModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [frequency, setFrequency] = useState("")
  const [color, setColor] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (ceremony) {
      setName(ceremony.name)
      setDescription(ceremony.description)
      setDuration(ceremony.duration.toString())
      setFrequency(ceremony.frequency)
      setColor(ceremony.color)
    }
  }, [ceremony])

  const handleSubmit = async () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!name) newErrors.name = "Ceremony name is required"
    if (!description) newErrors.description = "Description is required"
    if (!duration) newErrors.duration = "Duration is required"
    else if (isNaN(Number(duration))) newErrors.duration = "Duration must be a number"
    if (!frequency) newErrors.frequency = "Frequency is required"
    if (!color) newErrors.color = "Color is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (!ceremonyId) {
      toast({
        title: "Error",
        description: "Ceremony ID is missing",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("id", ceremonyId)
      formData.append("name", name)
      formData.append("description", description)
      formData.append("duration", duration)
      formData.append("frequency", frequency)
      formData.append("color", color)

      const result = await updateCeremony(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Ceremony updated successfully",
        })
        if (onSuccess) {
          onSuccess()
        } else {
          onClose()
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update ceremony",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating ceremony:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Ceremony</DialogTitle>
          <DialogDescription>Update the ceremony details.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Ceremony Name</Label>
            <Input
              id="name"
              placeholder="e.g., Daily Standup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about the ceremony..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className={errors.duration ? "border-red-500" : ""}
              />
              {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="frequency" className={errors.frequency ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Every 2 weeks">Every 2 weeks</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {errors.frequency && <p className="text-xs text-red-500">{errors.frequency}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="color">Color</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger id="color" className={errors.color ? "border-red-500" : ""}>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="red">Red</SelectItem>
              </SelectContent>
            </Select>
            {errors.color && <p className="text-xs text-red-500">{errors.color}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-[#1E90FF] hover:bg-blue-600" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
