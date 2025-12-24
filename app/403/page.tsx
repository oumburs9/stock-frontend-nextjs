"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function ForbiddenPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <ShieldAlert className="mx-auto size-10 text-destructive" />
        <h1 className="text-3xl font-bold">403 – Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
