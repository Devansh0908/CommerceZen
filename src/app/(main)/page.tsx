
"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import FeaturedProducts from '@/components/commerce/FeaturedProducts';
import ProductGrid from '@/components/commerce/ProductGrid';
import SearchBar from '@/components/commerce/SearchBar';
import { mockProducts } from '@/lib/data'; 
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { Store, UserPlus, LogIn, UserCircle, LogOut, Sparkles, LayoutGrid, ListOrdered, ShoppingBag, PackageOpen, ShoppingCart, Sun, Moon } from 'lucide-react';

export default function HomePage() {
  const products = mockProducts;
  const { user, isLoggedIn, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const featuredSectionRef = useRef<HTMLDivElement>(null);
  const allProductsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div>
      {/* Welcome Section - Shortened */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/10 px-4 sm:px-6 lg:px-8 py-10">
        {!isAuthLoading && !isLoggedIn && (
          <div className="animate-subtle-fade-in">
            <Store className="h-16 w-16 sm:h-20 md:h-24 text-accent mb-4 mx-auto" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-primary">
              Welcome to CommerceZen
            </h1>
            <p className="text-sm sm:text-md md:text-lg text-muted-foreground mt-3 max-w-md md:max-w-lg mx-auto font-body">
              Your journey to amazing products starts here. Sign up for exclusive deals or log in to continue.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button 
                size="lg" 
                onClick={openLoginModal} 
                variant="outline"
                className="font-headline w-full sm:w-auto text-base py-3 px-6 border-primary/50 hover:border-primary text-primary hover:bg-primary/5"
              >
                <LogIn className="mr-2 h-5 w-5" /> Login
              </Button>
              <Button 
                size="lg" 
                onClick={openSignupModal} 
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-headline w-full sm:w-auto text-base py-3 px-6"
              >
                <UserPlus className="mr-2 h-5 w-5" /> Create Account
              </Button>
            </div>
          </div>
        )}

        {!isAuthLoading && isLoggedIn && user && (
          <div className="animate-subtle-fade-in">
            <UserCircle className="h-16 w-16 sm:h-20 md:h-24 text-accent mb-4 mx-auto" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-primary">
              Welcome Back, {user.name || user.email}!
            </h1>
            <p className="text-sm sm:text-md md:text-lg text-muted-foreground mt-3 max-w-md md:max-w-lg mx-auto font-body">
              Ready to continue your shopping journey or manage your account?
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button 
                size="lg" 
                onClick={handleScrollToAllProducts} 
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-headline w-full sm:w-auto text-base py-3 px-6"
              >
                <ShoppingBag className="mr-2 h-5 w-5" /> Start Shopping
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => router.push('/order-history')} 
                className="font-headline w-full sm:w-auto text-base py-3 px-6 border-primary/50 hover:border-primary text-primary hover:bg-primary/5"
              >
                <ListOrdered className="mr-2 h-5 w-5" /> My Orders
              </Button>
              <Button
                size="lg"
                onClick={logout}
                variant="destructive" 
                className="font-headline w-full sm:w-auto text-base py-3 px-6"
              >
                <LogOut className="mr-2 h-5 w-5" /> Logout
              </Button>
            </div>
          </div>
        )}

        {/* Dialogs for Login and Signup - remain unchanged */}
        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToSignup={openSignupModal} />
        </Dialog>
        <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
          <SignupForm onSignupSuccess={handleSignupSuccess} onSwitchToLogin={openLoginModal} />
        </Dialog>
      </section>

      {/* Rest of the Page Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10 sm:space-y-12">
        <div className="flex justify-center pt-4 sm:pt-8">
          <SearchBar />
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 -mt-2 mb-6 sm:mb-8">
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
          <Button variant="outline" size="default" onClick={() => router.push('/cart')} className="font-body w-full sm:w-auto">
            <ShoppingCart className="mr-2 h-4 w-4 text-accent" /> View Cart
          </Button>
          {mounted && (
            <Button variant="outline" size="default" onClick={toggleTheme} className="font-body w-full sm:w-auto">
              {resolvedTheme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4 text-accent" />
              ) : (
                <Moon className="mr-2 h-4 w-4 text-accent" />
              )}
              {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
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
    </div>
  );
}
