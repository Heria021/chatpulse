"use client"
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  Scale, Shield, AlertTriangle, CheckCircle2, FileText, 
  Menu, ArrowRight, Activity, Plus, ChevronDown, 
  Lock, Gavel, Ban, Globe, Mail, ScrollText, Check, Ghost
} from 'lucide-react';

// --- VISUAL MOCKUPS ---

// 1. LEGAL CONSOLE MOCKUP
// Visualizes the Terms as a secure, digital contract/protocol
const LegalConsoleMockup = () => {
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col border border-neutral-800 transform rotate-1 hover:rotate-0 transition-transform duration-500 relative group">
      {/* Header */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 justify-between">
        <div className="text-white text-sm font-bold tracking-wide flex items-center gap-2">
          <Scale className="w-4 h-4 text-white" />
          LEGAL_PROTOCOL_V2
        </div>
        <div className="flex gap-2 items-center">
          <div className="px-2 py-1 bg-green-500/20 border border-green-500 rounded text-[10px] text-green-500 font-mono font-bold">
            ACTIVE
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 space-y-4 bg-black font-mono text-xs text-neutral-400 relative">
         {/* Scanline effect */}
         <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-[20%] animate-scan pointer-events-none"></div>
         
         <div className="flex gap-4 border-b border-neutral-800 pb-4">
            <span className="text-neutral-600">001</span>
            <span><span className="text-purple-400">const</span> UserAgreement = <span className="text-yellow-400">require</span>(<span className="text-green-400">'./terms'</span>);</span>
         </div>
         <div className="flex gap-4">
            <span className="text-neutral-600">002</span>
            <span><span className="text-blue-400">class</span> <span className="text-yellow-400">User</span> <span className="text-purple-400">extends</span> Entity {'{'}</span>
         </div>
         <div className="flex gap-4">
            <span className="text-neutral-600">003</span>
            <span className="pl-4">constructor(age, consent) {'{'}</span>
         </div>
         <div className="flex gap-4">
            <span className="text-neutral-600">004</span>
            <span className="pl-8"><span className="text-purple-400">if</span> (age {'<'} 13) <span className="text-red-500">throw</span> <span className="text-purple-400">new</span> Error(<span className="text-green-400">"Underage"</span>);</span>
         </div>
         <div className="flex gap-4">
            <span className="text-neutral-600">005</span>
            <span className="pl-8"><span className="text-purple-400">if</span> (!consent) <span className="text-red-500">throw</span> <span className="text-purple-400">new</span> Error(<span className="text-green-400">"NoConsent"</span>);</span>
         </div>
         <div className="flex gap-4">
            <span className="text-neutral-600">006</span>
            <span className="pl-8"><span className="text-blue-400">this</span>.status = <span className="text-green-400">"Authorized"</span>;</span>
         </div>
         <div className="flex gap-4">
            <span className="text-neutral-600">007</span>
            <span className="pl-4">{'}'}</span>
         </div>
         <div className="flex gap-4">
            <span className="text-neutral-600">008</span>
            <span className="pl-4">chat() {'{'}</span>
         </div>
         <div className="flex gap-4">
            <span className="text-neutral-600">009</span>
            <span className="pl-8"><span className="text-purple-400">return</span> <span className="text-yellow-400">Encryption</span>.init();</span>
         </div>
         <div className="flex gap-4">
            <span className="text-neutral-600">010</span>
            <span className="pl-4">{'}'}</span>
         </div>
         <div className="flex gap-4">
            <span className="text-neutral-600">011</span>
            <span>{'}'}</span>
         </div>
      </div>

      {/* Footer Status */}
      <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-[10px] text-white font-bold tracking-widest">ENFORCED</span>
         </div>
         <div className="text-[10px] text-neutral-500 font-mono">ID: 994-LEGAL</div>
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

// 2. Term Item (Expandable Card Style)
const TermItem = ({ title, index, children }: { title: string, index: number, children: React.ReactNode }) => {
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
            <span className="text-neutral-500 font-mono text-sm pt-1 opacity-50">0{index + 1}</span>
            <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                {title}
            </span>
        </div>
        <div className={`flex-shrink-0 p-1 rounded-full border border-neutral-700 transition-all duration-300 ${isOpen ? 'bg-white text-black rotate-45 border-white' : 'text-neutral-400 group-hover:border-neutral-500'}`}>
             <Plus className="w-4 h-4" />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-8 pl-14 text-neutral-400 leading-relaxed text-sm md:text-base border-t border-neutral-800/50 pt-4 mt-2">
            {children}
        </div>
      </div>
    </div>
  );
};

// 3. Quick Summary Card (Redesigned for Brutalist Look)
const SummaryCard = ({ icon: Icon, title, desc, index }: { icon: any, title: string, desc: string, index: string }) => (
  <div className="bg-white border-2 border-black p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-200 flex flex-col h-full group">
     <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center group-hover:bg-neutral-800 transition-colors">
            <Icon className="w-6 h-6" />
        </div>
        <span className="font-mono text-xs font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded">0{index}</span>
     </div>
     <h4 className="font-black text-xl mb-3 uppercase tracking-tight">{title}</h4>
     <p className="text-neutral-600 text-sm font-medium leading-relaxed flex-grow">{desc}</p>
  </div>
);

// --- MAIN PAGE ---

const TermsOfService = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      
      {/* --- Navigation (Matching Landing Page) --- */}
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
            <Link href="/privacy" className={`text-sm font-bold hover:opacity-70 transition-opacity ${scrolled ? 'text-neutral-300' : 'text-black'}`}>PRIVACY</Link>
            <button className={`${scrolled ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'} px-6 py-2.5 rounded-full text-sm font-bold transition-colors`}>
              LOGIN
            </button>
          </div>
          <button className={`md:hidden ${scrolled ? 'text-white' : 'text-black'}`}><Menu /></button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="relative pt-40 pb-24 bg-white text-black overflow-hidden flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-1">
              <div className="inline-flex items-center gap-3 border-2 border-black bg-white px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Gavel className="w-4 h-4" />
                Legal Agreement
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                TERMS OF<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-500 to-black">SERVICE.</span>
              </h1>
              <p className="text-xl text-neutral-600 max-w-lg leading-relaxed font-medium">
                The rules of engagement. Please read these terms carefully before using ChatPulse.
                <span className="block mt-2 text-xs font-mono text-neutral-400 uppercase">Last Updated: December 2024</span>
              </p>
            </div>

            {/* Hero Visual */}
            <div className="relative perspective-1000 order-2 mt-12 lg:mt-0 h-[400px]">
               <LegalConsoleMockup />
            </div>
          </div>
        </div>
      </header>

      {/* --- Quick Summary / Protocol --- */}
      <section className="py-24 bg-neutral-100 border-y border-neutral-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
               <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">TL;DR Protocol</span>
               </div>
               <h2 className="text-4xl font-black tracking-tight">QUICK SUMMARY.</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
               <SummaryCard 
                  index="1"
                  icon={Ghost}
                  title="Anonymous & Free"
                  desc="No personal info required. Basic random chat features are completely free to use."
               />
               <SummaryCard 
                  index="2"
                  icon={Shield}
                  title="13+ Restriction"
                  desc="You must be at least 13 years old. Parental consent is strictly required for users under 18."
               />
               <SummaryCard 
                  index="3"
                  icon={Ban}
                  title="Zero Tolerance"
                  desc="Harassment, hate speech, and illegal activities result in an immediate, permanent ban."
               />
            </div>
         </div>
      </section>

      {/* --- Detailed Terms List --- */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="mb-16 text-center">
             <div className="inline-flex items-center gap-3 border border-neutral-800 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
                <ScrollText className="w-4 h-4 text-neutral-400" />
                Full Legal Text
              </div>
              <h2 className="text-5xl font-black tracking-tight">THE DETAILS.</h2>
           </div>

           <div className="grid gap-4">
              <TermItem title="Acceptance of Terms" index={0}>
                 <p className="mb-4">
                   By accessing or using ChatPulse ("the Service"), you agree to be bound by these Terms of Service
                   and all applicable laws and regulations. If you do not agree with any of these terms,
                   you are prohibited from using or accessing this site.
                 </p>
                 <p>
                   These terms apply to all users of the Service, including without limitation users who are
                   browsers, vendors, customers, merchants, and/or contributors of content.
                 </p>
              </TermItem>

              <TermItem title="Service Description" index={1}>
                 <p className="mb-4">
                   ChatPulse is a random chat platform that connects users with strangers from around the world
                   for text and video conversations. Our service includes:
                 </p>
                 <ul className="list-disc list-inside space-y-2 ml-4 mb-4 text-neutral-300 font-mono text-sm">
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
              </TermItem>

              <TermItem title="User Eligibility" index={2}>
                 <p className="mb-4">To use ChatPulse, you must:</p>
                 <ul className="list-disc list-inside space-y-2 ml-4 text-neutral-300 font-mono text-sm">
                   <li>Be at least 13 years old</li>
                   <li>Have parental consent if you are under 18</li>
                   <li>Provide accurate information when required</li>
                   <li>Not be prohibited from using the service under applicable law</li>
                   <li>Not have been previously banned from the platform</li>
                 </ul>
                 <p className="mt-4">
                   We reserve the right to verify your eligibility and may request additional information
                   or documentation to confirm your identity or age.
                 </p>
              </TermItem>

              <TermItem title="User Conduct & Prohibited Acts" index={3}>
                 <p className="mb-4">When using ChatPulse, strict adherence to our community guidelines is required. You agree NOT to:</p>
                 
                 <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-neutral-900 p-4 rounded-lg border border-red-900/30">
                       <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2"><Ban className="w-4 h-4"/> Prohibited Content</h4>
                       <ul className="space-y-2 text-sm text-neutral-400">
                          <li>• Explicit or sexual content</li>
                          <li>• Violent or threatening material</li>
                          <li>• Harassment or bullying</li>
                          <li>• Hate speech or discrimination</li>
                          <li>• Spam or promotional links</li>
                       </ul>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-lg border border-red-900/30">
                       <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Prohibited Actions</h4>
                       <ul className="space-y-2 text-sm text-neutral-400">
                          <li>• Impersonating others</li>
                          <li>• Doxing (sharing personal info)</li>
                          <li>• Hacking or disrupting service</li>
                          <li>• Using automated bots</li>
                          <li>• Illegal activities</li>
                       </ul>
                    </div>
                 </div>
                 <p className="mt-6 text-red-400 font-bold">
                   Violation of these rules may result in immediate suspension or termination of your account.
                 </p>
              </TermItem>

              <TermItem title="Privacy & Data Protection" index={4}>
                 <p className="mb-4">
                   Your privacy is important to us. By using ChatPulse, you agree to the collection
                   and use of information in accordance with our Privacy Policy.
                 </p>
                 <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
                    <h4 className="font-bold text-white mb-4">Key Privacy Points:</h4>
                    <ul className="grid gap-3">
                       <li className="flex items-center gap-3 text-sm text-neutral-300">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> We do not store chat messages permanently
                       </li>
                       <li className="flex items-center gap-3 text-sm text-neutral-300">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> Anonymous chat options available
                       </li>
                       <li className="flex items-center gap-3 text-sm text-neutral-300">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> No personal info required for basic use
                       </li>
                       <li className="flex items-center gap-3 text-sm text-neutral-300">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> GDPR and CCPA compliant
                       </li>
                    </ul>
                 </div>
              </TermItem>

              <TermItem title="Account Termination" index={5}>
                 <p>
                   We may terminate or suspend your account and access to the Service immediately,
                   without prior notice or liability, for any reason whatsoever, including without
                   limitation if you breach the Terms.
                 </p>
                 <p className="mt-4">
                   Upon termination, your right to use the Service will cease immediately.
                   If you wish to terminate your account, you may simply discontinue using the Service.
                 </p>
              </TermItem>

              <TermItem title="Contact Information" index={6}>
                 <p className="mb-4">
                   If you have any questions about these Terms of Service, please contact us:
                 </p>
                 <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg border border-neutral-800 w-full">
                       <Mail className="w-5 h-5 text-white" />
                       <span className="font-mono text-sm text-neutral-300">legal@chatpulse.in</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg border border-neutral-800 w-full">
                       <Globe className="w-5 h-5 text-white" />
                       <span className="font-mono text-sm text-neutral-300">chatpulse.in/support</span>
                    </div>
                 </div>
              </TermItem>
           </div>
        </div>
      </section>

      {/* --- Footer (Matching Landing Page) --- */}
      <section className="py-24 bg-black border-t border-neutral-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
           
           <div className="flex flex-col items-center justify-center gap-6 mb-16">
             <div className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-800 rounded-full">
                <Shield className="w-4 h-4 text-white" />
                <span className="text-xs font-mono text-neutral-400">LEGAL COMPLIANCE VERIFIED</span>
             </div>
             <p className="text-neutral-500 max-w-lg mx-auto">
               These terms are effective as of December 2024 and will remain in effect except with respect to any changes in their provisions in the future.
             </p>
           </div>
           
           <div className="pt-10 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono uppercase tracking-wider text-neutral-500">
              <span>© 2025 ChatPulse Inc.</span>
              <div className="flex gap-8">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/support" className="hover:text-white transition-colors">Support</Link>
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

export default TermsOfService;