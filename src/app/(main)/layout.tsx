
import type React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/ai/ChatbotWidget'; // Import the chatbot widget
import ScrollToTopButton from '@/components/layout/ScrollToTopButton'; // New import

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
      <ChatbotWidget /> {/* Add the chatbot widget here */}
      <ScrollToTopButton /> {/* Add the scroll to top button here */}
    </div>
  );
}
