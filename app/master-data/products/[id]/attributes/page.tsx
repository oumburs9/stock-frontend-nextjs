import { RequirePermission } from "@/components/auth/require-permission"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductAttributeValuesContent } from "@/components/master-data/products/product-attribute-values-content"

export default async function ProductAttributeValuesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <DashboardLayout>
      <RequirePermission permission="product-attribute:value:view">
        <ProductAttributeValuesContent productId={id} />
      </RequirePermission>
    </DashboardLayout>
  )
}
