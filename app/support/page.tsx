"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  MessageCircle,
  HelpCircle,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle,
  Search,
  Book,
  Users,
  Phone,
  Shield,
  UserCheck,
  Zap,
  Loader2,
  AlertCircle
} from "lucide-react"
import { contactFormSchema, type ContactFormData } from "@/lib/types/contact"

export default function Support() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const submitContactForm = useMutation(api.contact.submitContactForm)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      // Get user's IP and user agent for tracking
      const userAgent = navigator.userAgent

      const submissionId = await submitContactForm({
        ...data,
        userAgent,
      })

      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
      })

      form.reset()
    } catch (error) {
      console.error('Contact form submission error:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Sorry, there was an error sending your message. Please try again or contact us directly.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Get quick answers to common questions or reach out to our support team
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search for help..." 
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Email Support</CardTitle>
                <CardDescription>
                  Get help via email. We typically respond within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href="mailto:support@chatpulse.in">
                    Contact Support
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Developer Contact</CardTitle>
                <CardDescription>
                  Reach out directly to the developer for technical issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <a href="mailto:hariomsuthar7143@gmail.com">
                    Contact Developer
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Browse our guides and learn how to use ChatPulse effectively.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href="#faq">
                    View FAQ
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>



          {/* FAQ Section */}
          <div id="faq" className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find quick answers to common questions about ChatPulse. Can't find what you're looking for? Contact our support team.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <UserCheck className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">How do I create an account?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6">
                    <div className="ml-12 space-y-3">
                      <p className="text-muted-foreground">
                        Creating an account is quick and easy:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Click "Sign In" in the header</li>
                        <li>Select "Sign Up" to create a new account</li>
                        <li>Enter your email address and create a password</li>
                        <li>Verify your email and start chatting!</li>
                      </ol>
                      <p className="text-sm text-muted-foreground">
                        You'll need a valid email address to get started.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">Can I use ChatPulse without an account?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6">
                    <div className="ml-12 space-y-3">
                      <p className="text-muted-foreground">
                        Yes! You can use our Guest Mode to try ChatPulse without creating an account.
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Click "Try as Guest" on the homepage</li>
                        <li>Choose a temporary username</li>
                        <li>Start chatting immediately</li>
                        <li>No email or registration required</li>
                      </ul>
                      <p className="text-sm text-muted-foreground">
                        Note: Guest sessions are temporary and data won't be saved.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">Is ChatPulse free to use?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6">
                    <div className="ml-12 space-y-3">
                      <p className="text-muted-foreground">
                        Yes, ChatPulse is completely free to use! We believe in providing accessible communication for everyone.
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>No subscription fees</li>
                        <li>No hidden charges</li>
                        <li>No credit card required</li>
                        <li>All features included</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">How secure are my messages?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6">
                    <div className="ml-12 space-y-3">
                      <p className="text-muted-foreground">
                        Your security and privacy are our top priorities:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>End-to-end encryption for all messages</li>
                        <li>Secure data storage with industry standards</li>
                        <li>No message content stored on our servers</li>
                        <li>Regular security audits and updates</li>
                      </ul>
                      <p className="text-sm text-muted-foreground">
                        We use the same security protocols as major financial institutions.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <UserCheck className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">Can I delete my account?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6">
                    <div className="ml-12 space-y-3">
                      <p className="text-muted-foreground">
                        Yes, you have full control over your account and data:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Go to your Profile Settings</li>
                        <li>Scroll to "Account Management"</li>
                        <li>Click "Delete Account"</li>
                        <li>Confirm your decision</li>
                      </ol>
                      <p className="text-sm text-red-600">
                        Warning: This will permanently remove all your data and cannot be undone.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">How do I report inappropriate content?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6">
                    <div className="ml-12 space-y-3">
                      <p className="text-muted-foreground">
                        We take inappropriate content seriously. Here's how to report it:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Email us immediately at support@chatpulse.in</li>
                        <li>Call our support line: +91 78777 13244</li>
                        <li>Include screenshots if possible</li>
                        <li>Provide details about the incident</li>
                      </ul>
                      <p className="text-sm text-muted-foreground">
                        Our team reviews all reports within 24 hours and takes appropriate action.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">How do I start a conversation?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6">
                    <div className="ml-12 space-y-3">
                      <p className="text-muted-foreground">
                        Starting conversations is simple:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Go to the "Users" section</li>
                        <li>Browse online users or search for someone</li>
                        <li>Click on a user's profile</li>
                        <li>Click "Start Chat" to begin messaging</li>
                      </ol>
                      <p className="text-sm text-muted-foreground">
                        You can also join public chat rooms or create group conversations.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">What if I need immediate help?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6">
                    <div className="ml-12 space-y-3">
                      <p className="text-muted-foreground">
                        For urgent issues, you can reach us directly:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium text-sm">Support Hotline</p>
                          <a href="tel:+917877713244" className="text-primary hover:underline">
                            +91 78777 13244
                          </a>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium text-sm">Technical Support</p>
                          <a href="tel:+917014247460" className="text-primary hover:underline">
                            +91 70142 47460
                          </a>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Available during business hours (9 AM - 6 PM IST).
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Send Us a Message</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Prefer to write? Use our contact form below to send us a detailed message.
                We'll get back to you as soon as possible with a personalized response.
              </p>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                Contact Form
              </CardTitle>
              <CardDescription>
                Fill out the form below with your question or issue, and we'll respond with a detailed solution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitStatus.type && (
                <Alert className={`mb-6 ${submitStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <AlertCircle className={`h-4 w-4 ${submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
                  <AlertDescription className={submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {submitStatus.message}
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your full name"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="What's this about?"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your issue or question in detail..."
                            rows={5}
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Still Need Help Buttons */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4">Need immediate assistance?</h3>
            <p className="text-muted-foreground mb-6">
              Choose your preferred contact method for faster support
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button variant="outline" asChild>
                <a href="mailto:support@chatpulse.in" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="tel:+917877713244" className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="tel:+917014247460" className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Technical Line
                </a>
              </Button>
            </div>
          </div>

          {/* Response Time */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Average response time: 24 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
