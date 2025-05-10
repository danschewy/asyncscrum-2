"use client"

import { useState } from "react"
import { ArrowLeft, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface ResponseViewPageProps {
  promptId: string
}

// Sample data for the responses
const promptData = {
  id: "1",
  title: "Daily Standup",
  description:
    "Please share what you worked on yesterday, what you plan to work on today, and any blockers you're facing.",
  deadline: "Apr 30, 2025, 9:00 AM",
  responses: 3,
  totalTeamMembers: 5,
  status: "in-progress",
  project: "Project Alpha",
  ceremonyType: "Standup",
  videoUrl: null,
}

const teamMembers = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Frontend Developer",
    hasResponded: true,
    responseTime: "Apr 29, 2025, 2:15 PM",
    response:
      "Yesterday: Completed the navigation component and fixed 3 UI bugs.\n\nToday: Working on the dashboard charts and starting the filter component.\n\nBlockers: None at the moment.",
    videoResponse: null,
  },
  {
    id: 2,
    name: "Jamie Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Backend Developer",
    hasResponded: true,
    responseTime: "Apr 29, 2025, 3:30 PM",
    response:
      "Yesterday: Implemented the authentication API and wrote tests.\n\nToday: Working on the data export functionality and reviewing PRs.\n\nBlockers: Waiting for DevOps to set up the new database instance.",
    videoResponse: null,
  },
  {
    id: 3,
    name: "Taylor Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "UX Designer",
    hasResponded: true,
    responseTime: "Apr 29, 2025, 4:45 PM",
    response:
      "Yesterday: Finalized the design system components and presented to stakeholders.\n\nToday: Creating user flows for the new onboarding process.\n\nBlockers: Need feedback from product on the latest wireframes.",
    videoResponse: null,
  },
  {
    id: 4,
    name: "Morgan Lee",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "QA Engineer",
    hasResponded: false,
    responseTime: null,
    response: null,
    videoResponse: null,
  },
  {
    id: 5,
    name: "Casey Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Product Manager",
    hasResponded: false,
    responseTime: null,
    response: null,
    videoResponse: null,
  },
]

export function ResponseViewPage({ promptId }: ResponseViewPageProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [feedbackText, setFeedbackText] = useState<Record<number, string>>({})

  // Filter responses based on active tab
  const filteredMembers = teamMembers.filter((member) => {
    if (activeTab === "all") return true
    if (activeTab === "responded") return member.hasResponded
    if (activeTab === "pending") return !member.hasResponded
    return true
  })

  const handleSendReminder = (memberId: number) => {
    console.log(`Sending reminder to member ${memberId}`)
    // In a real app, this would trigger a Slack notification
  }

  const handleSendFeedback = (memberId: number) => {
    console.log(`Sending feedback to member ${memberId}: ${feedbackText[memberId]}`)
    setFeedbackText((prev) => ({
      ...prev,
      [memberId]: "",
    }))
    // In a real app, this would save the feedback and notify the team member
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Link href="/dashboard" className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{promptData.title}</h1>
              <Badge variant="outline">{promptData.ceremonyType}</Badge>
            </div>
            <p className="text-gray-500">Due: {promptData.deadline}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {promptData.responses}/{promptData.totalTeamMembers} Responses
            </span>
            <Progress value={(promptData.responses / promptData.totalTeamMembers) * 100} className="h-2 w-24" />
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Prompt Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-gray-700">{promptData.description}</p>

          {promptData.videoUrl && (
            <div className="mt-4 aspect-video overflow-hidden rounded-md bg-gray-100">
              <video controls className="h-full w-full" poster="/placeholder.svg?height=360&width=640">
                <source src={promptData.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All ({teamMembers.length})</TabsTrigger>
              <TabsTrigger value="responded">
                Responded ({teamMembers.filter((m) => m.hasResponded).length})
              </TabsTrigger>
              <TabsTrigger value="pending">Pending ({teamMembers.filter((m) => !m.hasResponded).length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <ResponseCard
                  key={member.id}
                  member={member}
                  feedbackText={feedbackText[member.id] || ""}
                  onFeedbackChange={(text) => setFeedbackText((prev) => ({ ...prev, [member.id]: text }))}
                  onSendReminder={() => handleSendReminder(member.id)}
                  onSendFeedback={() => handleSendFeedback(member.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="responded" className="mt-4">
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <ResponseCard
                  key={member.id}
                  member={member}
                  feedbackText={feedbackText[member.id] || ""}
                  onFeedbackChange={(text) => setFeedbackText((prev) => ({ ...prev, [member.id]: text }))}
                  onSendReminder={() => handleSendReminder(member.id)}
                  onSendFeedback={() => handleSendFeedback(member.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <ResponseCard
                  key={member.id}
                  member={member}
                  feedbackText={feedbackText[member.id] || ""}
                  onFeedbackChange={(text) => setFeedbackText((prev) => ({ ...prev, [member.id]: text }))}
                  onSendReminder={() => handleSendReminder(member.id)}
                  onSendFeedback={() => handleSendFeedback(member.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface ResponseCardProps {
  member: (typeof teamMembers)[0]
  feedbackText: string
  onFeedbackChange: (text: string) => void
  onSendReminder: () => void
  onSendFeedback: () => void
}

function ResponseCard({ member, feedbackText, onFeedbackChange, onSendReminder, onSendFeedback }: ResponseCardProps) {
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback>
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{member.name}</CardTitle>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          </div>
          {member.hasResponded ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              Responded
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Pending
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        {member.hasResponded ? (
          <>
            <p className="mb-2 text-xs text-gray-500">Submitted: {member.responseTime}</p>

            {member.videoResponse ? (
              <div className="mb-4 aspect-video overflow-hidden rounded-md bg-gray-100">
                <video controls className="h-full w-full" poster="/placeholder.svg?height=180&width=320">
                  <source src={member.videoResponse} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : null}

            <div className="rounded-md bg-gray-50 p-3">
              <p className="whitespace-pre-line text-sm">{member.response}</p>
            </div>

            {showFeedback ? (
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="You" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">Your feedback</span>
                </div>
                <div className="mt-2">
                  <Textarea
                    placeholder="Add your feedback..."
                    value={feedbackText}
                    onChange={(e) => onFeedbackChange(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex h-20 items-center justify-center rounded-md bg-gray-50">
            <p className="text-sm text-gray-500">No response yet</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        {member.hasResponded ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowFeedback(!showFeedback)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              {showFeedback ? "Hide Feedback" : "Add Feedback"}
            </Button>

            {showFeedback && (
              <Button
                size="sm"
                className="bg-[#1E90FF] hover:bg-blue-600"
                disabled={!feedbackText.trim()}
                onClick={onSendFeedback}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Feedback
              </Button>
            )}
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onSendReminder}>
            <Send className="mr-2 h-4 w-4" />
            Send Reminder
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
