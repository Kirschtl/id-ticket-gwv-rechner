import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ID-Ticket GWV Rechner",
  description: "Geldwerten Vorteil von Standby- und ID-Flugtickets für 2026 und 2027 berechnen.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
