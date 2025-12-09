"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { productService } from "@/lib/services/product.service";
import { attributeService } from "@/lib/services/attribute.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import type {
  ProductAttributeValue,
  CreateProductAttributeValueRequest,
} from "@/lib/types/master-data";

export function ProductAttributeValuesContent({ productId }: { productId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [attributeValues, setAttributeValues] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // -----------------------------------------------
  // LOAD FULL PRODUCT FROM BACKEND
  // -----------------------------------------------
  const { data: product, isLoading } = useQuery({
    queryKey: ["products", productId, "full"],
    queryFn: () => productService.getProductFull(productId),
  });

  // -----------------------------------------------
  // INITIAL ATTRIBUTE VALUE LOAD
  // -----------------------------------------------
  useEffect(() => {
    if (!product?.attributes) return;

    const initialValues: Record<string, any> = {};

    product.attributes.forEach((attr) => {
      initialValues[attr.attribute_id] =
        attr.value_text ??
        attr.value_number ??
        attr.value_date ??
        attr.value_bool ??
        "";
    });

    setAttributeValues(initialValues);
  }, [product]);

  // -----------------------------------------------
  // SAVE UPDATED ATTRIBUTE VALUES
  // -----------------------------------------------
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!product) return;

      const categorySetId = product.category?.attribute_set_id;
      if (!categorySetId) {
        console.warn("Category has no attribute set. Nothing to save.");
        return;
      }

      // Load full attribute set definition
      const attributeSet = await attributeService.getAttributeSet(categorySetId);
      if (!attributeSet?.items) return;

      const payload: CreateProductAttributeValueRequest[] = [];

      attributeSet.items.forEach((item) => {
        if (!item.attribute) return;

        const attr = item.attribute;
        const rawValue = attributeValues[item.attribute_id];

        const isEmpty = rawValue === "" || rawValue === undefined || rawValue === null;

        const entry: CreateProductAttributeValueRequest = {
          attribute_id: item.attribute_id,
          value_text: null,
          value_number: null,
          value_date: null,
          value_bool: null,
        };

        switch (attr.data_type) {
          case "text":
            entry.value_text = isEmpty ? null : rawValue;
            break;

          case "number":
            entry.value_number = isEmpty ? null : Number(rawValue);
            break;

          case "date":
            entry.value_date = isEmpty ? null : rawValue;
            break;

          case "boolean":
            entry.value_bool =
              rawValue === true || rawValue === "true" ? true : false;
            break;
        }

        payload.push(entry);
      });

      console.log("🟧 FINAL PAYLOAD TO BACKEND:", payload);

      await attributeService.setProductAttributeValues(productId, payload);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", productId, "full"] });
      toast({
        title: "Success",
        description: "Attribute values updated successfully.",
      });
      setHasChanges(false);
    },

    onError: (err) => {
      console.error("❌ Failed to save attribute values", err);
      toast({
        title: "Error",
        description: "Failed to save attribute values.",
        variant: "destructive",
      });
    },
  });

  // -----------------------------------------------
  // VALUE CHANGE HANDLER
  // -----------------------------------------------
  const handleValueChange = (attributeId: string, value: any) => {
    setAttributeValues((prev) => ({ ...prev, [attributeId]: value }));
    setHasChanges(true);
  };

  // -----------------------------------------------
  // RESET TO ORIGINAL
  // -----------------------------------------------
  const handleReset = () => {
    if (!product?.attributes) return;

    const resetValues: Record<string, any> = {};
    product.attributes.forEach((attr) => {
      resetValues[attr.attribute_id] =
        attr.value_text ??
        attr.value_number ??
        attr.value_date ??
        attr.value_bool ??
        "";
    });

    setAttributeValues(resetValues);
    setHasChanges(false);
  };

  // -----------------------------------------------
  // RENDER INPUT FIELD
  // -----------------------------------------------
  const renderValueInput = (attrValue: ProductAttributeValue) => {
    if (!attrValue.attribute) return "-";

    const type = attrValue.attribute.data_type;
    const attrId = attrValue.attribute_id;
    const value = attributeValues[attrId] ?? "";

    switch (type) {
      case "text":
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleValueChange(attrId, e.target.value)}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleValueChange(attrId, e.target.value)}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleValueChange(attrId, e.target.value)}
          />
        );

      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={value === true || value === "true"}
              onCheckedChange={(checked) => handleValueChange(attrId, checked)}
            />
            <span>{value ? "Yes" : "No"}</span>
          </div>
        );

      default:
        return "-";
    }
  };

  // -----------------------------------------------
  // LOADING UI
  // -----------------------------------------------
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center py-8 text-muted-foreground">Product not found.</div>;
  }

  // -----------------------------------------------
  // MAIN UI
  // -----------------------------------------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}

          <Button
            size="sm"
            disabled={!hasChanges || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* PRODUCT HEADER */}
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-muted-foreground font-mono">{product.sku}</p>
      </div>

      {/* ATTRIBUTE TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Attribute Values</CardTitle>
          <CardDescription>
            {product.attributes?.length ?? 0} attribute(s) for category:{" "}
            {product.category?.name}
            {hasChanges && (
              <Badge className="ml-2" variant="secondary">
                Unsaved Changes
              </Badge>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {product.attributes?.length ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attribute</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {product.attributes.map((attr) => (
                    <TableRow key={attr.id}>
                      <TableCell className="font-semibold">
                        {attr.attribute?.label}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{attr.attribute?.data_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {attr.attribute?.is_required ? "Yes" : "No"}
                      </TableCell>

                      <TableCell>{renderValueInput(attr)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No attributes to display.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



















// "use client"

// import { useState, useEffect } from "react"
// import { ArrowLeft, Save, RefreshCw } from "lucide-react"
// import { useRouter } from "next/navigation"
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// import { productService } from "@/lib/services/product.service"
// import { attributeService } from "@/lib/services/attribute.service"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Input } from "@/components/ui/input"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Badge } from "@/components/ui/badge"
// import { useToast } from "@/hooks/use-toast"
// import type { ProductAttributeValue, CreateProductAttributeValueRequest } from "@/lib/types/master-data"

// export function ProductAttributeValuesContent({ productId }: { productId: string }) {
//   const router = useRouter()
//   const { toast } = useToast()
//   const queryClient = useQueryClient()
//   const [attributeValues, setAttributeValues] = useState<Record<string, any>>({})
//   const [hasChanges, setHasChanges] = useState(false)

//   const { data: product, isLoading } = useQuery({
//     queryKey: ["products", productId, "full"],
//     queryFn: () => productService.getProductFull(productId),
//   })

//   useEffect(() => {
//     if (product?.attributes) {
//       const initialValues: Record<string, any> = {}
//       product.attributes.forEach((attr) => {
//         initialValues[attr.attribute_id] =
//           attr.value_text || attr.value_number || attr.value_date || attr.value_bool || ""
//       })
//       setAttributeValues(initialValues)
//     }
//   }, [product])

//   const saveMutation = useMutation({
//     mutationFn: async () => {
//       if (!product) return

//       const valuesToSave: CreateProductAttributeValueRequest[] = []

//       // Get category's attribute set
//       const categoryAttributeSet = product.category?.attribute_set_id
//       if (!categoryAttributeSet) return

//       const attributeSet = await attributeService.getAttributeSet(categoryAttributeSet)
//       if (!attributeSet) return

//       // Create value entries for each attribute in the set
//       // attributeSet.items?.forEach((item) => {
//       //   if (!item.attribute) return

//       //   const value = attributeValues[item.attribute.id]
//       //   const valueRequest: CreateProductAttributeValueRequest = {
//       //     attribute_id: item.attribute.id,
//       //     value_text: null,
//       //     value_number: null,
//       //     value_date: null,
//       //     value_bool: null,
//       //   }

//       //   // Set the appropriate value field based on data type
//       //   switch (item.attribute.data_type) {
//       //     case "text":
//       //       valueRequest.value_text = value || null
//       //       break
//       //     case "number":
//       //       valueRequest.value_number = value ? Number(value) : null
//       //       break
//       //     case "date":
//       //       valueRequest.value_date = value || null
//       //       break
//       //     case "boolean":
//       //       valueRequest.value_bool = value === true || value === "true"
//       //       break
//       //   }

//       //   valuesToSave.push(valueRequest)
//       // })
//       attributeSet.items?.forEach((item) => {
//     if (!item.attribute) return;

//     const value = attributeValues[item.attribute_id];

//     const valueRequest: CreateProductAttributeValueRequest = {
//       attribute_id: item.attribute_id,
//       value_text: null,
//       value_number: null,
//       value_date: null,
//       value_bool: null,
//     };

//     switch (item.attribute.data_type) {
//       case "text":
//         valueRequest.value_text = value || null;
//         break;
//       case "number":
//         valueRequest.value_number = value ? Number(value) : null;
//         break;
//       case "date":
//         valueRequest.value_date = value || null;
//         break;
//       case "boolean":
//         valueRequest.value_bool = value === true || value === "true";
//         break;
//     }

//   valuesToSave.push(valueRequest);
// });

//       await attributeService.setProductAttributeValues(productId, valuesToSave)
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["products", productId, "full"] })
//       toast({ title: "Success", description: "All attribute values saved successfully" })
//       setHasChanges(false)
//     },
//     onError: () => {
//       toast({
//         title: "Error",
//         description: "Failed to save attribute values",
//         variant: "destructive",
//       })
//     },
//   })

//   const handleValueChange = (attributeId: string, value: any) => {
//     setAttributeValues((prev) => ({ ...prev, [attributeId]: value }))
//     setHasChanges(true)
//   }

//   const handleReset = () => {
//     if (product?.attributes) {
//       const initialValues: Record<string, any> = {}
//       product.attributes.forEach((attr) => {
//         initialValues[attr.attribute_id] =
//           attr.value_text || attr.value_number || attr.value_date || attr.value_bool || ""
//       })
//       setAttributeValues(initialValues)
//       setHasChanges(false)
//     }
//   }

//   const renderValueInput = (attrValue: ProductAttributeValue) => {
//     if (!attrValue.attribute) return <span>-</span>

//     const dataType = attrValue.attribute.data_type
//     const currentValue = attributeValues[attrValue.attribute_id] ?? ""

//     switch (dataType) {
//       case "text":
//         return (
//           <Input
//             type="text"
//             value={currentValue}
//             onChange={(e) => handleValueChange(attrValue.attribute_id, e.target.value)}
//             placeholder="Enter text value"
//             className="max-w-md"
//           />
//         )
//       case "number":
//         return (
//           <Input
//             type="number"
//             step="any"
//             value={currentValue}
//             onChange={(e) => handleValueChange(attrValue.attribute_id, e.target.value)}
//             placeholder="Enter number"
//             className="max-w-md"
//           />
//         )
//       case "date":
//         return (
//           <Input
//             type="date"
//             value={currentValue}
//             onChange={(e) => handleValueChange(attrValue.attribute_id, e.target.value)}
//             className="max-w-md"
//           />
//         )
//       case "boolean":
//         return (
//           <div className="flex items-center gap-2">
//             <Checkbox
//               checked={currentValue === true || currentValue === "true"}
//               onCheckedChange={(checked) => handleValueChange(attrValue.attribute_id, checked)}
//             />
//             <span className="text-sm text-muted-foreground">{currentValue ? "Yes" : "No"}</span>
//           </div>
//         )
//       default:
//         return <span>-</span>
//     }
//   }

//   if (isLoading) {
//     return <div className="text-center text-muted-foreground py-8">Loading...</div>
//   }

//   if (!product) {
//     return <div className="text-center text-muted-foreground py-8">Product not found</div>
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <Button variant="ghost" size="sm" onClick={() => router.back()}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back
//           </Button>
//         </div>
//         <div className="flex items-center gap-2">
//           {hasChanges && (
//             <Button variant="outline" size="sm" onClick={handleReset}>
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Reset Changes
//             </Button>
//           )}
//           <Button size="sm" onClick={() => saveMutation.mutate()} disabled={!hasChanges || saveMutation.isPending}>
//             <Save className="h-4 w-4 mr-2" />
//             {saveMutation.isPending ? "Saving..." : "Save All Changes"}
//           </Button>
//         </div>
//       </div>

//       <div>
//         <h1 className="text-3xl font-bold">Manage Attributes</h1>
//         <p className="text-muted-foreground">
//           {product.name} ({product.sku})
//         </p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Attribute Values</CardTitle>
//           <CardDescription>
//             {product.attributes?.length || 0} attribute(s) based on category: {product.category?.name}
//             {hasChanges && (
//               <Badge variant="secondary" className="ml-2">
//                 Unsaved Changes
//               </Badge>
//             )}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {product.attributes && product.attributes.length > 0 ? (
//             <div className="rounded-md border">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="w-[200px]">Attribute</TableHead>
//                     <TableHead className="w-[100px]">Type</TableHead>
//                     <TableHead className="w-[100px]">Required</TableHead>
//                     <TableHead>Value</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {product.attributes.map((attrValue) => (
//                     <TableRow key={attrValue.id}>
//                       <TableCell className="font-medium">
//                         {attrValue.attribute?.label}
//                         {attrValue.attribute?.is_required && <span className="text-destructive ml-1">*</span>}
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant="outline">{attrValue.attribute?.data_type}</Badge>
//                       </TableCell>
//                       <TableCell>{attrValue.attribute?.is_required ? "Yes" : "No"}</TableCell>
//                       <TableCell>{renderValueInput(attrValue)}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           ) : (
//             <div className="text-center text-muted-foreground py-8">
//               No attributes assigned to this product. Attributes are determined by the product's category.
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
