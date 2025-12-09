import { ProductDetailContent } from "@/components/master-data/products/product_detail_content"


export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <ProductDetailContent id={id} />
}


