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
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
  UserCheck,
  Settings,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Mail,
  Phone,
  Info,
  Cookie,
  Trash2,
  Download,
  Edit,
  Users
} from "lucide-react"

export const metadata = {
  title: "Privacy Policy - ChatPulse Random Chat Platform",
  description: "Learn how ChatPulse protects your privacy when using our random chat platform. Comprehensive privacy policy covering data collection, usage, and your rights.",
  keywords: ["privacy policy", "chatpulse privacy", "random chat privacy", "data protection", "user privacy", "GDPR compliance"],
  openGraph: {
    title: "Privacy Policy - ChatPulse",
    description: "Your privacy matters. Learn how ChatPulse protects your personal information and respects your privacy rights.",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function PrivacyPolicy() {
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
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-green-50 dark:bg-green-950 rounded-full mb-4 sm:mb-6">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Privacy Protected</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Privacy Policy</h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-3 sm:mb-4">
              Last updated: December 2024
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your privacy is fundamental to us. This policy explains how we collect, use, and protect
              your information when you use ChatNow's random chat platform.
            </p>
          </div>

          {/* Privacy Commitment */}
          <div className="mb-8 sm:mb-12 p-4 sm:p-6 border border-muted rounded-lg bg-muted/30">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1 text-sm sm:text-base">Our Privacy Commitment</p>
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
                  We believe in privacy by design. ChatNow is built to minimize data collection
                  while maximizing your safety and experience. We never sell your personal information.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy at a Glance */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center justify-center sm:justify-start">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary" />
              Privacy at a Glance
            </h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base text-center sm:text-left">Quick overview of how we handle your privacy</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">Anonymous Chat Available</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Chat without providing any personal information</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">No Chat Storage</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Messages are not permanently stored on our servers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">GDPR & CCPA Compliant</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Full compliance with major privacy regulations</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">End-to-End Encryption</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Your conversations are encrypted and secure</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">Easy Data Deletion</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Request deletion of your data at any time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">No Data Selling</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">We never sell your personal information to third parties</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Collection Types */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center">
              <Database className="h-6 w-6 mr-3 text-primary" />
              What Information We Collect
            </h2>
            <p className="text-muted-foreground mb-8">Transparent breakdown of data collection practices</p>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <UserCheck className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Account Information</h3>
                <p className="text-sm text-muted-foreground">
                  Optional email, username, and preferences you choose to provide
                </p>
              </div>
              <div>
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Usage Data</h3>
                <p className="text-sm text-muted-foreground">
                  Anonymous analytics to improve service quality and performance
                </p>
              </div>
              <div>
                <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Technical Data</h3>
                <p className="text-sm text-muted-foreground">
                  Device info, IP address, and browser data for security and functionality
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Privacy Policy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Detailed Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="collection">
                  <AccordionTrigger className="text-left">
                    1. Information Collection and Use
                  </AccordionTrigger>
                  <AccordionContent className="text-base space-y-4">
                    <p>
                      We collect information to provide better services to all our users. The types of information we collect include:
                    </p>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Information You Provide:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                          <li>Account registration details (optional email, username)</li>
                          <li>Profile preferences and settings</li>
                          <li>Support communications and feedback</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Information We Collect Automatically:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                          <li>Device information and browser type</li>
                          <li>IP address and general location (country/region)</li>
                          <li>Usage patterns and feature interactions</li>
                          <li>Performance and error logs</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="usage">
                  <AccordionTrigger className="text-left">
                    2. How We Use Your Information
                  </AccordionTrigger>
                  <AccordionContent className="text-base space-y-4">
                    <p>
                      We use the information we collect for the following purposes:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Service Provision:</strong> To provide, maintain, and improve ChatPulse services</li>
                      <li><strong>Safety & Security:</strong> To detect abuse, fraud, and ensure platform safety</li>
                      <li><strong>Communication:</strong> To send important updates and respond to support requests</li>
                      <li><strong>Analytics:</strong> To understand usage patterns and improve user experience</li>
                      <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                    </ul>
                    <p>
                      <strong>Important:</strong> We do not read, store, or analyze the content of your private conversations.
                      Chat messages are encrypted and automatically deleted after the conversation ends.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="rights">
                  <AccordionTrigger className="text-left">
                    3. Your Privacy Rights
                  </AccordionTrigger>
                  <AccordionContent className="text-base space-y-4">
                    <p>
                      You have the following rights regarding your personal information:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Download className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Access & Portability</h4>
                          <p className="text-sm text-muted-foreground">Request a copy of your personal data in a portable format</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Edit className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Correction</h4>
                          <p className="text-sm text-muted-foreground">Update or correct inaccurate personal information</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Trash2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Deletion</h4>
                          <p className="text-sm text-muted-foreground">Request deletion of your personal data (right to be forgotten)</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Settings className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Control</h4>
                          <p className="text-sm text-muted-foreground">Opt-out of certain data processing activities</p>
                        </div>
                      </div>
                    </div>
                    <p>
                      To exercise these rights, contact us at <strong>privacy@chatpulse.in</strong>.
                      We will respond within 30 days of receiving your request.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="contact">
                  <AccordionTrigger className="text-left">
                    4. Contact Information
                  </AccordionTrigger>
                  <AccordionContent className="text-base space-y-4">
                    <p>
                      If you have any questions about this Privacy Policy, please contact us:
                    </p>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>privacy@chatpulse.in</span>
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
              This privacy policy is effective as of December 2024 and will remain in effect except with respect to any changes in its provisions in the future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/terms">
                  <FileText className="h-4 w-4 mr-2" />
                  Terms of Service
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
