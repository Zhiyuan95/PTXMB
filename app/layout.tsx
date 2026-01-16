import type { Metadata } from "next";
import "./globals.css";


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
      <body className= "antialiased">
        {children}
      </body>
    </html>
  );
}
