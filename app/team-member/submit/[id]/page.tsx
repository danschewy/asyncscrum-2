import { ResponseSubmissionPage } from "@/components/response-submission-page"
import { MainLayout } from "@/components/main-layout"

export default function SubmitResponsePage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <ResponseSubmissionPage promptId={params.id} />
    </MainLayout>
  )
}
