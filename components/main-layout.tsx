"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="grid md:grid-cols-[240px_1fr]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="overflow-hidden">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="container mx-auto p-0">{children}</div>
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}
