"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"

export function RequirePermission({
  permission,
  children,
}: {
  permission: string
  children: React.ReactNode
}) {
  const { hasPermission, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !hasPermission(permission)) {
      router.replace("/403")
    }
  }, [permission, hasPermission, isLoading, router])

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Checking permissions...</div>
  }

  if (!hasPermission(permission)) {
    return null
  }

  return <>{children}</>
}


// "use client"

// import type * as React from "react"
// import { useRouter } from "next/navigation"
// import { useAuth } from "@/lib/hooks/use-auth"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { ShieldAlert } from "lucide-react"

// interface RequirePermissionProps {
//   permission: string
//   children: React.ReactNode
//   fallback?: React.ReactNode
// }

// export function RequirePermission({ permission, children, fallback }: RequirePermissionProps) {
//   const { hasPermission } = useAuth()
//   const router = useRouter()

//   if (!hasPermission(permission)) {
//     if (fallback) {
//       return <>{fallback}</>
//     }

//     return (
//       <div className="flex min-h-[60vh] items-center justify-center p-4">
//         <Card className="w-full max-w-md">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <ShieldAlert className="size-5 text-destructive" />
//               <CardTitle>Access Denied</CardTitle>
//             </div>
//             <CardDescription>You don't have permission to view this page</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <Alert variant="destructive">
//               <ShieldAlert className="size-4" />
//               <AlertTitle>Insufficient Permissions</AlertTitle>
//               <AlertDescription>
//                 The page you're trying to access requires the <code className="text-xs">{permission}</code> permission.
//               </AlertDescription>
//             </Alert>
//             <div className="flex gap-2">
//               <Button onClick={() => router.back()} variant="outline" className="flex-1">
//                 {"Go Back"}
//               </Button>
//               <Button onClick={() => router.push("/dashboard")} className="flex-1">
//                 {"Go to Dashboard"}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return <>{children}</>
// }
