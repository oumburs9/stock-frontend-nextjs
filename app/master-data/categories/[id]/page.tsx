import { CategoryDetailContent } from "@/components/master-data/categories/category-detail-content"


export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <CategoryDetailContent id={id} />
}


