
"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
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
import { Store, UserPlus, LogIn, UserCircle, LogOut, Sparkles, LayoutGrid, ListOrdered, ShoppingBag, PackageOpen, ShoppingCart, Sun, Moon, User, Filter, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product } from '@/lib/types';

const sortOptions = [
  { value: 'default', label: 'Default Sorting' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
  { value: 'name-desc', label: 'Name: Z-A' },
];

export default function HomePage() {
  const allProducts = mockProducts;
  const { user, isLoggedIn, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [sortOption, setSortOption] = useState<string>('default');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts);

  const featuredSectionRef = useRef<HTMLDivElement>(null);
  const allProductsSectionRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    allProducts.forEach(product => uniqueCategories.add(product.category));
    return ["All Categories", ...Array.from(uniqueCategories).sort()];
  }, [allProducts]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let productsToFilter = allProducts;

    if (selectedCategory && selectedCategory !== "All Categories") {
      productsToFilter = productsToFilter.filter(
        product => product.category === selectedCategory
      );
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      productsToFilter = productsToFilter.filter(
        product =>
          product.name.toLowerCase().includes(lowerCaseQuery) ||
          product.description.toLowerCase().includes(lowerCaseQuery)
      );
    }

    let sortedProducts = [...productsToFilter]; // Create a new array for sorting

    switch (sortOption) {
      case 'price-asc':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // For 'default', we can keep the order from filtering or sort by ID for stability
        // For now, it keeps the filtered order. If mockProducts had an inherent order, it would be preserved.
        // Optionally, sort by ID: sortedProducts.sort((a, b) => a.id.localeCompare(b.id));
        break;
    }

    setFilteredProducts(sortedProducts);
  }, [searchQuery, selectedCategory, sortOption, allProducts]);


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
    setSearchQuery('');
    setSelectedCategory("All Categories");
    setSortOption("default");
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

        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToSignup={openSignupModal} />
        </Dialog>
        <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
          <SignupForm onSignupSuccess={handleSignupSuccess} onSwitchToLogin={openLoginModal} />
        </Dialog>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
        <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-3 pt-4 sm:pt-6">
          <SearchBar value={searchQuery} onValueChange={setSearchQuery} />
          <div className="w-full md:w-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[220px] bg-card font-body text-sm h-9">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="font-body">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-auto">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full md:w-[220px] bg-card font-body text-sm h-9">
                <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="font-body">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <FeaturedProducts products={allProducts} /> {/* Consider if featured should also be filtered, for now, it shows all featured from allProducts */}
        </div>
        <div ref={allProductsSectionRef}>
          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </div>
  );
}
