
"use client";

import Link from 'next/link';
import { ShoppingCart, Zap, LogIn, UserPlus, LogOut, UserCircle, Loader2, ListOrdered, User } from 'lucide-react'; // Added User icon
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
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from '@/components/layout/ThemeToggle';


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
    <header className="bg-header text-header-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-headline font-bold hover:opacity-80 transition-opacity">
          <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
          <span className="text-primary">CommerceZen</span>
        </Link>
        
        <div className="flex-grow flex justify-center items-center px-2 sm:px-4">
          <SearchBar />
        </div>
        
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/" className="hover:text-accent transition-colors font-body text-sm sm:text-base px-2 sm:px-3 py-1.5 rounded-md hover:bg-header-foreground/10">
            Home
          </Link>

          {isAuthLoading && mounted && (
            <Loader2 className="h-5 w-5 animate-spin text-header-foreground/70 mx-2" />
          )}

          {!isAuthLoading && mounted && !isLoggedIn && (
            <>
              <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
                <DialogTrigger asChild>
                  <Button variant="ghost" onClick={openLoginModal} className="hover:bg-header-foreground/10 hover:text-accent text-header-foreground text-sm px-2 sm:px-3">
                    <LogIn className="mr-0 sm:mr-2 h-4 w-4 text-header-foreground" /> <span className="hidden sm:inline">Login</span>
                  </Button>
                </DialogTrigger>
                <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToSignup={openSignupModal} />
              </Dialog>
              <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
                <DialogTrigger asChild>
                  <Button variant="default" onClick={openSignupModal} className="bg-primary text-primary-foreground hover:bg-primary/80 text-sm px-2 sm:px-3">
                   <UserPlus className="mr-0 sm:mr-2 h-4 w-4 text-accent" /> <span className="hidden sm:inline">Sign Up</span>
                  </Button>
                </DialogTrigger>
                <SignupForm onSignupSuccess={handleSignupSuccess} onSwitchToLogin={openLoginModal}/>
              </Dialog>
            </>
          )}

          {!isAuthLoading && mounted && isLoggedIn && user && (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hover:bg-header-foreground/10 hover:text-accent text-header-foreground text-sm px-2 sm:px-3">
                  <UserCircle className="mr-0 sm:mr-2 h-5 w-5 text-header-foreground" />
                  <span className="hidden sm:inline truncate max-w-[100px]">{user.name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-body">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="font-body cursor-pointer">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" /> 
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="font-body cursor-pointer">
                  <Link href="/order-history">
                    <ListOrdered className="mr-2 h-4 w-4" />
                    Order History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="font-body text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {mounted && <ThemeToggle />}

          <Link href="/cart" className="relative flex items-center hover:text-accent transition-colors font-body p-2 rounded-md hover:bg-header-foreground/10">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-header-foreground" />
            {mounted && isCartReady && currentCartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-pulse">
                {currentCartItemCount}
              </span>
            )}
            <span className="sr-only">Cart ({currentCartItemCount} items)</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
