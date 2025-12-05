"use client"

import type React from "react"
import { useEffect } from "react"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedTheme = getCookie("theme")
    const root = window.document.documentElement

    if (savedTheme === "light" || savedTheme === "dark") {
      root.classList.remove("light", "dark")
      root.classList.add(savedTheme)
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.remove("light", "dark")
      root.classList.add(prefersDark ? "dark" : "light")
    }
  }, [])

  return <>{children}</>
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}
