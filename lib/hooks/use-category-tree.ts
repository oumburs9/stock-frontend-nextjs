import { useQuery } from "@tanstack/react-query"
import { categoryService } from "@/lib/services/category.service"

// Get category tree
export function useCategoryTree() {
  return useQuery({
    queryKey: ["category-tree"],
    queryFn: () => categoryService.getCategoryTree(),
  })
}
