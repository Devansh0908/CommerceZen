
import type React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
// AuthProvider is no longer imported or used here, it's in the root layout

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // AuthProvider removed from here
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
