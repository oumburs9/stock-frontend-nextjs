import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductAttributeValuesContent } from "@/components/master-data/products/product-attribute-values-content"

export default async function ProductAttributeValuesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <DashboardLayout>
      <ProductAttributeValuesContent productId={id} />
    </DashboardLayout>
  )
}
