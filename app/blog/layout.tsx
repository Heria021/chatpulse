import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Blog | ChatPulse - Real-time Chat Insights & Tutorials",
  description: "Discover the latest insights, tutorials, and best practices for real-time chat applications, web development, and modern communication technologies.",
  keywords: "chat application, real-time messaging, web development, tutorials, programming, technology",
  openGraph: {
    title: "ChatPulse Blog - Real-time Chat Insights & Tutorials",
    description: "Discover the latest insights, tutorials, and best practices for real-time chat applications and web development.",
    type: "website",
    url: "https://chatpulse.in/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatPulse Blog - Real-time Chat Insights & Tutorials",
    description: "Discover the latest insights, tutorials, and best practices for real-time chat applications and web development.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
