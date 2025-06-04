
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
import { Store, UserPlus, LogIn, UserCircle, LogOut, Sparkles, LayoutGrid, ListOrdered, ShoppingBag, PackageOpen, ShoppingCart, Sun, Moon, User } from 'lucide-react';

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
      {/* Welcome Section - Shortened to ~20vh */}
      <section className="min-h-[20vh] flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/10 px-4 sm:px-6 lg:px-8 py-4">
        {!isAuthLoading && !isLoggedIn && (
          <div className="animate-subtle-fade-in">
            <Store className="h-8 w-8 sm:h-10 text-accent mb-2 mx-auto" />
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-primary">
              Welcome to CommerceZen
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xs md:max-w-sm mx-auto font-body">
              Sign up for deals or log in.
            </p>
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <Button
                size="sm"
                onClick={openLoginModal}
                variant="outline"
                className="font-headline w-full sm:w-auto text-sm py-2 px-4 border-primary/50 hover:border-primary text-primary hover:bg-primary/5"
              >
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
              <Button
                size="sm"
                onClick={openSignupModal}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-headline w-full sm:w-auto text-sm py-2 px-4"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Create Account
              </Button>
            </div>
          </div>
        )}

        {!isAuthLoading && isLoggedIn && user && (
          <div className="animate-subtle-fade-in">
            <UserCircle className="h-8 w-8 sm:h-10 text-accent mb-2 mx-auto" />
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-primary truncate max-w-xs sm:max-w-md">
              Welcome Back, {user.name || user.email}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xs md:max-w-sm mx-auto font-body">
              Ready to shop or manage your account?
            </p>
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <Button
                size="sm"
                onClick={handleScrollToAllProducts}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-headline w-full sm:w-auto text-sm py-2 px-4"
              >
                <ShoppingBag className="mr-2 h-4 w-4" /> Shop Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/profile')}
                className="font-headline w-full sm:w-auto text-sm py-2 px-4 border-primary/50 hover:border-primary text-primary hover:bg-primary/5"
              >
                <User className="mr-2 h-4 w-4" /> My Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/order-history')}
                className="font-headline w-full sm:w-auto text-sm py-2 px-4 border-primary/50 hover:border-primary text-primary hover:bg-primary/5"
              >
                <ListOrdered className="mr-2 h-4 w-4" /> My Orders
              </Button>
              <Button
                size="sm"
                onClick={logout}
                variant="destructive"
                className="font-headline w-full sm:w-auto text-sm py-2 px-4"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
        <div className="flex justify-center pt-4 sm:pt-6">
          <SearchBar />
        </div>

        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 -mt-2 mb-4 sm:mb-6">
          <Button variant="outline" size="sm" onClick={handleScrollToFeatured} className="font-body w-full sm:w-auto">
            <Sparkles className="mr-2 h-4 w-4 text-accent" /> Featured
          </Button>
          <Button variant="outline" size="sm" onClick={handleScrollToAllProducts} className="font-body w-full sm:w-auto">
            <LayoutGrid className="mr-2 h-4 w-4 text-accent" /> All Products
          </Button>
          {isLoggedIn && (
            <Button variant="outline" size="sm" onClick={() => router.push('/order-history')} className="font-body w-full sm:w-auto">
              <ListOrdered className="mr-2 h-4 w-4 text-accent" /> Order Status
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push('/cart')} className="font-body w-full sm:w-auto">
            <ShoppingCart className="mr-2 h-4 w-4 text-accent" /> View Cart
          </Button>
          {mounted && (
            <Button variant="outline" size="sm" onClick={toggleTheme} className="font-body w-full sm:w-auto">
              {resolvedTheme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4 text-accent" />
              ) : (
                <Moon className="mr-2 h-4 w-4 text-accent" />
              )}
              {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
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

