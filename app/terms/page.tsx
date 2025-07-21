import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Footer } from "@/components/ui/footer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  MessageCircle,
  Scale,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Globe,
  Lock,
  UserCheck,
  Ban,
  Gavel,
  Info,
  Mail,
  Phone
} from "lucide-react"

export const metadata = {
  title: "Terms of Service - ChatPulse Random Chat Platform",
  description: "Read ChatPulse's Terms of Service for our random chat platform. Understand your rights and responsibilities when using our stranger chat services.",
  keywords: ["terms of service", "chatpulse terms", "random chat terms", "stranger chat legal", "chat platform rules", "user agreement"],
  openGraph: {
    title: "Terms of Service - ChatPulse",
    description: "Legal terms and conditions for using ChatPulse's random chat platform safely and responsibly.",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function TermsOfService() {
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
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-50 dark:bg-blue-950 rounded-full mb-4 sm:mb-6">
              <Scale className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Legal Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Terms of Service</h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-3 sm:mb-4">
              Last updated: December 2024
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              These Terms of Service govern your use of ChatNow's random chat platform.
              Please read them carefully before using our services.
            </p>
          </div>

          {/* Important Notice */}
          <div className="mb-8 sm:mb-12 p-4 sm:p-6 border border-muted rounded-lg bg-muted/30">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1 text-sm sm:text-base">Important Notice</p>
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
                  By using ChatNow, you agree to these terms. If you don't agree with any part of these terms, please don't use our service.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center justify-center sm:justify-start">
              <Info className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary" />
              Quick Summary
            </h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base text-center sm:text-left">Key points you should know (this doesn't replace reading the full terms)</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">You can chat anonymously</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">No personal information required to start chatting</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">Free to use</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Basic random chat features are completely free</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">Global community</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Connect with people from around the world</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">Be respectful</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Harassment, abuse, or inappropriate content is prohibited</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">Must be 13+ years old</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Parental consent required for users under 18</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">No illegal activities</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Platform cannot be used for illegal purposes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Terms */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Detailed Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="acceptance">
                  <AccordionTrigger className="text-left">
                    1. Acceptance of Terms
                  </AccordionTrigger>
                  <AccordionContent className="text-base space-y-4">
                    <p>
                      By accessing or using ChatPulse ("the Service"), you agree to be bound by these Terms of Service
                      and all applicable laws and regulations. If you do not agree with any of these terms,
                      you are prohibited from using or accessing this site.
                    </p>
                    <p>
                      These terms apply to all users of the Service, including without limitation users who are
                      browsers, vendors, customers, merchants, and/or contributors of content.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="description">
                  <AccordionTrigger className="text-left">
                    2. Service Description
                  </AccordionTrigger>
                  <AccordionContent className="text-base space-y-4">
                    <p>
                      ChatPulse is a random chat platform that connects users with strangers from around the world
                      for text and video conversations. Our service includes:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Random text chat with strangers</li>
                      <li>Random video chat capabilities</li>
                      <li>Interest-based matching</li>
                      <li>Anonymous chat options</li>
                      <li>Mobile and web applications</li>
                      <li>Moderation and safety features</li>
                    </ul>
                    <p>
                      We reserve the right to modify, suspend, or discontinue any part of the Service
                      at any time without notice.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="eligibility">
                  <AccordionTrigger className="text-left">
                    3. User Eligibility
                  </AccordionTrigger>
                  <AccordionContent className="text-base space-y-4">
                    <p>
                      To use ChatPulse, you must:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Be at least 13 years old</li>
                      <li>Have parental consent if you are under 18</li>
                      <li>Provide accurate information when required</li>
                      <li>Not be prohibited from using the service under applicable law</li>
                      <li>Not have been previously banned from the platform</li>
                    </ul>
                    <p>
                      We reserve the right to verify your eligibility and may request additional information
                      or documentation to confirm your identity or age.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="conduct">
                  <AccordionTrigger className="text-left">
                    4. User Conduct and Prohibited Activities
                  </AccordionTrigger>
                  <AccordionContent className="text-base space-y-4">
                    <p>
                      When using ChatPulse, you agree NOT to:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Prohibited Content:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Share explicit or sexual content</li>
                          <li>Post violent or threatening material</li>
                          <li>Engage in harassment or bullying</li>
                          <li>Share hate speech or discriminatory content</li>
                          <li>Distribute spam or promotional content</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Prohibited Activities:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Impersonate others</li>
                          <li>Share personal information of others</li>
                          <li>Attempt to hack or disrupt the service</li>
                          <li>Use automated tools or bots</li>
                          <li>Engage in illegal activities</li>
                        </ul>
                      </div>
                    </div>
                    <p>
                      Violation of these rules may result in immediate suspension or termination of your account.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacy">
                  <AccordionTrigger className="text-left">
                    5. Privacy and Data Protection
                  </AccordionTrigger>
                  <AccordionContent className="text-base space-y-4">
                    <p>
                      Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect
                      your information when you use our Service. By using ChatPulse, you agree to the collection
                      and use of information in accordance with our Privacy Policy.
                    </p>
                    <p>
                      Key privacy points:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>We don't store chat messages permanently</li>
                      <li>Anonymous chat options available</li>
                      <li>No personal information required for basic use</li>
                      <li>GDPR and CCPA compliant data practices</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="termination">
                  <AccordionTrigger className="text-left">
                    6. Account Termination
                  </AccordionTrigger>
                  <AccordionContent className="text-base space-y-4">
                    <p>
                      We may terminate or suspend your account and access to the Service immediately,
                      without prior notice or liability, for any reason whatsoever, including without
                      limitation if you breach the Terms.
                    </p>
                    <p>
                      Upon termination, your right to use the Service will cease immediately.
                      If you wish to terminate your account, you may simply discontinue using the Service.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="contact">
                  <AccordionTrigger className="text-left">
                    7. Contact Information
                  </AccordionTrigger>
                  <AccordionContent className="text-base space-y-4">
                    <p>
                      If you have any questions about these Terms of Service, please contact us:
                    </p>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>legal@chatpulse.in</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>www.chatpulse.in/support</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center pt-8 border-t">
            <p className="text-muted-foreground mb-4">
              These terms are effective as of December 2024 and will remain in effect except with respect to any changes in their provisions in the future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/privacy">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/support">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
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