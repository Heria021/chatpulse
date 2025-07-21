"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Footer } from "@/components/ui/footer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MessageCircle,
  Headphones,
  Mail,
  Clock,
  Book,
  MessageSquare,
  Shield,
  Settings,
  Users,
  Send,
  Play
} from "lucide-react"
import { toast } from "sonner"

export default function SupportPage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success("Support request submitted! We'll get back to you within 24 hours.")
    setContactForm({
      name: "",
      email: "",
      category: "",
      subject: "",
      message: ""
    })
    setIsSubmitting(false)
  }

  const faqData = [
    {
      category: "Getting Started",
      icon: <Play className="h-5 w-5" />,
      questions: [
        {
          question: "How do I start chatting with strangers on ChatNow?",
          answer: "Simply visit our homepage and click 'Start Random Chat'. No registration required! You'll be instantly connected with someone new from around the world. For a better experience, you can create a free account to save preferences and access additional features like interest-based matching."
        },
        {
          question: "Is ChatNow really free to use?",
          answer: "Yes! ChatNow's core random chat features are completely free. You can chat with strangers, use text and video chat, and access basic matching features without paying anything. We also offer premium features for enhanced experiences, but the basic stranger chat is always free."
        },
        {
          question: "Do I need to download an app to chat with strangers?",
          answer: "No download required! ChatNow works directly in your web browser on any device - desktop, tablet, or mobile. However, we also offer mobile apps for iOS and Android for a more convenient random chat experience on your phone."
        },
        {
          question: "Can I choose who I chat with?",
          answer: "ChatNow offers both random matching and filtered options. You can chat completely randomly with anyone, or use our interest filters to match with people who share similar hobbies, languages, or topics of conversation."
        }
      ]
    },
    {
      category: "Safety & Privacy",
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          question: "How does ChatNow keep me safe while chatting with strangers?",
          answer: "We use multiple safety measures: real-time content moderation, AI-powered inappropriate content detection, easy reporting and blocking tools, anonymous chat options, and 24/7 monitoring. Never share personal information like your address, phone number, or financial details with strangers."
        },
        {
          question: "Can I chat anonymously with strangers?",
          answer: "Absolutely! You can chat completely anonymously without providing any personal information. We don't require names, emails, or phone numbers for basic random chatting. You can use a nickname or remain completely anonymous. Your privacy is our priority."
        },
        {
          question: "Are my conversations with strangers private?",
          answer: "Yes, your random chat conversations are private and encrypted. We don't store chat messages permanently, and they're automatically deleted after your conversation ends. Only you and your chat partner can see your messages during the session."
        },
        {
          question: "How do I report inappropriate behavior from strangers?",
          answer: "Click the 'Report' button during any chat, or use the flag icon next to the user's name. You can also block users immediately. We take all reports seriously and investigate within 24 hours. Provide as much detail as possible about the inappropriate behavior."
        }
      ]
    },
    {
      category: "Technical Issues",
      icon: <Settings className="h-5 w-5" />,
      questions: [
        {
          question: "My random video chat isn't working. What should I do?",
          answer: "First, check that your browser has camera and microphone permissions enabled for ChatNow. Try refreshing the page, clearing your browser cache, or switching to a different browser (Chrome works best). Make sure your camera isn't being used by another application."
        },
        {
          question: "Why can't I connect to strangers?",
          answer: "This could be due to high traffic, internet connectivity issues, or browser problems. Try refreshing the page, checking your internet connection, or trying again in a few minutes. Peak hours (evenings in major time zones) may have longer wait times."
        },
        {
          question: "The stranger chat is loading slowly. How can I fix this?",
          answer: "Slow loading can be caused by internet speed, browser cache, or server load. Try clearing your browser cache, closing other tabs, checking your internet speed, or switching to a different network if possible. Use Chrome or Firefox for best performance."
        },
        {
          question: "Why does my video freeze during random chat?",
          answer: "Video freezing is usually due to poor internet connection or high CPU usage. Close other applications, check your internet speed (minimum 1 Mbps recommended), and try lowering video quality in settings. Restart your browser if the issue persists."
        }
      ]
    },
    {
      category: "Features & Account",
      icon: <Users className="h-5 w-5" />,
      questions: [
        {
          question: "What are the benefits of creating a ChatNow account?",
          answer: "With an account, you get: saved chat preferences, interest-based stranger matching, chat history (if enabled), premium features access, priority support, and the ability to reconnect with interesting people you've met. Accounts are free and enhance your random chat experience."
        },
        {
          question: "How do interest filters work for random chat?",
          answer: "Interest filters help match you with strangers who share similar hobbies, languages, or topics. Select your interests in your profile, and our algorithm will prioritize connecting you with people who have similar interests, making conversations more engaging and meaningful."
        },
        {
          question: "Can I block specific strangers permanently?",
          answer: "Yes! Click the block button during any chat to prevent future connections with that user. Blocked users cannot contact you again through random matching, and the block is permanent unless you choose to unblock them in your settings."
        },
        {
          question: "How do I change my random chat preferences?",
          answer: "Go to Settings > Chat Preferences to customize your random chat experience. You can set language preferences, age ranges, interests, and choose between text-only or video chat modes. These settings help us match you with more compatible strangers."
        }
      ]
    }
  ]



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
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-muted rounded-full mb-4 sm:mb-6">
              <Headphones className="h-3 w-3 sm:h-4 sm:w-4 text-primary mr-2" />
              <span className="text-xs sm:text-sm font-medium text-primary">24/7 Support Available</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Support Center</h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8">
              Get help with ChatNow's random chat platform. Find answers to common questions,
              troubleshoot issues, or contact our support team for assistance.
            </p>
          </div>

          {/* Support Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="text-center">
              <Book className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">FAQ & Guides</h3>
              <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                Find instant answers to common questions about random chat
              </p>
              <Button variant="outline" size="sm">Browse FAQ</Button>
            </div>

            <div className="text-center">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Live Support</h3>
              <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                Chat with our team for immediate assistance
              </p>
              <Button variant="outline" size="sm">Start Chat</Button>
            </div>

            <div className="text-center">
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Email Support</h3>
              <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                Send detailed questions, get responses within 24 hours
              </p>
              <Button variant="outline" size="sm">Send Email</Button>
            </div>
          </div>

          {/* Support Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-16 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">2 min</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Average Response</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">99.5%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Availability</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">50+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Languages</div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
                Find answers to common questions about ChatNow's random chat platform.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
              {faqData.map((category) => (
                <div key={category.category}>
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center space-x-2">
                    {category.icon}
                    <span>{category.category}</span>
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    {category.questions.map((faq, index) => (
                      <div key={index} className="border-l-2 border-muted pl-4 sm:pl-6">
                        <h4 className="font-medium mb-2 text-sm sm:text-base">{faq.question}</h4>
                        <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm lg:text-base">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 flex items-center justify-center">
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary" />
                Contact Support
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
                Can't find what you're looking for? Send us a message and we'll help you with your random chat experience.
              </p>
            </div>
            <div className="max-w-2xl mx-auto border rounded-lg p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={contactForm.category} onValueChange={(value) => setContactForm({...contactForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random-chat">Random Chat Issues</SelectItem>
                      <SelectItem value="video-chat">Video Chat Problems</SelectItem>
                      <SelectItem value="safety">Safety & Privacy</SelectItem>
                      <SelectItem value="account">Account & Settings</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue or question in detail..."
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Options */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Other Ways to Reach Us</h3>
            <p className="text-muted-foreground mb-8">
              Choose your preferred method to get help with ChatNow
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Email Support</h4>
                <p className="text-muted-foreground mb-4">support@chatnow.com</p>
                <Button asChild variant="outline">
                  <a href="mailto:support@chatnow.com">Send Email</a>
                </Button>
              </div>

              <div className="text-center">
                <MessageSquare className="h-8 w-8 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Live Chat</h4>
                <p className="text-muted-foreground mb-4">Available 24/7</p>
                <Button variant="outline">Start Live Chat</Button>
              </div>

              <div className="text-center">
                <Book className="h-8 w-8 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Help Center</h4>
                <p className="text-muted-foreground mb-4">Browse guides & tutorials</p>
                <Button asChild variant="outline">
                  <Link href="/blog">Visit Blog</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
