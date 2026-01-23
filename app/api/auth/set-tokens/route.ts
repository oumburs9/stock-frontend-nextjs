import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// API route to set httpOnly cookies for tokens
// This is called by TokenManager to store tokens securely
export async function POST(request: Request) {
  try {
    const { accessToken, refreshToken } = await request.json()
    const cookieStore = await cookies()

    const isProd = process.env.NODE_ENV === "production"

    if (accessToken) {
      cookieStore.set("access_token", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        // maxAge: 60 * 15, // 15 min
        maxAge: 60 * 60 * 11, // 11h 
        path: "/",
      })
    }

    if (refreshToken) {
      cookieStore.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting tokens:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
