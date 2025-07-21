import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MessageCircle, FileText, Shield, Users, AlertTriangle, Phone, Mail } from "lucide-react"

export default function TermsOfService() {
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
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-muted-foreground">
              Last updated: December 2024
            </p>
          </div>

          {/* Quick Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Quick Overview
              </CardTitle>
              <CardDescription>
                By using ChatPulse, you agree to these terms. Please read them carefully.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• You must be 13+ years old to use ChatPulse</li>
                <li>• Be respectful and follow community guidelines</li>
                <li>• Don't share harmful, illegal, or inappropriate content</li>
                <li>• We may suspend accounts that violate these terms</li>
                <li>• Service is provided "as is" without warranties</li>
              </ul>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using ChatPulse ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p className="text-muted-foreground">
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
              <p className="text-muted-foreground mb-4">
                You must be at least 13 years old to use ChatPulse. By using the Service, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>You are at least 13 years of age</li>
                <li>You have the legal capacity to enter into this agreement</li>
                <li>Your use of the Service will not violate any applicable law or regulation</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
              <p className="text-muted-foreground mb-4">
                You agree to use ChatPulse responsibly and in accordance with these guidelines:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-600">✓ Allowed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Respectful communication</li>
                      <li>• Sharing appropriate content</li>
                      <li>• Using real or appropriate usernames</li>
                      <li>• Reporting violations</li>
                      <li>• Protecting your account security</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">✗ Prohibited</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Harassment or bullying</li>
                      <li>• Spam or excessive messaging</li>
                      <li>• Sharing illegal content</li>
                      <li>• Impersonating others</li>
                      <li>• Attempting to hack or disrupt the service</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Account Security</h2>
              <p className="text-muted-foreground mb-4">
                You are responsible for maintaining the security of your account and password. ChatPulse cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Service Availability</h2>
              <p className="text-muted-foreground mb-4">
                We strive to provide reliable service, but ChatPulse is provided "as is" without any warranties. We do not guarantee that the service will be uninterrupted or error-free.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to terminate or suspend your account at any time for violations of these terms or for any other reason we deem necessary.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the service.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-6">8. Contact Information</h2>
              <p className="text-muted-foreground mb-6">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Support Team</CardTitle>
                        <CardDescription>General inquiries and assistance</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <div className="p-1.5 bg-primary/10 rounded">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Email Support</p>
                          <a href="mailto:support@chatpulse.in" className="text-primary hover:underline text-sm">
                            support@chatpulse.in
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <div className="p-1.5 bg-primary/10 rounded">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Phone Support</p>
                          <a href="tel:+917877713244" className="text-primary hover:underline text-sm">
                            +91 78777 13244
                          </a>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Response time: Within 24 hours
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Developer Contact</CardTitle>
                        <CardDescription>Technical issues and collaboration</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <div className="p-1.5 bg-primary/10 rounded">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Email Contact</p>
                          <a href="mailto:hariomsuthar7143@gmail.com" className="text-primary hover:underline text-sm">
                            hariomsuthar7143@gmail.com
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <div className="p-1.5 bg-primary/10 rounded">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Direct Phone</p>
                          <a href="tel:+917014247460" className="text-primary hover:underline text-sm">
                            +91 70142 47460
                          </a>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        For partnerships and technical discussions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 text-center">
            <Button asChild>
              <Link href="/">Return to ChatPulse</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
