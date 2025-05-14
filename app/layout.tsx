import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainLayout } from "@/components/main-layout"
import { Toaster } from "@/components/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Halamin Herbal - Admin Dashboard",
  description: "A comprehensive eCommerce admin dashboard",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <MainLayout>{children}</MainLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
