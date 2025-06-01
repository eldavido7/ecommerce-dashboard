"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/store";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  // Check if we're on the login page
  const isLoginPage = pathname === "/login";
  const isStorePage = pathname.startsWith("/store");

  // Redirect to login if not authenticated and not already on login or store page
  useEffect(() => {
    if (!isLoading && !user && !isLoginPage && !isStorePage) {
      router.push("/login");
    }
  }, [user, isLoading, isLoginPage, isStorePage, router]);

  // If we're on the login or store page, don't wrap with the dashboard layout
  if (isLoginPage || isStorePage) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated and not on login or store page
  if (!user && !isLoginPage && !isStorePage) {
    return null;
  }

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
  );
}
