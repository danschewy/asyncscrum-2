"use client"

import { useState } from "react"
import { Calendar, Check, Clock, Filter, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Sample data for the team member dashboard
const promptCards = [
  {
    id: 1,
    title: "Daily Standup",
    deadline: "Apr 30, 2025, 9:00 AM",
    status: "pending", // pending, submitted
    timeLeft: "1 day left",
    ceremonyType: "Standup",
  },
  {
    id: 2,
    title: "Sprint 3 Retrospective",
    deadline: "May 2, 2025, 2:00 PM",
    status: "submitted",
    timeLeft: "3 days left",
    ceremonyType: "Retrospective",
    submittedAt: "Apr 29, 2025, 10:15 AM",
  },
  {
    id: 3,
    title: "Sprint Planning",
    deadline: "Apr 29, 2025, 10:00 AM",
    status: "pending",
    timeLeft: "Due today",
    ceremonyType: "Planning",
  },
  {
    id: 4,
    title: "Backlog Refinement",
    deadline: "Apr 28, 2025, 11:00 AM",
    status: "submitted",
    timeLeft: "Overdue",
    ceremonyType: "Refinement",
    submittedAt: "Apr 28, 2025, 10:45 AM",
  },
]

const statusOptions = ["All", "Pending", "Submitted"]

export function TeamMemberDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  // Filter prompts based on search term and status filter
  const filteredPrompts = promptCards.filter((prompt) => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending" && prompt.status === "pending") ||
      (statusFilter === "Submitted" && prompt.status === "submitted")

    return matchesSearch && matchesStatus
  })

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Get time left color
  const getTimeLeftColor = (timeLeft: string) => {
    if (timeLeft.includes("Overdue")) return "text-red-500"
    if (timeLeft.includes("today")) return "text-yellow-500"
    return "text-gray-500"
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Tasks</h1>
        <p className="text-gray-500">Respond to prompts from your Scrum Master</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search tasks..."
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Badge variant="outline">{prompt.ceremonyType}</Badge>
                <Badge variant="outline" className={getStatusColor(prompt.status)}>
                  {prompt.status === "submitted" ? "Submitted" : "Pending"}
                </Badge>
              </div>
              <CardTitle className="text-lg">{prompt.title}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="mr-1 h-4 w-4" />
                <span>Due: {prompt.deadline}</span>
              </div>

              <div className="mt-2 flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <span className={`text-sm font-medium ${getTimeLeftColor(prompt.timeLeft)}`}>{prompt.timeLeft}</span>
              </div>

              {prompt.status === "submitted" && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Check className="mr-1 h-4 w-4 text-green-500" />
                  <span>Submitted: {prompt.submittedAt}</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {prompt.status === "pending" ? (
                <Button className="w-full bg-[#1E90FF] hover:bg-blue-600" asChild>
                  <Link href={`/team-member/submit/${prompt.id}`}>Submit Response</Link>
                </Button>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/team-member/view/${prompt.id}`}>View Submission</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="rounded-full bg-gray-100 p-3">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "All"
              ? "Try adjusting your search or filters"
              : "You're all caught up! Check back later for new tasks."}
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
  )
}
