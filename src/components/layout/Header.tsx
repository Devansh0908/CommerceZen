
"use client";

import Link from 'next/link';
import { ShoppingCart, Zap, LogIn, UserPlus, LogOut, UserCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useEffect, useState } from 'react';
import SearchBar from '@/components/commerce/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function Header() {
  const { getItemCount, isCartInitialized: isCartReady, cartItems } = useCart();
  const { user, isLoggedIn, logout, isLoading: isAuthLoading } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [currentCartItemCount, setCurrentCartItemCount] = useState(0);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isCartReady) {
        setCurrentCartItemCount(getItemCount());
    }
  }, [getItemCount, mounted, isCartReady, cartItems]);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  const handleSignupSuccess = () => {
    setShowSignupModal(false);
  };

  const openLoginModal = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  }

  const openSignupModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  }


  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 sm:gap-8">
        <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-headline font-bold hover:opacity-80 transition-opacity">
          <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
          CommerceZen
        </Link>
        
        <div className="flex-grow flex justify-center px-2 sm:px-4 hidden sm:flex">
          <SearchBar />
        </div>
        
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="hover:text-accent transition-colors font-body text-sm sm:text-base hidden sm:block">
            Home
          </Link>

          {isAuthLoading && mounted && (
            <Loader2 className="h-5 w-5 animate-spin text-primary-foreground/70" />
          )}

          {!isAuthLoading && mounted && !isLoggedIn && (
            <>
              <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
                <DialogTrigger asChild>
                  <Button variant="ghost" onClick={openLoginModal} className="hover:bg-primary/70 hover:text-accent text-sm px-2 sm:px-3">
                    <LogIn className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Login</span>
                  </Button>
                </DialogTrigger>
                <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToSignup={openSignupModal} />
              </Dialog>
              <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={openSignupModal} className="border-accent text-accent hover:bg-accent/10 text-sm px-2 sm:px-3">
                   <UserPlus className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Sign Up</span>
                  </Button>
                </DialogTrigger>
                <SignupForm onSignupSuccess={handleSignupSuccess} onSwitchToLogin={openLoginModal}/>
              </Dialog>
            </>
          )}

          {!isAuthLoading && mounted && isLoggedIn && user && (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hover:bg-primary/70 hover:text-accent text-sm px-2 sm:px-3">
                  <UserCircle className="mr-0 sm:mr-2 h-5 w-5" />
                  <span className="hidden sm:inline truncate max-w-[100px]">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-body">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="font-body cursor-not-allowed text-muted-foreground">Profile (coming soon)</DropdownMenuItem>
                <DropdownMenuItem className="font-body cursor-not-allowed text-muted-foreground">Order History (soon)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="font-body text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Link href="/cart" className="relative flex items-center hover:text-accent transition-colors font-body">
            <ShoppingCart className="h-6 w-6" />
            {mounted && isCartReady && currentCartItemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {currentCartItemCount}
              </span>
            )}
            <span className="sr-only">Cart ({currentCartItemCount} items)</span>
          </Link>
        </nav>
      </div>
      <div className="container mx-auto px-4 pb-3 sm:hidden">
          <SearchBar />
      </div>
    </header>
  );
}
