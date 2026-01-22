import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "./providers/query-provider";
import { AuthProvider } from "./providers/auth-provider";
import DataMigrator from "./components/data-migrator";

export const metadata: Metadata = {
  title: "菩提心妙宝",
  description: "极简功课记录与复盘的数字化账本。",
  manifest: "/manifest.json",
  themeColor: "#b45309",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "菩提心妙宝",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            <DataMigrator />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
