import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { API_CONFIG } from "@/lib/config/api.config"

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refresh_token")?.value

 if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 })
  }

  const res = await fetch(`${API_CONFIG.baseURL}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refreshToken}` },
  })

  if (!res.ok) {
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 })
  }

  const { accessToken } = await res.json()

  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15 ,
    path: "/",
  })

  return NextResponse.json({ accessToken })
}