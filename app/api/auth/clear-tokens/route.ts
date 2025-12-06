import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// API route to clear httpOnly cookies
// This is called by TokenManager on logout
export async function POST() {
  try {
    const cookieStore = await cookies()
    const isProd = process.env.NODE_ENV === "production"

    cookieStore.set("access_token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    cookieStore.set("refresh_token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing tokens:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
