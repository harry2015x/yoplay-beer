import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";


// ============================================================
// FUENTES
// ============================================================

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


// ============================================================
// CONFIGURACIÓN DEL LOGO
// ============================================================

// Este logo se utiliza para Open Graph y redes sociales.
// El favicon se carga automáticamente desde:
//
// app/icon.png
//
const LOGO_IMAGE_URL =
  "https://res.cloudinary.com/dv1gz4eqo/image/upload/v1789083650/LOGO-11_oeaddu.png";


// ============================================================
// URL DEL SITIO
// ============================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://yoplay-beer.vercel.app";


// ============================================================
// DESCRIPCIÓN
// ============================================================

const DESCRIPCION =
  "YOPlay Beer: sistema de gestión y ventas para bares y negocios de bebidas. Controla mesas, pedidos y ventas en un solo lugar.";


// ============================================================
// METADATA
// ============================================================

export const metadata: Metadata = {

  metadataBase: new URL(SITE_URL),


  title: {

    default:
      "YOPlay Beer | Sistema de gestión y ventas",

    template:
      "%s · YOPlay Beer",

  },


  description:
    DESCRIPCION,


  applicationName:
    "YOPlay Beer",


  keywords: [

    "YOPlay Beer",

    "sistema de ventas",

    "gestión de mesas",

    "bar",

    "cervecería",

    "bebidas",

    "punto de venta",

    "POS",

  ],


  authors: [

    {
      name:
        "YOPlay Beer",
    },

  ],


  // ==========================================================
  // FAVICON
  // ==========================================================
  //
  // Next.js detecta automáticamente:
  //
  // app/icon.png
  //
  // No es necesario declarar "icons" aquí.
  // ==========================================================


  openGraph: {

    type:
      "website",


    locale:
      "es_CO",


    siteName:
      "YOPlay Beer",


    title:
      "YOPlay Beer | Sistema de gestión y ventas",


    description:
      DESCRIPCION,


    images: [

      {

        url:
          LOGO_IMAGE_URL,


        width:
          512,


        height:
          512,


        alt:
          "YOPlay Beer",

      },

    ],

  },


  twitter: {

    card:
      "summary",


    title:
      "YOPlay Beer | Sistema de gestión y ventas",


    description:
      DESCRIPCION,


    images: [

      LOGO_IMAGE_URL,

    ],

  },


  robots: {

    index:
      false,


    follow:
      false,

  },

};


// ============================================================
// VIEWPORT
// ============================================================

export const viewport: Viewport = {

  themeColor:
    "#0b0f0d",


  colorScheme:
    "dark",


  width:
    "device-width",


  initialScale:
    1,

};


// ============================================================
// ROOT LAYOUT
// ============================================================

type RootLayoutProps = {

  children:
    ReactNode;

};


export default function RootLayout({

  children,

}: RootLayoutProps) {

  return (

    <html
      lang="es"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        h-full
        antialiased
      `}
    >

      <body className="min-h-full">

        {children}

      </body>

    </html>

  );

}