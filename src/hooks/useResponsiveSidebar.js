import { useCallback, useEffect, useState } from 'react'

export function useResponsiveSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    if (!isSidebarOpen) {
      return undefined
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isSidebarOpen])

  return {
    isSidebarOpen,
    closeSidebar,
    toggleSidebar,
  }
}
