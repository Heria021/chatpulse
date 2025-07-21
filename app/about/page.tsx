import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Footer } from "@/components/ui/footer"
import {
  MessageCircle,
  Heart,
  Zap,
  Shield,
  Users,
  Target,
  Lightbulb,
  Code,
  Mail,
  Instagram,
  Handshake,
  Globe,
  Award,
  TrendingUp,
  Clock,
  Star,
  Rocket,
  Brain,
  Lock,
  Smartphone,
  Twitter,
  Linkedin,
  Github,
  MapPin,
  Calendar,
  Coffee,
  Headphones
} from "lucide-react"

export const metadata = {
  title: "About ChatPulse - The World's Leading Random Chat Platform",
  description: "Learn about ChatPulse's mission to connect people worldwide through safe, instant random chat. Discover our story, team, and commitment to building the best stranger chat experience.",
  keywords: ["about chatpulse", "random chat platform", "stranger chat company", "chat app team", "online communication", "meet new people"],
  openGraph: {
    title: "About ChatPulse - Connect with Strangers Worldwide",
    description: "The story behind the world's most trusted random chat platform. Learn how ChatPulse is revolutionizing online communication.",
    type: "website",
    images: [
      {
        url: "/og-about.jpg",
        width: 1200,
        height: 630,
        alt: "About ChatPulse - Random Chat Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "About ChatPulse - Random Chat Platform",
    description: "Discover the story behind the world's leading platform for meeting strangers and making connections online.",
    images: ["/og-about.jpg"]
  }
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ChatNow
              </span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <TooltipProvider>
                <ThemeToggle />
              </TooltipProvider>
              <Button asChild size="sm" className="text-xs sm:text-sm">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Spacer for Fixed Header */}
      <div className="h-14 sm:h-16"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-primary/10 rounded-full mb-4 sm:mb-6">
              <Rocket className="h-3 w-3 sm:h-4 sm:w-4 text-primary mr-2" />
              <span className="text-xs sm:text-sm font-medium text-primary">Connecting 10M+ People Worldwide</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              About ChatNow
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
              The world's most trusted platform for random chat and meeting strangers online.
              We're revolutionizing how people connect, one conversation at a time.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-16 text-center">
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2">10M+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2">150+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Countries</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2">1B+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Messages Sent</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2">24/7</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Available</div>
              </div>
            </div>
          </div>

          {/* Our Story Section */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center justify-center sm:justify-start">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary" />
              Our Story
            </h2>
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
                ChatNow was born from a simple belief: <strong>everyone deserves meaningful connections</strong>.
                In 2020, during a time when the world felt more disconnected than ever, our founders
                envisioned a platform where strangers could become friends, where cultural barriers
                could be broken down through conversation, and where loneliness could be replaced with community.
              </p>
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
                What started as a small project to help people practice languages with native speakers
                has evolved into the world's largest platform for random chat, serving over
                <strong> 10 million users</strong> across <strong>150+ countries</strong>.
                Every day, millions of conversations happen on ChatNow, creating friendships,
                sparking romances, and building bridges between cultures.
              </p>
            </div>
          </div>

          {/* Mission & Values */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Our Mission & Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center justify-center md:justify-start">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary" />
                  Our Mission
                </h3>
                <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-center md:text-left">
                  To create the world's safest and most engaging platform for random chat,
                  where people can meet strangers, make friends, and discover new perspectives
                  in a secure, respectful environment.
                </p>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center justify-center md:justify-start">
                  <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary" />
                  Our Vision
                </h3>
                <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-center md:text-left">
                  A world where distance and differences don't matter, where every conversation
                  has the potential to create understanding, friendship, and positive change
                  across cultures and communities.
                </p>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center flex items-center justify-center">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary" />
              Our Core Values
            </h2>
            <p className="text-center text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
              The principles that guide everything we do at ChatNow
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div>
                <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Safety First</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  User safety and privacy are our top priorities in every feature we build
                </p>
              </div>
              <div>
                <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Authentic Connections</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  We foster genuine relationships and meaningful conversations
                </p>
              </div>
              <div>
                <Globe className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Global Inclusivity</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Welcoming people from all backgrounds, cultures, and walks of life
                </p>
              </div>
              <div>
                <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Innovation</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Continuously improving the random chat experience with cutting-edge technology
                </p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <Card className="mb-8 sm:mb-12">
            <CardHeader>
              <CardTitle className="flex items-center text-xl sm:text-2xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary" />
                Meet Our Team
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                The passionate developer behind ChatNow's success
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="text-center max-w-sm">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4">
                    <AvatarFallback className="text-lg sm:text-xl font-semibold bg-primary/10 text-primary">
                      HS
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-base sm:text-lg mb-1">Hariii Suthar</h3>
                  <p className="text-primary font-medium mb-2 text-sm sm:text-base">Solo Developer & Founder</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
                    Full-stack developer passionate about creating meaningful connections through innovative chat technology
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="mailto:hariomsuthar7143@gmail.com">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://github.com/hariisuthar" target="_blank" rel="noopener noreferrer">
                        <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="mb-8 sm:mb-12">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl lg:text-2xl">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary" />
                Get in Touch
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                We'd love to hear from you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Contact Information</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      <span className="text-sm sm:text-base">hariomsuthar7143@gmail.com</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      <span className="text-sm sm:text-base">India</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      <span className="text-sm sm:text-base">Available worldwide</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Follow Us</h3>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Start Chatting?</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join millions of people worldwide who are already making meaningful connections on ChatNow
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button size="sm" className="sm:size-default" asChild>
                <Link href="/auth/signin">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-sm sm:text-base">Start Chatting Now</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="sm:size-default" asChild>
                <Link href="/support">
                  <Headphones className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-sm sm:text-base">Contact Support</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
