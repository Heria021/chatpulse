"use client"
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  Shield, Lock, Eye, Database, Globe, UserCheck, 
  Settings, AlertTriangle, CheckCircle2, FileText, 
  Menu, Activity, Plus, Mail, Trash2, Download, 
  Edit, Fingerprint, Server, Key,
  Ghost
} from 'lucide-react';

// --- VISUAL MOCKUPS ---

// 1. PRIVACY SHIELD MOCKUP
// Visualizes data protection as a secure vault/terminal
const PrivacyShieldMockup = () => {
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col border border-neutral-800 transform rotate-1 hover:rotate-0 transition-transform duration-500 relative group">
      {/* Header */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 justify-between">
        <div className="text-white text-sm font-bold tracking-wide flex items-center gap-2">
          <Shield className="w-4 h-4 text-white" />
          DATA_VAULT_SECURE
        </div>
        <div className="flex gap-2 items-center">
          <Lock className="w-3 h-3 text-green-500" />
          <span className="text-[10px] text-green-500 font-mono font-bold">ENCRYPTED</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-black font-mono text-xs relative overflow-hidden">
         {/* Scanline */}
         <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-[20%] animate-scan pointer-events-none"></div>
         
         <div className="space-y-4 text-neutral-400">
            <div className="flex justify-between border-b border-neutral-800 pb-2">
               <span>PROTOCOL</span>
               <span>STATUS</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="flex items-center gap-2"><Key className="w-3 h-3 text-yellow-500"/> E2E_Encryption</span>
               <span className="text-green-500">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="flex items-center gap-2"><Fingerprint className="w-3 h-3 text-blue-500"/> Anonymity_Layer</span>
               <span className="text-green-500">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="flex items-center gap-2"><Trash2 className="w-3 h-3 text-red-500"/> Auto_Delete_24h</span>
               <span className="text-green-500">SCHEDULED</span>
            </div>
            <div className="flex justify-between items-center opacity-50">
               <span className="flex items-center gap-2"><Eye className="w-3 h-3"/> Third_Party_Tracker</span>
               <span className="text-red-500">BLOCKED</span>
            </div>
            
            <div className="mt-8 p-3 bg-neutral-900 border border-neutral-800 rounded">
               <div className="text-neutral-500 mb-1">LATEST AUDIT LOG:</div>
               <div className="text-green-400">{'>'} No user data leaks detected.</div>
               <div className="text-green-400">{'>'} GDPR Compliance: 100%</div>
            </div>
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

// 2. Policy Item (Expandable Card Style)
const PolicyItem = ({ title, index, children }: { title: string, index: number, children: React.ReactNode }) => {
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

// 3. Protocol Card (Brutalist Style)
const ProtocolCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
     <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5 text-black" />
        <h4 className="font-black text-lg uppercase tracking-tight">{title}</h4>
     </div>
     <p className="text-neutral-600 text-sm font-medium leading-relaxed">{desc}</p>
  </div>
);

// --- MAIN PAGE ---

export default function PrivacyPolicy() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                <Lock className="w-4 h-4" />
                Data Protection
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                PRIVACY<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-500 to-black">POLICY.</span>
              </h1>
              <p className="text-xl text-neutral-600 max-w-lg leading-relaxed font-medium">
                We believe in privacy by design. We minimize data collection to maximize your safety.
                <span className="block mt-2 text-xs font-mono text-neutral-400 uppercase">Last Updated: December 2024</span>
              </p>
            </div>

            {/* Hero Visual */}
            <div className="relative perspective-1000 order-2 mt-12 lg:mt-0 h-[400px]">
               <PrivacyShieldMockup />
            </div>
          </div>
        </div>
      </header>

      {/* --- Privacy Protocols --- */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
               <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Security Protocols</span>
               </div>
               <h2 className="text-4xl font-black tracking-tight">PRIVACY AT A GLANCE.</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
               <ProtocolCard 
                  icon={Ghost}
                  title="Anonymous Mode"
                  desc="Chat without providing personal information. We don't require names or numbers for basic use."
               />
               <ProtocolCard 
                  icon={Server}
                  title="Zero Storage"
                  desc="Messages are ephemeral. We do not permanently store chat content on our servers."
               />
               <ProtocolCard 
                  icon={Globe}
                  title="GDPR Compliant"
                  desc="We fully comply with major global privacy regulations including GDPR and CCPA."
               />
               <ProtocolCard 
                  icon={Key}
                  title="E2E Encryption"
                  desc="Your conversations are encrypted in transit. Only you and your partner see the messages."
               />
               <ProtocolCard 
                  icon={Trash2}
                  title="Data Control"
                  desc="Request full deletion of your account data at any time with a simple click."
               />
               <ProtocolCard 
                  icon={Shield}
                  title="No Data Sales"
                  desc="We never sell your personal information to third parties or data brokers."
               />
            </div>
         </div>
      </section>

      {/* --- Data Collection Analysis --- */}
      <section className="py-24 bg-neutral-100 border-y border-neutral-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
               <h2 className="text-3xl font-black tracking-tight mb-4">DATA FLOW ANALYSIS.</h2>
               <p className="text-neutral-600">Transparent breakdown of what we actually collect.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <div className="text-center p-6">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="font-bold text-lg mb-2">Account Info</h3>
                  <p className="text-sm text-neutral-600">Optional email & username if you choose to register.</p>
               </div>
               <div className="text-center p-6 border-x border-neutral-200">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="font-bold text-lg mb-2">Usage Metrics</h3>
                  <p className="text-sm text-neutral-600">Anonymous analytics to improve system performance.</p>
               </div>
               <div className="text-center p-6">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="font-bold text-lg mb-2">Technical Logs</h3>
                  <p className="text-sm text-neutral-600">IP & Device info for security and fraud prevention.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- Detailed Policy Section --- */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="mb-16 text-center">
             <div className="inline-flex items-center gap-3 border border-neutral-800 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
                <FileText className="w-4 h-4 text-neutral-400" />
                Full Documentation
              </div>
              <h2 className="text-5xl font-black tracking-tight">DETAILED POLICY.</h2>
           </div>

           <div className="grid gap-4">
              <PolicyItem title="Information Collection & Use" index={0}>
                 <p className="mb-4">We collect information to provide better services to all our users. The types of information we collect include:</p>
                 <div className="space-y-4">
                    <div className="bg-neutral-900 p-4 rounded-lg">
                       <h4 className="font-bold text-white mb-2">Information You Provide</h4>
                       <ul className="list-disc list-inside text-sm text-neutral-400">
                          <li>Account registration details (optional)</li>
                          <li>Profile preferences</li>
                          <li>Support communications</li>
                       </ul>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-lg">
                       <h4 className="font-bold text-white mb-2">Auto-Collected Info</h4>
                       <ul className="list-disc list-inside text-sm text-neutral-400">
                          <li>Device & Browser type</li>
                          <li>IP Address (for security)</li>
                          <li>Usage patterns</li>
                       </ul>
                    </div>
                 </div>
              </PolicyItem>

              <PolicyItem title="How We Use Your Info" index={1}>
                 <p className="mb-4">We use collected data strictly for:</p>
                 <ul className="list-disc list-inside text-neutral-400 space-y-2">
                    <li><strong className="text-white">Service Provision:</strong> Maintaining ChatPulse functionality.</li>
                    <li><strong className="text-white">Safety:</strong> detecting abuse, fraud, and spam.</li>
                    <li><strong className="text-white">Communication:</strong> Sending critical updates (no marketing spam).</li>
                    <li><strong className="text-white">Legal:</strong> Complying with applicable laws.</li>
                 </ul>
                 <div className="mt-4 p-4 border-l-4 border-green-500 bg-green-900/10">
                    <p className="text-green-400 font-mono text-xs font-bold">IMPORTANT: We do not read or analyze your private conversation content.</p>
                 </div>
              </PolicyItem>

              <PolicyItem title="Your Privacy Rights" index={2}>
                 <p className="mb-4">You have full control over your data:</p>
                 <div className="grid gap-3">
                    <div className="flex gap-3 items-center text-sm text-neutral-300">
                       <Download className="w-4 h-4 text-blue-500" /> 
                       <strong>Access:</strong> Request a portable copy of your data.
                    </div>
                    <div className="flex gap-3 items-center text-sm text-neutral-300">
                       <Edit className="w-4 h-4 text-green-500" /> 
                       <strong>Correction:</strong> Update inaccurate info.
                    </div>
                    <div className="flex gap-3 items-center text-sm text-neutral-300">
                       <Trash2 className="w-4 h-4 text-red-500" /> 
                       <strong>Deletion:</strong> Request permanent removal ("Right to be Forgotten").
                    </div>
                 </div>
              </PolicyItem>

              <PolicyItem title="Contact Information" index={3}>
                 <p className="mb-4">
                   Questions about this policy? Reach our Data Protection Officer:
                 </p>
                 <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg border border-neutral-800 w-full">
                       <Mail className="w-5 h-5 text-white" />
                       <span className="font-mono text-sm text-neutral-300">privacy@chatpulse.in</span>
                    </div>
                 </div>
              </PolicyItem>
           </div>
        </div>
      </section>

      {/* --- Footer (Matching Landing Page) --- */}
      <section className="py-24 bg-black border-t border-neutral-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
           
           <div className="flex flex-col items-center justify-center gap-6 mb-16">
             <div className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-800 rounded-full">
                <Shield className="w-4 h-4 text-white" />
                <span className="text-xs font-mono text-neutral-400">DATA ENCRYPTION ACTIVE</span>
             </div>
             <p className="text-neutral-500 max-w-lg mx-auto">
               Your trust is our currency. We protect it with enterprise-grade security.
             </p>
           </div>
           
           <div className="pt-10 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono uppercase tracking-wider text-neutral-500">
              <span>© 2025 ChatPulse Inc.</span>
              <div className="flex gap-8">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
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