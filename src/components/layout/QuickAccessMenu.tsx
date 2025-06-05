
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User, ListOrdered, ShoppingCart, LayoutGrid, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function QuickAccessMenu() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Menu starts open by default within the bubble
  const { isLoggedIn } = useAuth();

  const SCROLL_THRESHOLD = 150; // Pixels to scroll before menu appears

  const handleScroll = useCallback(() => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      // setIsOpen(false); // Optionally close menu if user scrolls to top
    }
  }, [SCROLL_THRESHOLD]);

  const handleToggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check visibility on initial mount

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const menuItems = [
    ...(isLoggedIn ? [
      { href: "/profile", label: "Profile", icon: User, id: "profile" },
      { href: "/order-history", label: "My Orders", icon: ListOrdered, id: "orders" },
    ] : []),
    { href: "/cart", label: "Shopping Cart", icon: ShoppingCart, id: "cart" },
    { href: "/", label: "Home / Categories", icon: LayoutGrid, id: "home-categories" },
  ];

  if (menuItems.length === 0 && !isLoggedIn && !isVisible) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <div
        className={cn(
          "fixed bottom-5 left-5 z-50 transition-all duration-300 ease-in-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <div className="bg-card p-2 rounded-lg shadow-xl border border-border flex flex-col items-center space-y-1">
          {isOpen && menuItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-primary hover:bg-primary/10 hover:text-accent hover:scale-110 transition-transform"
                  asChild
                >
                  <Link href={item.href} aria-label={item.label}>
                    <item.icon className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleOpen}
                className="h-10 w-10 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:scale-110 transition-transform"
                aria-label={isOpen ? "Close Quick Access Menu" : "Open Quick Access Menu"}
              >
                {isOpen ? <X className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p>{isOpen ? "Hide Menu" : "Show Menu"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
