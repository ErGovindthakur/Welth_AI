import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "Wealth AI — Smart Finance Management",
    template: "%s | Wealth AI",
  },

  description:
    "Wealth AI helps you track income, manage expenses, and get AI-powered financial insights to grow your money smarter.",

  keywords: [
    "finance app",
    "expense tracker",
    "AI finance",
    "money management",
    "budget planner",
    "personal finance AI",
    "wealth management app",
  ],

  metadataBase: new URL("https://welth-ai.online"),

  openGraph: {
    title: "Wealth AI — Smart Finance Management",
    description:
      "Track income, control expenses, and get AI-driven financial insights.",

    url: "https://welth-ai.online",
    siteName: "Wealth AI",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wealth AI Dashboard Preview",
      },
    ],

    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Wealth AI — Smart Finance Management",
    description:
      "AI-powered personal finance platform to manage money smarter.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/logo-sm.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />

          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made with 💗 by Er Govind</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
