
import { PartnerDetailContent } from "@/components/master-data/partners/partner-detail-content"

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <PartnerDetailContent id={id} />
}

