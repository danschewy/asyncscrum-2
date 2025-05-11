"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { sendFeedback } from "@/actions/prompt-actions"
import { useToast } from "@/hooks/use-toast"

interface ResponseViewPageProps {
  promptId: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  hasResponded: boolean
  responseTime: string | null
  response: string | null
  videoResponse: string | null
}

interface PromptData {
  id: string
  title: string
  description: string
  deadline: string
  responses: number
  totalTeamMembers: number
  status: string
  project: string
  ceremonyType: string
  videoUrl: string | null
  teamMembers: TeamMember[]
}

export function ResponseViewPage({ promptId }: ResponseViewPageProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({})
  const [promptData, setPromptData] = useState<PromptData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingFeedback, setIsSendingFeedback] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchPromptData()
  }, [promptId])

  const fetchPromptData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/prompts/${promptId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch prompt data")
      }
      const data = await response.json()
      setPromptData(data)
    } catch (error) {
      console.error("Error fetching prompt data:", error)
      toast({
        title: "Error",
        description: "Failed to load prompt data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter responses based on active tab
  const filteredMembers =
    promptData?.teamMembers.filter((member) => {
      if (activeTab === "all") return true
      if (activeTab === "responded") return member.hasResponded
      if (activeTab === "pending") return !member.hasResponded
      return true
    }) || []

  const handleSendReminder = async (memberId: string) => {
    // In a real app, this would trigger a notification to the team member
    toast({
      title: "Reminder Sent",
      description: "A reminder has been sent to the team member.",
    })
  }

  const handleSendFeedback = async (memberId: string) => {
    if (!feedbackText[memberId]?.trim()) return

    setIsSendingFeedback((prev) => ({ ...prev, [memberId]: true }))

    try {
      // Find the response ID for this member
      const member = promptData?.teamMembers.find((m) => m.id === memberId)
      if (!member || !member.hasResponded) {
        throw new Error("Cannot send feedback to a member who hasn't responded")
      }

      // In a real app, you would get the response ID from the member's response
      // For now, we'll use a placeholder
      const responseId = `response-${memberId}-${promptId}`

      const formData = new FormData()
      formData.append("responseId", responseId)
      formData.append("text", feedbackText[memberId])

      const result = await sendFeedback(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Feedback sent successfully",
        })
        setFeedbackText((prev) => ({
          ...prev,
          [memberId]: "",
        }))
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send feedback",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending feedback:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingFeedback((prev) => ({ ...prev, [memberId]: false }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!promptData) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <h3 className="text-lg font-medium">Prompt not found</h3>
          <p className="mt-2">The prompt you're looking for doesn't exist or you don't have access to it.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
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
              <TabsTrigger value="all">All ({promptData.teamMembers.length})</TabsTrigger>
              <TabsTrigger value="responded">
                Responded ({promptData.teamMembers.filter((m) => m.hasResponded).length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({promptData.teamMembers.filter((m) => !m.hasResponded).length})
              </TabsTrigger>
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
                  isSendingFeedback={isSendingFeedback[member.id] || false}
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
                  isSendingFeedback={isSendingFeedback[member.id] || false}
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
                  isSendingFeedback={isSendingFeedback[member.id] || false}
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
  member: TeamMember
  feedbackText: string
  onFeedbackChange: (text: string) => void
  onSendReminder: () => void
  onSendFeedback: () => void
  isSendingFeedback: boolean
}

function ResponseCard({
  member,
  feedbackText,
  onFeedbackChange,
  onSendReminder,
  onSendFeedback,
  isSendingFeedback,
}: ResponseCardProps) {
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={member.avatar || "/placeholder.svg?height=40&width=40"} alt={member.name} />
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
                disabled={!feedbackText.trim() || isSendingFeedback}
                onClick={onSendFeedback}
              >
                {isSendingFeedback ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Feedback
                  </>
                )}
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
