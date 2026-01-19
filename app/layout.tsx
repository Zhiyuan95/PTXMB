import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "./providers/query-provider";
import { AuthProvider } from "./providers/auth-provider";
import DataMigrator from "./components/data-migrator";

export const metadata: Metadata = {
  title: "修行记录",
  description: "极简功课记录与复盘的数字化账本。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
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
