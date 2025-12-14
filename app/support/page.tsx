"use client"
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  MessageSquare, Mail, Clock, Book, Shield, 
  Settings, Users, Send, Play, Activity, Menu, 
  Search, Terminal, AlertCircle, CheckCircle2, 
  ChevronRight, Plus, HelpCircle, Loader2,
  ArrowRight
} from 'lucide-react';
import { toast } from "sonner";

// --- VISUAL MOCKUPS ---

// 1. SUPPORT CONSOLE MOCKUP
// Visualizes support as a live system dashboard
const SupportConsoleMockup = () => {
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col border border-neutral-800 transform rotate-1 hover:rotate-0 transition-transform duration-500 relative group">
      {/* Header */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 justify-between">
        <div className="text-white text-sm font-bold tracking-wide flex items-center gap-2">
          <Terminal className="w-4 h-4 text-white" />
          SUPPORT_TERMINAL_V1
        </div>
        <div className="flex gap-2 items-center">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] text-green-500 font-mono font-bold">AGENTS_ONLINE</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-black font-mono text-xs relative overflow-hidden">
         {/* Scanline */}
         <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-[20%] animate-scan pointer-events-none"></div>
         
         <div className="space-y-4 text-neutral-400">
            <div className="flex gap-4">
                <span className="text-neutral-600">[10:42:01]</span>
                <span>System check initiated...</span>
            </div>
            <div className="flex gap-4">
                <span className="text-neutral-600">[10:42:02]</span>
                <span><span className="text-blue-400">Load_Balancer</span> status: <span className="text-green-400">OK</span></span>
            </div>
            <div className="flex gap-4">
                <span className="text-neutral-600">[10:42:02]</span>
                <span><span className="text-blue-400">Chat_Relay_01</span> status: <span className="text-green-400">OK</span></span>
            </div>
            <div className="flex gap-4">
                <span className="text-neutral-600">[10:42:03]</span>
                <span>Incoming ticket from <span className="text-yellow-400">User_882</span>: "Video sync issue"</span>
            </div>
            <div className="flex gap-4">
                <span className="text-neutral-600">[10:42:04]</span>
                <span>Assigning to <span className="text-purple-400">Agent_Sarah</span>...</span>
            </div>
            <div className="flex gap-4 border-l-2 border-green-500 pl-4 py-2 my-2 bg-green-900/10">
                <span className="text-green-400">{'>'} Ticket #4492 resolved in 42s.</span>
            </div>
            <div className="flex gap-4">
                <span className="text-neutral-600">[10:42:05]</span>
                <span className="animate-pulse">Waiting for input_</span>
            </div>
         </div>
      </div>

      {/* Footer Input Mock */}
      <div className="p-3 bg-neutral-900 border-t border-neutral-800">
         <div className="flex items-center gap-2 text-neutral-500 font-mono text-xs">
            <span>{'>'}</span>
            <span className="h-4 w-2 bg-neutral-600 animate-pulse"></span>
         </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: -20%; }
          100% { top: 120%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- COMPONENTS ---

// 2. FAQ Item (Matching Terms Page Style)
const FAQItem = ({ category, question, answer, icon: Icon }: { category: string, question: string, answer: string, icon: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div 
      className={`group border border-neutral-800 rounded-2xl bg-neutral-900/50 overflow-hidden transition-all duration-300 ${isOpen ? 'border-neutral-600 bg-neutral-900' : 'hover:border-neutral-700'}`}
    >
      <button 
        className="w-full p-6 text-left flex justify-between items-start gap-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex gap-4">
            <div className={`mt-1 transition-colors ${isOpen ? 'text-white' : 'text-neutral-500 group-hover:text-white'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-1 block">{category}</span>
                <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                    {question}
                </span>
            </div>
        </div>
        <div className={`flex-shrink-0 p-1 rounded-full border border-neutral-700 transition-all duration-300 ${isOpen ? 'bg-white text-black rotate-45 border-white' : 'text-neutral-400 group-hover:border-neutral-500'}`}>
             <Plus className="w-4 h-4" />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-6 pb-6 pl-16 text-neutral-400 leading-relaxed text-sm md:text-base border-t border-neutral-800/50 pt-4 mt-2">
            {answer}
        </p>
      </div>
    </div>
  );
};

// 3. Stat Card (Brutalist Style)
const StatCard = ({ value, label, subtext }: { value: string, label: string, subtext: string }) => (
  <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center hover:-translate-y-1 transition-transform">
     <div className="text-4xl font-black mb-2 tracking-tighter">{value}</div>
     <div className="font-bold text-sm uppercase tracking-wide mb-1">{label}</div>
     <div className="text-xs font-mono text-neutral-500">{subtext}</div>
  </div>
);

// --- MAIN PAGE ---

export default function SupportPage() {
  const [scrolled, setScrolled] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success("Support request submitted! We'll get back to you within 24 hours.");
    setFormState({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  // Content Data
  const faqCategories = [
    {
      name: "Getting Started",
      icon: Play,
      items: [
        { q: "How do I start chatting?", a: "Simply visit our homepage and click 'Start Random Chat'. No registration required for guest mode. You'll be instantly connected." },
        { q: "Is ChatPulse free?", a: "Yes! Core features are completely free. We monetize through optional premium features, not by selling your data." }
      ]
    },
    {
      name: "Safety",
      icon: Shield,
      items: [
        { q: "Is it anonymous?", a: "Absolutely. In Guest Mode, we don't ask for email or phone number. Data is auto-deleted after 24 hours." },
        { q: "How to report users?", a: "Click the flag icon in any chat. Reports are processed instantly by our automated mod system." }
      ]
    },
    {
      name: "Technical",
      icon: Settings,
      items: [
        { q: "Video not working?", a: "Ensure browser permissions are allowed for Camera/Mic. Refresh the page or try Chrome for best performance." },
        { q: "Connection issues?", a: "Check your internet. ChatPulse requires a stable connection. If servers are overloaded, you will see a status indicator." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      
      {/* --- Navigation --- */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md py-4 border-b border-neutral-800' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${scrolled ? 'bg-white' : 'bg-black'}`}>
                <Activity className={`w-5 h-5 ${scrolled ? 'text-black' : 'text-white'}`} />
              </div>
              <span className={`text-2xl font-black tracking-tighter ${scrolled ? 'text-white' : 'text-black'}`}>ChatPulse.</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={`text-sm font-bold hover:opacity-70 transition-opacity ${scrolled ? 'text-neutral-300' : 'text-black'}`}>HOME</Link>
            <Link href="/terms" className={`text-sm font-bold hover:opacity-70 transition-opacity ${scrolled ? 'text-neutral-300' : 'text-black'}`}>TERMS</Link>
            <button className={`${scrolled ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'} px-6 py-2.5 rounded-full text-sm font-bold transition-colors`}>
              LOGIN
            </button>
          </div>
          <button className={`md:hidden ${scrolled ? 'text-white' : 'text-black'}`}><Menu /></button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="relative pt-40 pb-24 bg-neutral-100 border-b border-neutral-200 overflow-hidden flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-1">
              <div className="inline-flex items-center gap-3 border-2 border-black bg-white px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Users className="w-4 h-4" />
                24/7 Assistance
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                SYSTEM<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-500 to-black">SUPPORT.</span>
              </h1>
              <p className="text-xl text-neutral-600 max-w-lg leading-relaxed font-medium">
                Encountering a glitch in the matrix? Our support protocol is online and ready to assist.
              </p>
              
              <div className="flex gap-4 pt-4">
                 <button className="h-12 px-8 bg-black text-white font-bold rounded-full hover:bg-neutral-800 transition-colors flex items-center gap-2">
                    Open Ticket <ArrowRight className="w-4 h-4" />
                 </button>
                 <button className="h-12 px-8 border-2 border-black font-bold rounded-full hover:bg-white transition-colors">
                    View FAQ
                 </button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative perspective-1000 order-2 mt-12 lg:mt-0 h-[400px]">
               <SupportConsoleMockup />
            </div>
          </div>
        </div>
      </header>

      {/* --- System Status / Stats --- */}
      <section className="py-20 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-6">
                <StatCard value="2 min" label="Avg Response" subtext="During business hours" />
                <StatCard value="99.9%" label="Uptime" subtext="Systems operational" />
                <StatCard value="24/7" label="Monitoring" subtext="Automated security" />
                <StatCard value="50+" label="Languages" subtext="Global support" />
            </div>
         </div>
      </section>

      {/* --- FAQ Section --- */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="mb-16 text-center">
             <div className="inline-flex items-center gap-3 border border-neutral-800 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
                <Book className="w-4 h-4 text-neutral-400" />
                Knowledge Base
              </div>
              <h2 className="text-5xl font-black tracking-tight">COMMON QUERIES.</h2>
           </div>

           <div className="grid gap-4">
              {faqCategories.map((category) => (
                 <React.Fragment key={category.name}>
                    {category.items.map((item, i) => (
                       <FAQItem 
                          key={i}
                          icon={category.icon}
                          category={category.name}
                          question={item.q}
                          answer={item.a}
                       />
                    ))}
                 </React.Fragment>
              ))}
           </div>
        </div>
      </section>

      {/* --- Contact Form Section --- */}
      <section className="py-32 bg-neutral-100 border-t border-neutral-800 text-black">
         <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-black tracking-tight mb-4">OPEN A TICKET.</h2>
               <p className="text-neutral-600 font-medium">Can't find the answer? Deploy a message to our team.</p>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-mono font-bold uppercase text-neutral-500">Identity Name</label>
                        <input 
                           type="text" 
                           className="w-full h-12 px-4 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:border-black focus:outline-none transition-colors font-bold"
                           placeholder="John Doe"
                           value={formState.name}
                           onChange={e => setFormState({...formState, name: e.target.value})}
                           required
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-mono font-bold uppercase text-neutral-500">Contact Email</label>
                        <input 
                           type="email" 
                           className="w-full h-12 px-4 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:border-black focus:outline-none transition-colors font-bold"
                           placeholder="you@example.com"
                           value={formState.email}
                           onChange={e => setFormState({...formState, email: e.target.value})}
                           required
                        />
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-xs font-mono font-bold uppercase text-neutral-500">Subject Protocol</label>
                     <input 
                        type="text" 
                        className="w-full h-12 px-4 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:border-black focus:outline-none transition-colors font-bold"
                        placeholder="Brief description of the issue"
                        value={formState.subject}
                        onChange={e => setFormState({...formState, subject: e.target.value})}
                        required
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-mono font-bold uppercase text-neutral-500">Message Logs</label>
                     <textarea 
                        rows={5}
                        className="w-full p-4 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:border-black focus:outline-none transition-colors font-medium resize-none"
                        placeholder="Describe the anomaly in detail..."
                        value={formState.message}
                        onChange={e => setFormState({...formState, message: e.target.value})}
                        required
                     />
                  </div>

                  <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="w-full h-14 bg-black text-white font-black text-lg uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                     {isSubmitting ? (
                        <span className="flex items-center gap-2 text-green-400">
                           <Loader2 className="w-5 h-5 animate-spin" />
                           TRANSMITTING_DATA_
                        </span>
                     ) : (
                        <>Submit Ticket <Send className="w-5 h-5" /></>
                     )}
                  </button>
               </form>
            </div>
         </div>
      </section>

      {/* --- Footer (Matching Landing Page) --- */}
      <section className="py-24 bg-black border-t border-neutral-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
           
           <div className="flex flex-col items-center justify-center gap-6 mb-16">
             <div className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-800 rounded-full">
                <Shield className="w-4 h-4 text-white" />
                <span className="text-xs font-mono text-neutral-400">SECURE CONNECTION</span>
             </div>
             <p className="text-neutral-500 max-w-lg mx-auto">
               Need immediate assistance? Email us directly at <span className="text-white font-bold">support@chatpulse.in</span>
             </p>
           </div>
           
           <div className="pt-10 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono uppercase tracking-wider text-neutral-500">
              <span>© 2025 ChatPulse Inc.</span>
              <div className="flex gap-8">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              </div>
           </div>
        </div>
      </section>
      
      {/* CSS Animations */}
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
      `}</style>

    </div>
  );
}