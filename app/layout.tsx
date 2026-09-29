import "./globals.css";
import { AuthInterceptor } from "@/components/auth/AuthInterceptor";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Dynamic Admin Panel with Next.js",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthInterceptor />
          {children}
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
              }
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
