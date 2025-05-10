import { ResponseViewPage } from "@/components/response-view-page"
import { MainLayout } from "@/components/main-layout"

export default function ResponsesPage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <ResponseViewPage promptId={params.id} />
    </MainLayout>
  )
}
