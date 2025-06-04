
"use client";

import { useState, useRef } from 'react'; // Added useRef
import { useRouter } from 'next/navigation'; // Added useRouter
import FeaturedProducts from '@/components/commerce/FeaturedProducts';
import ProductGrid from '@/components/commerce/ProductGrid';
import SearchBar from '@/components/commerce/SearchBar';
import { mockProducts } from '@/lib/data'; 
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, UserPlus, LogIn, UserCircle, LogOut, Sparkles, LayoutGrid, ListOrdered } from 'lucide-react'; // Added new icons

export default function HomePage() {
  const products = mockProducts;
  const { user, isLoggedIn, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter(); // Initialize useRouter
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const featuredSectionRef = useRef<HTMLDivElement>(null);
  const allProductsSectionRef = useRef<HTMLDivElement>(null);

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

  const handleScrollToFeatured = () => {
    featuredSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleScrollToAllProducts = () => {
    allProductsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-12">
      {!isAuthLoading && !isLoggedIn && (
        <>
          <Card className="mx-auto max-w-xl bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl border-primary/30 p-4 sm:p-6 md:p-8">
            <CardHeader className="items-center text-center p-0 mb-6">
              <Zap className="h-14 w-14 sm:h-16 sm:w-16 text-accent mb-4" />
              <CardTitle className="text-3xl sm:text-4xl font-headline text-primary">Welcome to CommerceZen!</CardTitle>
              <CardDescription className="text-md sm:text-lg text-muted-foreground font-body max-w-md mt-2">
                Unlock exclusive deals, manage orders, and enjoy a personalized shopping experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 p-0">
              <Button 
                size="lg" 
                onClick={openLoginModal} 
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-headline w-full sm:w-auto text-base py-3 px-6"
              >
                <LogIn className="mr-2 h-5 w-5" /> Login
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={openSignupModal} 
                className="font-headline w-full sm:w-auto text-base py-3 px-6 border-primary/50 hover:border-primary text-primary hover:bg-primary/5"
              >
                  <UserPlus className="mr-2 h-5 w-5" /> Create Account
              </Button>
            </CardContent>
          </Card>

          <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
            <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToSignup={openSignupModal} />
          </Dialog>
          <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
            <SignupForm onSignupSuccess={handleSignupSuccess} onSwitchToLogin={openLoginModal} />
          </Dialog>
        </>
      )}

      {!isAuthLoading && isLoggedIn && user && (
        <Card className="mx-auto max-w-xl bg-gradient-to-br from-primary/5 via-background to-background shadow-xl border-primary/20 p-4 sm:p-6 md:p-8">
          <CardHeader className="items-center text-center p-0 mb-6">
            <UserCircle className="h-14 w-14 sm:h-16 sm:w-16 text-accent mb-3" />
            <CardTitle className="text-3xl sm:text-4xl font-headline text-primary">Welcome Back, {user.name || user.email}!</CardTitle>
            <CardDescription className="text-md sm:text-lg text-muted-foreground font-body max-w-md mt-2">
              You are currently logged in. Explore our products or manage your account settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 p-0">
            <Button
              size="lg"
              onClick={logout}
              variant="outline" 
              className="font-headline w-full sm:w-auto text-base py-3 px-6 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="mr-2 h-5 w-5" /> Logout
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center py-8">
        <SearchBar />
      </div>

      {/* New Functionality Buttons Section */}
      <div className="my-2 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 -mt-4 mb-8">
        <Button variant="outline" size="default" onClick={handleScrollToFeatured} className="font-body w-full sm:w-auto">
          <Sparkles className="mr-2 h-4 w-4 text-accent" /> Explore Featured
        </Button>
        <Button variant="outline" size="default" onClick={handleScrollToAllProducts} className="font-body w-full sm:w-auto">
          <LayoutGrid className="mr-2 h-4 w-4 text-accent" /> Shop All Products
        </Button>
        {isLoggedIn && (
          <Button variant="outline" size="default" onClick={() => router.push('/order-history')} className="font-body w-full sm:w-auto">
            <ListOrdered className="mr-2 h-4 w-4 text-accent" /> Check Order Status
          </Button>
        )}
      </div>

      <div ref={featuredSectionRef}>
        <FeaturedProducts products={products} />
      </div>
      <div ref={allProductsSectionRef}>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
