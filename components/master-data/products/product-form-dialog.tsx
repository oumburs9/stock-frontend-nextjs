"use client";

import type React from "react";
import { useEffect, useState } from "react";

import { useCreateProduct, useUpdateProduct } from "@/lib/hooks/use-products";
import { useCategories } from "@/lib/hooks/use-categories";
import { useUnits } from "@/lib/hooks/use-units";
import { useBrands } from "@/lib/hooks/use-brands";
import { useSetItems } from "@/lib/hooks/use-attribute-sets";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib/services/product.service";
import { attributeService } from "@/lib/services/attribute.service";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/shared/searchable-select";

import type { Product } from "@/lib/types/master-data";

interface ProductFormDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductFormDialog({ product, open, onOpenChange }: ProductFormDialogProps) {
  // ------------------------------------------------------
  // FORM STATE
  // ------------------------------------------------------
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category_id: "",
    unit_id: "",
    brand_id: "",
    base_price: "",
  });

  const [attributeValues, setAttributeValues] = useState<Record<string, any>>({});

  // ------------------------------------------------------
  // FETCH BASE DATA
  // ------------------------------------------------------
  const { data: categories } = useCategories();
  const { data: units } = useUnits();
  const { data: brands } = useBrands();

  // ------------------------------------------------------
  // FETCH FULL PRODUCT IN EDIT MODE
  // ------------------------------------------------------
  const { data: fullProduct } = useQuery({
    queryKey: ["product-full", product?.id],
    queryFn: () => (product ? productService.getProductFull(product.id) : null),
    enabled: !!product?.id && open,
  });

  const effectiveProduct = fullProduct ?? product;

  const selectedCategory = categories?.find((c) => c.id === formData.category_id);
  const attributeSetId = selectedCategory?.attribute_set_id ?? "";

  const { data: setItems } = useSetItems(attributeSetId);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  // ------------------------------------------------------
  // LOAD PRODUCT INTO FORM
  // ------------------------------------------------------
  useEffect(() => {
    console.log("🔵 Effective product in modal:", effectiveProduct);

    if (effectiveProduct) {
      setFormData({
        name: effectiveProduct.name,
        sku: effectiveProduct.sku,
        description: effectiveProduct.description ?? "",
        category_id: effectiveProduct.category_id ?? "",
        unit_id: effectiveProduct.unit_id ?? "",
        brand_id: effectiveProduct.brand_id ?? "",
        base_price: effectiveProduct.base_price ? String(effectiveProduct.base_price) : "",
      });

      const rawValues: Record<string, any> = {};

      effectiveProduct.attributes?.forEach((attr) => {
        rawValues[attr.attribute_id] =
          attr.value_text ??
          attr.value_number ??
          attr.value_date ??
          attr.value_bool ??
          "";
      });

      console.log("🟡 Raw dynamic attribute values from backend:", rawValues);

      setAttributeValues(rawValues);
    } else {
      setFormData({
        name: "",
        sku: "",
        description: "",
        category_id: "",
        unit_id: "",
        brand_id: "",
        base_price: "",
      });
      setAttributeValues({});
    }
  }, [effectiveProduct, open]);

  // ------------------------------------------------------
  // ALIGN ATTRIBUTES WITH setItems WHEN LOADED
  // ------------------------------------------------------
  useEffect(() => {
    if (!effectiveProduct || !setItems) return;

    console.log("🟣 attribute set items loaded:", setItems);

    const merged: Record<string, any> = {};

    setItems.forEach((item) => {
      const attrId = item.attribute_id;
      merged[attrId] = attributeValues[attrId] ?? "";
    });

    console.log("🟢 Merged attribute values:", merged);

    setAttributeValues(merged);
  }, [setItems]);

  // ------------------------------------------------------
  // FORM SUBMIT
  // ------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productPayload = {
      name: formData.name,
      sku: formData.sku,
      description: formData.description || undefined,
      category_id: formData.category_id,
      unit_id: formData.unit_id,
      brand_id: formData.brand_id || undefined,
      base_price: Number(formData.base_price),
    };

    console.log("🟦 Product payload:", productPayload);

    if (!product) {
      createMutation.mutate(productPayload, {
        onSuccess: async (created) => {
          console.log("🟢 Product created:", created);
          if (attributeSetId && setItems?.length) await saveAttributes(created.id);
          onOpenChange(false);
        },
      });
    } else {
      updateMutation.mutate(
        { id: product.id, data: productPayload },
        {
          onSuccess: async () => {
            console.log("🟢 Product updated");
            if (attributeSetId && setItems?.length) await saveAttributes(product.id);
            onOpenChange(false);
          },
        }
      );
    }
  };

  // ------------------------------------------------------
  // SAVE ATTRIBUTE VALUES
  // ------------------------------------------------------
  async function saveAttributes(productId: string) {
    if (!setItems) return;

    const payload = setItems.map((item) => {
      if (!item.attribute) return null;
      const attr = item.attribute;
      const value = attributeValues[item.attribute_id];
      const empty = value === "" || value === undefined || value === null;

      return {
        attribute_id: item.attribute_id,
        value_text: attr.data_type === "text" ? (empty ? null : value) : null,
        value_number:
          attr.data_type === "number" ? (empty ? null : Number(value)) : null,
        value_date: attr.data_type === "date" ? (empty ? null : value) : null,
        value_bool:
          attr.data_type === "boolean"
            ? value === true || value === "true"
            : null,
      };
    }).filter(Boolean);

    console.log("🟧 Attribute payload to backend:", payload);

    await attributeService.setProductAttributeValues(productId, payload);
  }

  // ------------------------------------------------------
  // UI
  // ------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Create Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update existing product" : "Add a new product"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* BASIC INFO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>SKU *</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* CATEGORY + UNIT */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <SearchableSelect
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
                options={categories?.map((c) => ({ id: c.id, name: c.name })) || []}
                placeholder="Select category"
              />
            </div>

            <div>
              <Label>Unit *</Label>
              <SearchableSelect
                value={formData.unit_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, unit_id: value })
                }
                options={units?.map((u) => ({ id: u.id, name: u.name })) || []}
                placeholder="Select unit"
              />
            </div>
          </div>

          {/* BRAND + PRICE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Brand</Label>
              <SearchableSelect
                value={formData.brand_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, brand_id: value })
                }
                options={brands?.map((b) => ({ id: b.id, name: b.name })) || []}
                placeholder="Select brand"
              />
            </div>

            <div>
              <Label>Base Price *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) =>
                  setFormData({ ...formData, base_price: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* DYNAMIC ATTRIBUTES */}
          {attributeSetId && setItems && setItems.length > 0 && (
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold">Attributes ({setItems.length})</h3>

              <div className="grid grid-cols-2 gap-4">
                {setItems.map((item) => {
                  if (!item.attribute) return null;

                  const attr = item.attribute;
                  const value = attributeValues[item.attribute_id] ?? "";

                  return (
                    <div key={item.attribute_id} className="space-y-2">
                      <Label>
                        {attr.label}
                        {attr.is_required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>

                      {attr.data_type === "text" && (
                        <Input
                          value={value}
                          onChange={(e) =>
                            setAttributeValues({
                              ...attributeValues,
                              [item.attribute_id]: e.target.value,
                            })
                          }
                        />
                      )}

                      {attr.data_type === "number" && (
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            setAttributeValues({
                              ...attributeValues,
                              [item.attribute_id]: e.target.value,
                            })
                          }
                        />
                      )}

                      {attr.data_type === "date" && (
                        <Input
                          type="date"
                          value={value}
                          onChange={(e) =>
                            setAttributeValues({
                              ...attributeValues,
                              [item.attribute_id]: e.target.value,
                            })
                          }
                        />
                      )}

                      {attr.data_type === "boolean" && (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={value === true || value === "true"}
                            onCheckedChange={(checked) =>
                              setAttributeValues({
                                ...attributeValues,
                                [item.attribute_id]: checked,
                              })
                            }
                          />
                          <span>{value ? "Yes" : "No"}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* NO ATTRIBUTE SET INFO */}
          {formData.category_id && !attributeSetId && (
            <p className="text-sm text-muted-foreground pt-4 border-t">
              This category has no attribute set assigned.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : effectiveProduct
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}







// "use client"

// import type React from "react"
// import { useEffect, useState } from "react"
// import { useCreateProduct, useUpdateProduct } from "@/lib/hooks/use-products"
// import { useCategories } from "@/lib/hooks/use-categories"
// import { useUnits } from "@/lib/hooks/use-units"
// import { useBrands } from "@/lib/hooks/use-brands"
// import { useSetItems } from "@/lib/hooks/use-attribute-sets"
// import { attributeService } from "@/lib/services/attribute.service"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Checkbox } from "@/components/ui/checkbox"
// import { SearchableSelect } from "@/components/shared/searchable-select"
// import type { Product } from "@/lib/types/master-data"

// interface ProductFormDialogProps {
//   product: Product | null
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

// export function ProductFormDialog({ product, open, onOpenChange }: ProductFormDialogProps) {
//   const [formData, setFormData] = useState({
//     name: "",
//     sku: "",
//     description: "",
//     category_id: "",
//     unit_id: "",
//     brand_id: "",
//     base_price: "",
//   })

//   const [attributeValues, setAttributeValues] = useState<Record<string, any>>({})

//   const { data: categories } = useCategories()
//   const { data: units } = useUnits()
//   const { data: brands } = useBrands()

//   const selectedCategory = categories?.find(c => c.id === formData.category_id)
//   const attributeSetId = selectedCategory?.attribute_set_id ?? ""

//   // Load attribute set items
//   const { data: setItems } = useSetItems(attributeSetId)

//   const createMutation = useCreateProduct()
//   const updateMutation = useUpdateProduct()

//   // Load initial product data into form for editing
//   useEffect(() => {
//     if (product) {
//       setFormData({
//         name: product.name,
//         sku: product.sku,
//         description: product.description ?? "",
//         category_id: product.category_id ?? "",
//         unit_id: product.unit_id ?? "",
//         brand_id: product.brand_id ?? "",
//         base_price: product.base_price ? String(product.base_price) : "",
//       })

//       const values: Record<string, any> = {}

//       product.attributes?.forEach(attr => {
//         values[attr.attribute_id] =
//           attr.value_text ??
//           attr.value_number ??
//           attr.value_date ??
//           attr.value_bool ??
//           ""
//       })

//       setAttributeValues(values)
//     } else {
//       // Reset form when switching to create mode
//       setFormData({
//         name: "",
//         sku: "",
//         description: "",
//         category_id: "",
//         unit_id: "",
//         brand_id: "",
//         base_price: "",
//       })
//       setAttributeValues({})
//     }
//   }, [product, open])

//   // Reset attributes when selecting new category
//   useEffect(() => {
//     setAttributeValues({})
//   }, [attributeSetId])

//   // ---------------------------
//   // FORM SUBMIT
//   // ---------------------------
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     // 1) Build Product Payload (NO attributes here)
//     const productPayload = {
//       name: formData.name,
//       sku: formData.sku,
//       description: formData.description || undefined,
//       category_id: formData.category_id,
//       unit_id: formData.unit_id,
//       brand_id: formData.brand_id || null,
//       base_price: Number(formData.base_price),
//     }

//     // 2) Create or update product
//     if (!product) {
//       // Create Product
//       createMutation.mutate(productPayload, {
//         onSuccess: async (created) => {
//           if (attributeSetId && setItems?.length) {
//             await saveAttributes(created.id)
//           }
//           onOpenChange(false)
//         }
//       })
//     } else {
//       // Update Product
//       updateMutation.mutate(
//         { id: product.id, data: productPayload },
//         {
//           onSuccess: async () => {
//             if (attributeSetId && setItems?.length) {
//               await saveAttributes(product.id)
//             }
//             onOpenChange(false)
//           }
//         }
//       )
//     }
//   }

//   // ---------------------------
//   // SAVE ATTRIBUTE VALUES
//   // ---------------------------
//   async function saveAttributes(productId: string) {
//     if (!setItems) return

//     // const payload = setItems.map(item => {
//     //   const attr = item.attribute
//     //   const value = attributeValues[attr.id] ?? ""

//     //   return {
//     //     attribute_id: attr.id,
//     //     value_text: attr.data_type === "text" ? (value || null) : null,
//     //     value_number: attr.data_type === "number" ? (value ? Number(value) : null) : null,
//     //     value_date: attr.data_type === "date" ? value : null,
//     //     value_bool: attr.data_type === "boolean" ? Boolean(value) : null,
//     //   }
//     // })
//     const payload = setItems.map(item => {
//       const attr = item.attribute;
//       const value = attributeValues[attr.id];

//       const isEmpty = value === "" || value === undefined || value === null;

//       return {
//         attribute_id: item.attribute_id,
//         value_text: attr.data_type === "text" ? (isEmpty ? null : value) : null,
//         value_number: attr.data_type === "number"
//           ? isEmpty ? null : Number(value)
//           : null,
//         value_date: attr.data_type === "date"
//           ? isEmpty ? null : value
//           : null,
//         value_bool: attr.data_type === "boolean"
//           ? Boolean(value)
//           : null,
//       };
//     });

//     await attributeService.setProductAttributeValues(productId, payload)
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>{product ? "Edit Product" : "Create Product"}</DialogTitle>
//           <DialogDescription>
//             {product ? "Update product information" : "Add a new product"}
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* BASIC INFO */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label>Product Name *</Label>
//               <Input
//                 value={formData.name}
//                 onChange={e => setFormData({ ...formData, name: e.target.value })}
//                 required
//               />
//             </div>
//             <div>
//               <Label>SKU *</Label>
//               <Input
//                 value={formData.sku}
//                 onChange={e => setFormData({ ...formData, sku: e.target.value })}
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <Label>Description</Label>
//             <Textarea
//               value={formData.description}
//               onChange={e => setFormData({ ...formData, description: e.target.value })}
//             />
//           </div>

//           {/* CATEGORY + UNIT */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label>Category</Label>
//               <SearchableSelect
//                 value={formData.category_id}
//                 onValueChange={value => setFormData({ ...formData, category_id: value })}
//                 options={categories?.map(c => ({ id: c.id, name: c.name })) || []}
//                 placeholder="Select category"
//               />
//             </div>

//             <div>
//               <Label>Unit *</Label>
//               <SearchableSelect
//                 value={formData.unit_id}
//                 onValueChange={value => setFormData({ ...formData, unit_id: value })}
//                 options={units?.map(u => ({ id: u.id, name: u.name })) || []}
//                 placeholder="Select unit"
//               />
//             </div>
//           </div>

//           {/* BRAND + PRICE */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label>Brand</Label>
//               <SearchableSelect
//                 value={formData.brand_id}
//                 onValueChange={value => setFormData({ ...formData, brand_id: value })}
//                 options={brands?.map(b => ({ id: b.id, name: b.name })) || []}
//                 placeholder="Select brand"
//               />
//             </div>

//             <div>
//               <Label>Base Price *</Label>
//               <Input
//                 type="number"
//                 step="0.01"
//                 value={formData.base_price}
//                 onChange={e => setFormData({ ...formData, base_price: e.target.value })}
//                 required
//               />
//             </div>
//           </div>

//           {/* DYNAMIC ATTRIBUTES */}
//           {attributeSetId && setItems && setItems.length > 0 && (
//             <div className="pt-4 border-t space-y-4">
//               <h3 className="font-semibold">
//                 Attributes ({setItems.length})
//               </h3>

//               <div className="grid grid-cols-2 gap-4">
//                 {setItems.map(item => {
//                   const attr = item.attribute
//                   if (!attr) return null

//                   // const value = attributeValues[attr.id] ?? ""
//                   const value = attributeValues[item.attribute_id] ?? ""

//                   return (
//                     <div key={attr.id} className="space-y-2">
//                       <Label>
//                         {attr.label}
//                         {attr.is_required && <span className="text-destructive ml-1">*</span>}
//                       </Label>

//                       {attr.data_type === "text" && (
//                         <Input
//                           value={value}
//                           onChange={e =>
//                             setAttributeValues({ ...attributeValues, [attr.id]: e.target.value })
//                           }
//                         />
//                       )}

//                       {attr.data_type === "number" && (
//                         <Input
//                           type="number"
//                           value={value}
//                           onChange={e =>
//                             setAttributeValues({ ...attributeValues, [attr.id]: e.target.value })
//                           }
//                         />
//                       )}

//                       {attr.data_type === "date" && (
//                         <Input
//                           type="date"
//                           value={value}
//                           onChange={e =>
//                             setAttributeValues({ ...attributeValues, [attr.id]: e.target.value })
//                           }
//                         />
//                       )}

//                       {attr.data_type === "boolean" && (
//                         <div className="flex items-center gap-2">
//                           <Checkbox
//                             checked={value === true || value === "true"}
//                             onCheckedChange={checked =>
//                               setAttributeValues({ ...attributeValues, [attr.id]: checked })
//                             }
//                           />
//                           <span>{value ? "Yes" : "No"}</span>
//                         </div>
//                       )}
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//           )}

//           {/* NO ATTRIBUTE SET */}
//           {formData.category_id && !attributeSetId && (
//             <p className="text-sm text-muted-foreground pt-4 border-t">
//               This category has no attribute set assigned.
//             </p>
//           )}

//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>

//             <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
//               {createMutation.isPending || updateMutation.isPending
//                 ? "Saving..."
//                 : product
//                 ? "Update"
//                 : "Create"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }































// "use client"

// import type React from "react"
// import { useEffect, useState } from "react"
// import { useCreateProduct, useUpdateProduct } from "@/lib/hooks/use-products"
// import { useCategories } from "@/lib/hooks/use-categories"
// import { useUnits } from "@/lib/hooks/use-units"
// import { useBrands } from "@/lib/hooks/use-brands"
// // import { useAttributeSets } from "@/lib/hooks/use-attribute-sets"
// import { Button } from "@/components/ui/button"
// import { useSetItems } from "@/lib/hooks/use-attribute-sets"



// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Checkbox } from "@/components/ui/checkbox"
// import { SearchableSelect } from "@/components/shared/searchable-select"
// import type { Product } from "@/lib/types/master-data"
// import { attributeService } from "@/lib/services/attribute.service"

// interface ProductFormDialogProps {
//   product: Product | null
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

// export function ProductFormDialog({ product, open, onOpenChange }: ProductFormDialogProps) {
//   const [formData, setFormData] = useState({
//     name: "",
//     sku: "",
//     description: "",
//     category_id: "",
//     unit_id: "",
//     brand_id: "",
//     base_price: "",
//     attribute_set_id: "",
//   })

//   const [attributeValues, setAttributeValues] = useState<Record<string, any>>({})

//   const { data: categories } = useCategories()
//   const { data: units } = useUnits()
//   const { data: brands } = useBrands()
//   // const { data: attributeSets } = useAttributeSets()
//   const createMutation = useCreateProduct()
//   const updateMutation = useUpdateProduct()

//   const selectedCategory = categories?.find((c) => c.id === formData.category_id)
//   // const selectedAttributeSet = attributeSets?.find((s) => s.id === selectedCategory?.attribute_set_id)
//   const selectedAttributeSetId = selectedCategory?.attribute_set_id

//   const { data: setItems } = useSetItems(selectedAttributeSetId || "")

//   useEffect(() => {
//     if (selectedCategory?.attribute_set_id) {
//       setAttributeValues({})
//     }
//   }, [selectedCategory?.attribute_set_id])

//   useEffect(() => {
//     if (product) {
//       setFormData({
//         name: product.name,
//         sku: product.sku,
//         description: product.description || "",
//         category_id: product.category_id || "",
//         unit_id: product.unit_id,
//         brand_id: product.brand_id || "",
//         base_price: product.base_price.toString(),
//         attribute_set_id: product.attribute_set_id || "",
//       })
//       if (product.attributes) {
//         const values: Record<string, any> = {}
//         product.attributes.forEach((attr) => {
//           values[attr.attribute_id] = attr.value_text || attr.value_number || attr.value_date || attr.value_bool
//         })
//         setAttributeValues(values)
//       }
//     } else {
//       setFormData({
//         name: "",
//         sku: "",
//         description: "",
//         category_id: "",
//         unit_id: "",
//         brand_id: "",
//         base_price: "",
//         attribute_set_id: "",
//       })
//       setAttributeValues({})
//     }
//   }, [product, open])

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()

//     const attributes =
//       setItems?.map((item) => {
//         const value = attributeValues[item.attribute_id]
//         return {
//           attribute_id: item.attribute_id,
//           value_text: item.attribute?.data_type === "text" ? value : null,
//           value_number: item.attribute?.data_type === "number" ? (value ? Number(value) : null) : null,
//           value_date: item.attribute?.data_type === "date" ? value : null,
//           value_bool: item.attribute?.data_type === "boolean" ? Boolean(value) : null,
//         }
//       }) || []

//     const payload = {
//       name: formData.name,
//       sku: formData.sku,
//       description: formData.description || undefined,
//       category_id: formData.category_id || null,
//       unit_id: formData.unit_id,
//       brand_id: formData.brand_id || null,
//       base_price: Number.parseFloat(formData.base_price),
//       // attribute_set_id: selectedCategory?.attribute_set_id || null,
//       // attributes,
//     }

    

//     if (product) {
//       updateMutation.mutate(
//         { id: product.id, data: payload },
//         {
//           onSuccess: () => {
//             onOpenChange(false)
//           },
//         },
//       )
//     } else {
//         createMutation.mutate(payload, {
//           onSuccess: (product) => {
//           saveAttributes(product.id)
//           onOpenChange(false)
//             }
//           })
//     }

//     function saveAttributes(productId: string) {
//         const formattedValues = setItems?.map(item => ({
//           attribute_id: item.attribute_id,
//           value_text: ...,
//           ...
//         }))

//         attributeService.setProductAttributeValues(productId, formattedValues)
//       }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>{product ? "Edit Product" : "Create Product"}</DialogTitle>
//           <DialogDescription>
//             {product ? "Update product information" : "Add a new product to the system"}
//           </DialogDescription>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="name">
//                 Product Name <span className="text-destructive">*</span>
//               </Label>
//               <Input
//                 id="name"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="sku">
//                 SKU <span className="text-destructive">*</span>
//               </Label>
//               <Input
//                 id="sku"
//                 value={formData.sku}
//                 onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
//                 required
//               />
//             </div>
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               rows={3}
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="category_id">Category</Label>
//               <SearchableSelect
//                 value={formData.category_id}
//                 onValueChange={(value) => setFormData({ ...formData, category_id: value })}
//                 options={categories?.map((c) => ({ id: c.id, name: c.name })) || []}
//                 placeholder="Select category"
//                 searchPlaceholder="Search categories..."
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="unit_id">
//                 Unit <span className="text-destructive">*</span>
//               </Label>
//               <SearchableSelect
//                 value={formData.unit_id}
//                 onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
//                 options={units?.map((u) => ({ id: u.id, name: `${u.name} (${u.symbol})` })) || []}
//                 placeholder="Select unit"
//                 searchPlaceholder="Search units..."
//               />
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="brand_id">Brand</Label>
//               <SearchableSelect
//                 value={formData.brand_id}
//                 onValueChange={(value) => setFormData({ ...formData, brand_id: value })}
//                 options={brands?.map((b) => ({ id: b.id, name: b.name })) || []}
//                 placeholder="Select brand"
//                 searchPlaceholder="Search brands..."
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="base_price">
//                 Base Price <span className="text-destructive">*</span>
//               </Label>
//               <Input
//                 id="base_price"
//                 type="number"
//                 step="0.01"
//                 min="0"
//                 value={formData.base_price}
//                 onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
//                 required
//               />
//             </div>
//           </div>

//           {selectedAttributeSet && selectedAttributeSet.items && selectedAttributeSet.items.length > 0 && (
//             <div className="space-y-4 pt-4 border-t">
//               <div className="flex items-center justify-between">
//                 <h3 className="font-semibold">Product Attributes</h3>
//                 <span className="text-sm text-muted-foreground">From: {selectedAttributeSet.name}</span>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 {selectedAttributeSet.items.map((item) => {
//                   if (!item.attribute) return null
//                   const attr = item.attribute

//                   return (
//                     <div key={attr.id} className="space-y-2">
//                       <Label htmlFor={`attr-${attr.id}`}>
//                         {attr.label}
//                         {attr.is_required && <span className="text-destructive ml-1">*</span>}
//                       </Label>

//                       {attr.data_type === "text" && (
//                         <Input
//                           id={`attr-${attr.id}`}
//                           placeholder={`Enter ${attr.label.toLowerCase()}`}
//                           value={attributeValues[attr.id] || ""}
//                           onChange={(e) => setAttributeValues({ ...attributeValues, [attr.id]: e.target.value })}
//                           required={attr.is_required}
//                         />
//                       )}

//                       {attr.data_type === "number" && (
//                         <Input
//                           id={`attr-${attr.id}`}
//                           type="number"
//                           step="any"
//                           placeholder={`Enter ${attr.label.toLowerCase()}`}
//                           value={attributeValues[attr.id] || ""}
//                           onChange={(e) => setAttributeValues({ ...attributeValues, [attr.id]: e.target.value })}
//                           required={attr.is_required}
//                         />
//                       )}

//                       {attr.data_type === "date" && (
//                         <Input
//                           id={`attr-${attr.id}`}
//                           type="date"
//                           value={attributeValues[attr.id] || ""}
//                           onChange={(e) => setAttributeValues({ ...attributeValues, [attr.id]: e.target.value })}
//                           required={attr.is_required}
//                         />
//                       )}

//                       {attr.data_type === "boolean" && (
//                         <div className="flex items-center space-x-2 pt-2">
//                           <Checkbox
//                             id={`attr-${attr.id}`}
//                             checked={attributeValues[attr.id] || false}
//                             onCheckedChange={(checked) =>
//                               setAttributeValues({ ...attributeValues, [attr.id]: checked })
//                             }
//                           />
//                           <label htmlFor={`attr-${attr.id}`} className="text-sm cursor-pointer">
//                             Enable {attr.label}
//                           </label>
//                         </div>
//                       )}
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//           )}

//           {formData.category_id && !selectedCategory?.attribute_set_id && (
//             <div className="pt-4 border-t">
//               <p className="text-sm text-muted-foreground">
//                 This category has no attribute set assigned. You can assign one by editing the category.
//               </p>
//             </div>
//           )}

//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
//               {createMutation.isPending || updateMutation.isPending ? "Saving..." : product ? "Update" : "Create"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }
