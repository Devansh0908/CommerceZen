import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider as NextThemesProvider } from '@/components/layout/ThemeProvider'; // Renamed to avoid conflict
import { ColorThemeProvider } from '@/contexts/ColorThemeContext'; // Import new ColorThemeProvider

export const metadata: Metadata = {
  title: 'CommerceZen',
  description: 'Your one-stop shop for amazing products.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <ColorThemeProvider> {/* Wrap with ColorThemeProvider */}
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ColorThemeProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
