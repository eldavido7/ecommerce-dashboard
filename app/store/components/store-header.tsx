"use client";

import Link from "next/link";
import { ShoppingCart, Leaf, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function StoreHeader() {
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 md:px-36 px-4 py-8">
        <div className="flex items-center">
          <Link href="/store" className="flex items-center space-x-2">
            <Leaf className="w-6 h-6 text-green-600" />
            <span className="text-xl font-bold">Halamin Herbal</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/store/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Link
            href="/login"
            className="md:flex hidden text-sm font-medium transition-colors hover:text-green-600"
          >
            Admin
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="px-4 py-3 md:hidden bg-white border-t">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-green-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
