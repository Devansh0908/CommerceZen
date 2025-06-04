
"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FeaturedProducts from '@/components/commerce/FeaturedProducts';
import ProductGrid from '@/components/commerce/ProductGrid';
import SearchBar from '@/components/commerce/SearchBar';
import { mockProducts } from '@/lib/data'; 
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { Store, UserPlus, LogIn, UserCircle, LogOut, Sparkles, LayoutGrid, ListOrdered, ShoppingBag, PackageOpen } from 'lucide-react';

export default function HomePage() {
  const products = mockProducts;
  const { user, isLoggedIn, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();
  
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
    <div>
      {/* Full Screen Welcome Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/10 px-4 sm:px-6 lg:px-8 py-12">
        {!isAuthLoading && !isLoggedIn && (
          <div className="animate-subtle-fade-in">
            <Store className="h-24 w-24 sm:h-28 md:h-32 text-accent mb-6 mx-auto" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-primary">
              Welcome to CommerceZen
            </h1>
            <p className="text-md sm:text-lg md:text-xl text-muted-foreground mt-4 max-w-lg md:max-w-xl mx-auto font-body">
              Your journey to amazing products starts here. Sign up for exclusive deals or log in to continue.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
            <UserCircle className="h-24 w-24 sm:h-28 md:h-32 text-accent mb-6 mx-auto" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-primary">
              Welcome Back, {user.name || user.email}!
            </h1>
            <p className="text-md sm:text-lg md:text-xl text-muted-foreground mt-4 max-w-lg md:max-w-xl mx-auto font-body">
              Ready to continue your shopping journey or manage your account?
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
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

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 -mt-2 mb-6 sm:mb-8">
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
    </div>
  );
}
