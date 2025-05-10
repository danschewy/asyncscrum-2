"use client"

import { useState } from "react"
import { ArrowLeft, Clock, Send, Video, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

interface ResponseSubmissionPageProps {
  promptId: string
}

// Sample data for the prompt
const promptData = {
  id: "1",
  title: "Daily Standup",
  description:
    "Please share what you worked on yesterday, what you plan to work on today, and any blockers you're facing.",
  deadline: "Apr 30, 2025, 9:00 AM",
  timeLeft: "1 day left",
  status: "pending",
  ceremonyType: "Standup",
  videoUrl: null,
}

export function ResponseSubmissionPage({ promptId }: ResponseSubmissionPageProps) {
  const [response, setResponse] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [videoResponse, setVideoResponse] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setShowConfirmation(true)
    }, 1000)
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    // In a real app, this would start video recording
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setVideoResponse("/placeholder.svg?height=180&width=320")
    // In a real app, this would stop recording and save the video
  }

  const handleDeleteVideo = () => {
    setVideoResponse(null)
  }

  const getTimeLeftColor = (timeLeft: string) => {
    if (timeLeft.includes("Overdue")) return "text-red-500"
    if (timeLeft.includes("today")) return "text-yellow-500"
    return "text-gray-500"
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <Link href="/team-member" className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Tasks
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{promptData.title}</h1>
            <Badge variant="outline">{promptData.ceremonyType}</Badge>
          </div>

          <div className="mt-1 flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span className="text-sm text-gray-500">Due: {promptData.deadline}</span>
            <span className={`ml-2 text-sm font-medium ${getTimeLeftColor(promptData.timeLeft)}`}>
              ({promptData.timeLeft})
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Prompt Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-gray-700">{promptData.description}</p>

              {promptData.videoUrl && (
                <div className="mt-4 aspect-video overflow-hidden rounded-md bg-gray-100">
                  <video controls className="h-full w-full" poster="/placeholder.svg?height=180&width=320">
                    <source src={promptData.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your response here..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-[200px]"
                />

                {videoResponse ? (
                  <div className="relative aspect-video overflow-hidden rounded-md bg-gray-100">
                    <video controls className="h-full w-full" poster={videoResponse}>
                      <source src={videoResponse} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={handleDeleteVideo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    {isRecording ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-red-500">Recording...</span>
                          <span className="text-sm text-gray-500">00:15</span>
                        </div>
                        <Progress value={50} className="h-2" indicatorClassName="bg-red-500" />
                        <Button variant="outline" className="w-full" onClick={handleStopRecording}>
                          Stop Recording
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full" onClick={handleStartRecording}>
                        <Video className="mr-2 h-4 w-4" />
                        Record Video Response
                      </Button>
                    )}
                  </div>
                )}

                <Button
                  className="w-full bg-[#1E90FF] hover:bg-blue-600"
                  disabled={!response.trim() && !videoResponse}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Response
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Response Submitted</DialogTitle>
            <DialogDescription>Your response has been successfully submitted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild>
              <Link href="/team-member">Return to Dashboard</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
