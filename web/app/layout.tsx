import type { Metadata } from "next";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
import { AuthProvider } from "@/components/context/AuthContext";

export const metadata: Metadata = {
  title: "HomeStay - Find Your Perfect Stay",
  description:
    "Discover homestays, villas, apartments, and cabins for your next trip with HomeStay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          async
        />
      </body>
    </html>
  );
}
