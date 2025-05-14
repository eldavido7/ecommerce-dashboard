"use client"

import { Menu, Bell, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Debug function to help diagnose the issue
  const toggleTheme = () => {
    console.log("Current theme:", theme)
    const newTheme = theme === "dark" ? "light" : "dark"
    console.log("Setting theme to:", newTheme)
    setTheme(newTheme)
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <h1 className="text-xl font-bold">Halamin Herbal</h1>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {mounted && (
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-gray-100">
              <p>
                H
              </p>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
