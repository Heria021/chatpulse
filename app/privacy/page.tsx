import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MessageCircle, Shield, Eye, Lock, Database, UserCheck, Phone, Mail } from "lucide-react"

export default function PrivacyPolicy() {
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
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground">
              Last updated: December 2024
            </p>
          </div>

          {/* Privacy Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-blue-500" />
                Privacy at a Glance
              </CardTitle>
              <CardDescription>
                Your privacy is important to us. Here's how we protect your data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Messages are encrypted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Minimal data collection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Secure data storage</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">No data selling</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Transparent practices</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    <span className="text-sm">User control over data</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect only the information necessary to provide you with a great chat experience:
              </p>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Email address (for account creation and recovery)</li>
                      <li>• Username and display name</li>
                      <li>• Profile picture (optional)</li>
                      <li>• Account preferences and settings</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Usage Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Messages you send and receive</li>
                      <li>• Connection and activity logs</li>
                      <li>• Device and browser information</li>
                      <li>• IP address and general location</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide and maintain the ChatPulse service</li>
                <li>Enable real-time messaging and communication</li>
                <li>Improve and optimize our service</li>
                <li>Provide customer support</li>
                <li>Ensure security and prevent abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Lock className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Encryption</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      All messages are encrypted in transit and at rest using industry-standard protocols.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Database className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Secure Storage</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your data is stored on secure servers with regular backups and monitoring.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who help us operate ChatPulse (under strict confidentiality agreements)</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the following rights regarding your personal data:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                </ul>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Restrict data processing</li>
                  <li>Object to data processing</li>
                  <li>Withdraw consent</li>
                  <li>File a complaint</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your data only as long as necessary to provide our services or as required by law. You can delete your account at any time, which will remove your personal data from our systems.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-6">7. Contact Us</h2>
              <p className="text-muted-foreground mb-6">
                If you have any questions about this Privacy Policy or your data, please contact us:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Privacy Support</CardTitle>
                        <CardDescription>Data protection and privacy inquiries</CardDescription>
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
                          <p className="font-medium text-sm">Privacy Email</p>
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
                          <p className="font-medium text-sm">Privacy Hotline</p>
                          <a href="tel:+917877713244" className="text-primary hover:underline text-sm">
                            +91 78777 13244
                          </a>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Data requests and privacy concerns
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <UserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Developer Contact</CardTitle>
                        <CardDescription>Technical privacy questions</CardDescription>
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
                          <p className="font-medium text-sm">Technical Email</p>
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
                          <p className="font-medium text-sm">Technical Support</p>
                          <a href="tel:+917014247460" className="text-primary hover:underline text-sm">
                            +91 70142 47460
                          </a>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Security and data architecture questions
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
