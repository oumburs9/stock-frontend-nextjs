"use client"

import { useEffect, useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import { getSectionConfigs } from "@/lib/config/sidebar-menu"

const STORAGE_KEY = "sidebar-state:v1"
const STORAGE_VERSION = 1

interface SidebarState {
  version: number
  manuallyOpened: string[]
  manuallyClosed: string[]
}

const SECTION_CONFIGS = getSectionConfigs()

function getDefaultState(): SidebarState {
  return {
    version: STORAGE_VERSION,
    manuallyOpened: [],
    manuallyClosed: [],
  }
}

function loadState(): SidebarState {
  if (typeof window === "undefined") return getDefaultState()

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return getDefaultState()

    const parsed = JSON.parse(stored) as SidebarState

    // Version mismatch, reset state
    if (parsed.version !== STORAGE_VERSION) {
      return getDefaultState()
    }

    // Validate stored IDs against current config
    const validIds = new Set(SECTION_CONFIGS.map((s) => s.id))
    return {
      version: parsed.version,
      manuallyOpened: parsed.manuallyOpened.filter((id) => validIds.has(id)),
      manuallyClosed: parsed.manuallyClosed.filter((id) => validIds.has(id)),
    }
  } catch {
    return getDefaultState()
  }
}

function saveState(state: SidebarState): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

function pathnameMatchesSection(pathname: string, sectionId: string): boolean {
  const section = SECTION_CONFIGS.find((s) => s.id === sectionId)
  if (!section) return false

  return section.routes.some((route) => pathname.startsWith(route))
}

export function useSidebarState() {
  const pathname = usePathname()
  const [hydrated, setHydrated] = useState(false)
  const [state, setState] = useState<SidebarState>(getDefaultState)

  useEffect(() => {
    setState(loadState())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      saveState(state)
    }
  }, [state, hydrated])

  const isOpen = useCallback(
    (sectionId: string): boolean => {
      // Priority 1: User explicitly closed it → STAY CLOSED
      if (state.manuallyClosed.includes(sectionId)) {
        return false
      }

      // Priority 2: Current route matches this section → AUTO OPEN
      if (pathnameMatchesSection(pathname, sectionId)) {
        return true
      }

      // Priority 3: User manually opened it → STAY OPEN
      if (state.manuallyOpened.includes(sectionId)) {
        return true
      }

      // Priority 4: Default → CLOSED
      return false
    },
    [state, pathname],
  )

  const toggle = useCallback((sectionId: string) => {
    setState((prev) => {
      const isCurrentlyInOpened = prev.manuallyOpened.includes(sectionId)
      const isCurrentlyInClosed = prev.manuallyClosed.includes(sectionId)

      // User is opening it
      if (isCurrentlyInClosed || (!isCurrentlyInOpened && !isCurrentlyInClosed)) {
        return {
          ...prev,
          manuallyOpened: [...prev.manuallyOpened.filter((id) => id !== sectionId), sectionId],
          manuallyClosed: prev.manuallyClosed.filter((id) => id !== sectionId),
        }
      }

      // User is closing it
      return {
        ...prev,
        manuallyOpened: prev.manuallyOpened.filter((id) => id !== sectionId),
        manuallyClosed: [...prev.manuallyClosed.filter((id) => id !== sectionId), sectionId],
      }
    })
  }, [])

  return {
    isOpen,
    toggle,
    hydrated,
  }
}
