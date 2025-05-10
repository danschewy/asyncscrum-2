"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AssignTeamModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number | null
}

// Sample data for teams
const teamsData = [
  { id: 1, name: "Team Alpha", members: 5, assigned: true },
  { id: 2, name: "Team Beta", members: 4, assigned: true },
  { id: 3, name: "Team Gamma", members: 3, assigned: false },
  { id: 4, name: "Team Delta", members: 6, assigned: false },
  { id: 5, name: "Team Epsilon", members: 4, assigned: true },
  { id: 6, name: "Team Zeta", members: 3, assigned: false },
]

export function AssignTeamModal({ isOpen, onClose, projectId }: AssignTeamModalProps) {
  const [selectedTeams, setSelectedTeams] = useState<number[]>(
    teamsData.filter((team) => team.assigned).map((team) => team.id),
  )

  const handleTeamToggle = (teamId: number) => {
    setSelectedTeams((prev) => (prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]))
  }

  const handleSubmit = () => {
    console.log({
      projectId,
      assignedTeams: selectedTeams,
    })

    // Close modal
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Teams to Project</DialogTitle>
          <DialogDescription>Select the teams you want to assign to this project.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label className="mb-3 block">Available Teams</Label>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-4">
              {teamsData.map((team) => (
                <div key={team.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`team-${team.id}`}
                    checked={selectedTeams.includes(team.id)}
                    onCheckedChange={() => handleTeamToggle(team.id)}
                  />
                  <Label
                    htmlFor={`team-${team.id}`}
                    className="flex flex-1 items-center justify-between text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <span>{team.name}</span>
                    <span className="text-xs text-gray-500">{team.members} members</span>
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-[#1E90FF] hover:bg-blue-600">
            Save Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
