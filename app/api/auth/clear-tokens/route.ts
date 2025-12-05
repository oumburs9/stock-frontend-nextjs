import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// API route to clear httpOnly cookies
// This is called by TokenManager on logout
export async function POST() {
  try {
    const cookieStore = await cookies()

    cookieStore.delete("access_token")
    cookieStore.delete("refresh_token")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error clearing tokens:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
