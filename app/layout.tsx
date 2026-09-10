import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const LOGO_IMAGE_URL =
  "https://res.cloudinary.com/dv1gz4eqo/image/upload/v1789083650/LOGO-11_oeaddu.png";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DESCRIPCION =
  "YOPlay Beer: sistema de gestión y ventas para bares y negocios de bebidas. Controla mesas, pedidos y ventas en un solo lugar.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "YOPlay Beer | Sistema de gestión y ventas",
    template: "%s · YOPlay Beer",
  },
  description: DESCRIPCION,
  applicationName: "YOPlay Beer",
  keywords: [
    "YOPlay Beer",
    "sistema de ventas",
    "gestión de mesas",
    "bar",
    "bebidas",
    "punto de venta",
  ],
  authors: [{ name: "YOPlay Beer" }],
  icons: {
    icon: LOGO_IMAGE_URL,
    shortcut: LOGO_IMAGE_URL,
    apple: LOGO_IMAGE_URL,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "YOPlay Beer",
    title: "YOPlay Beer | Sistema de gestión y ventas",
    description: DESCRIPCION,
    images: [
      {
        url: LOGO_IMAGE_URL,
        width: 512,
        height: 512,
        alt: "YOPlay Beer",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "YOPlay Beer | Sistema de gestión y ventas",
    description: DESCRIPCION,
    images: [LOGO_IMAGE_URL],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f0d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

