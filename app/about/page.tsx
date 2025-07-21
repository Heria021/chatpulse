import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"
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
  Handshake
} from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ChatPulse
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <TooltipProvider>
                <ThemeToggle />
              </TooltipProvider>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-6">
              <MessageCircle className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              About <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">ChatNow</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A modern, fast, and secure chat application designed to bring people together through seamless communication.
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Target className="h-6 w-6 mr-3 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To provide a lightning-fast, secure, and user-friendly chat experience that connects people instantly, 
                regardless of their location or device. We believe communication should be simple, reliable, and accessible to everyone.
              </p>
            </CardContent>
          </Card>

          {/* Story Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                    The Idea
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    ChatNow was born from the need for a simple, fast, and reliable chat application. 
                    In a world full of complex messaging platforms, we wanted to create something that just works - 
                    no unnecessary features, no bloat, just pure communication.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="h-5 w-5 mr-2 text-blue-500" />
                    The Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Built with modern web technologies including Next.js, React, and real-time communication protocols, 
                    ChatNow is designed for speed and reliability. Every feature is carefully crafted to enhance the user experience.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    The Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We envision a world where distance doesn't matter, where conversations flow naturally, 
                    and where technology brings people closer together rather than creating barriers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Speed & Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Every millisecond matters. We optimize for lightning-fast message delivery and seamless user experience.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Privacy & Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your conversations are private. We use encryption and follow best practices to protect your data.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Accessibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Communication should be for everyone. We design with accessibility and inclusivity in mind.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>User-Centric</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Every decision we make is guided by what's best for our users and their communication needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Stats Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-center text-2xl">ChatNow by the Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                  <div className="text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                  <div className="text-muted-foreground">Messages Sent</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                  <div className="text-muted-foreground">Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-muted-foreground">Support</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developer Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Code className="h-6 w-6 mr-3 text-primary" />
                Meet the Developer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  ChatNow is developed and maintained by a passionate developer who believes in the power of 
                  simple, effective communication tools. With a focus on user experience and modern web technologies, 
                  the goal is to create the best chat experience possible.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" asChild>
                    <a href="mailto:hariomsuthar7143@gmail.com" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Developer
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collaboration Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Handshake className="h-6 w-6 mr-3 text-primary" />
                Open for Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  ChatNow is open for collaboration, partnerships, and even acquisition opportunities. 
                  If you're interested in working together or have ideas to improve the platform, we'd love to hear from you.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Partnership Opportunities</Badge>
                  <Badge variant="secondary">Technical Collaboration</Badge>
                  <Badge variant="secondary">Business Development</Badge>
                  <Badge variant="secondary">Acquisition Discussions</Badge>
                </div>
                <div className="pt-4">
                  <Button asChild>
                    <a href="mailto:hariomsuthar7143@gmail.com">
                      Get in Touch
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Get in Touch</CardTitle>
              <CardDescription className="text-center">
                Have questions, feedback, or want to collaborate? We'd love to hear from you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 text-center">
                <div className="space-y-3">
                  <Mail className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold">Support</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:support@chatpulse.in" className="text-primary hover:underline">
                      support@chatpulse.in
                    </a>
                  </p>
                </div>
                <div className="space-y-3">
                  <Instagram className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold">Follow Us</h3>
                  <p className="text-muted-foreground">
                    <a href="https://instagram.com/chatpulse" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      @chatpulse
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/auth/signup">
                Start Chatting Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
