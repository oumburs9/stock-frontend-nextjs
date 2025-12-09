import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AttributeSetDetailContent } from "@/components/master-data/attribute-sets/attribute-set-detail-content"

export default async function AttributeSetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <DashboardLayout>
      <AttributeSetDetailContent id={id} />
    </DashboardLayout>
  )
}
