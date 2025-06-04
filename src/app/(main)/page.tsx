
"use client";

import { useState } from 'react';
import FeaturedProducts from '@/components/commerce/FeaturedProducts';
import ProductGrid from '@/components/commerce/ProductGrid';
import SearchBar from '@/components/commerce/SearchBar';
import { mockProducts } from '@/lib/data'; 
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, UserPlus, LogIn, UserCircle, LogOut } from 'lucide-react'; // Added UserCircle, LogOut

export default function HomePage() {
  const products = mockProducts;
  const { user, isLoggedIn, isLoading: isAuthLoading, logout } = useAuth(); // Added user and logout
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  const handleSignupSuccess = () => {
    setShowSignupModal(false);
  };

  const openLoginModal = () => {
    setShowSignupModal(false); // Close signup if open
    setShowLoginModal(true);
  }

  const openSignupModal = () => {
    setShowLoginModal(false); // Close login if open
    setShowSignupModal(true);
  }

  return (
    <div className="space-y-12">
      {!isAuthLoading && !isLoggedIn && (
        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
            <Card className="mb-12 bg-gradient-to-br from-primary/5 via-background to-background shadow-xl border-primary/20">
              <CardHeader className="items-center text-center">
                <Zap className="h-12 w-12 text-accent mb-3" />
                <CardTitle className="text-3xl font-headline text-primary">Welcome to CommerceZen!</CardTitle>
                <CardDescription className="text-md text-muted-foreground font-body max-w-md">
                  Sign in or create an account to unlock exclusive deals, manage your orders, and enjoy a personalized shopping experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <DialogTrigger asChild>
                  <Button size="lg" onClick={openLoginModal} className="bg-accent text-accent-foreground hover:bg-accent/90 font-headline w-full sm:w-auto">
                    <LogIn className="mr-2 h-5 w-5" /> Login to Your Account
                  </Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                   <Button variant="outline" size="lg" onClick={openSignupModal} className="font-headline w-full sm:w-auto">
                     <UserPlus className="mr-2 h-5 w-5" /> Create New Account
                  </Button>
                </DialogTrigger>
              </CardContent>
            </Card>
            {/* Login Form Dialog Content - triggered by its own DialogTrigger above */}
            <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToSignup={openSignupModal} />
            {/* Signup Form Dialog Content - triggered by its own DialogTrigger above or by switch from LoginForm */}
            <SignupForm onSignupSuccess={handleSignupSuccess} onSwitchToLogin={openLoginModal} />
          </Dialog>
        </Dialog>
      )}

      {!isAuthLoading && isLoggedIn && user && (
        <Card className="mb-12 bg-gradient-to-br from-primary/5 via-background to-background shadow-xl border-primary/20">
          <CardHeader className="items-center text-center">
            <UserCircle className="h-12 w-12 text-accent mb-3" />
            <CardTitle className="text-3xl font-headline text-primary">Welcome Back, {user.email}!</CardTitle>
            <CardDescription className="text-md text-muted-foreground font-body max-w-md">
              You are currently logged in. Explore our products or manage your account settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              onClick={logout}
              variant="destructive" // Using destructive variant for logout consistency
              className="font-headline w-full sm:w-auto"
            >
              <LogOut className="mr-2 h-5 w-5" /> Logout
            </Button>
            {/* You could add other buttons here, e.g., "View My Account" (when implemented) */}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center py-8">
        <SearchBar />
      </div>
      <FeaturedProducts products={products} />
      <ProductGrid products={products} />
    </div>
  );
}
