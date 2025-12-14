"use client"
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  MessageSquare, Heart, Zap, Shield, Users, Target, 
  Lightbulb, Mail, Globe, Activity, Menu, Rocket, 
  Star, Github, Twitter, Linkedin, Cpu, Terminal, 
  MapPin, Code, ArrowRight, CheckCircle, Briefcase,
  Fingerprint, Phone
} from 'lucide-react';

// --- VISUAL MOCKUPS ---

// 1. SYSTEM CORE MOCKUP (Keep as requested)
const SystemCoreMockup = () => {
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col border border-neutral-800 transform rotate-1 hover:rotate-0 transition-transform duration-500 relative group">
      {/* Header */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 justify-between">
        <div className="text-white text-sm font-bold tracking-wide flex items-center gap-2">
          <Cpu className="w-4 h-4 text-white" />
          SYSTEM_CORE_ORIGIN
        </div>
        <div className="flex gap-2 items-center">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] text-green-500 font-mono font-bold">ONLINE</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-black font-mono text-xs relative overflow-hidden flex flex-col justify-center">
         {/* Grid Background */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
         
         <div className="relative z-10 space-y-6">
            <div className="border border-neutral-800 bg-neutral-900/80 p-4 rounded max-w-[80%]">
                <div className="text-neutral-500 mb-1">INIT_TIMESTAMP: 2020</div>
                <div className="text-white font-bold text-sm">Executing protocol: connect_strangers.exe</div>
                <div className="text-green-400 mt-2">{'>'} Connection established.</div>
            </div>

            <div className="border border-neutral-800 bg-neutral-900/80 p-4 rounded max-w-[80%] ml-auto">
                <div className="text-neutral-500 mb-1">CURRENT_STATUS</div>
                <div className="flex justify-between gap-8">
                    <span>Active Nodes:</span>
                    <span className="text-white font-bold">10,482,911</span>
                </div>
                <div className="flex justify-between gap-8">
                    <span>Global Reach:</span>
                    <span className="text-white font-bold">150+ Regions</span>
                </div>
                <div className="w-full bg-neutral-800 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 w-full h-full animate-pulse"></div>
                </div>
            </div>
         </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: -20%; }
          100% { top: 120%; }
        }
      `}</style>
    </div>
  );
};

// 2. CREATOR ID CARD (New Technical Design)
const CreatorIDCard = () => (
  <div className="relative w-full max-w-md mx-auto group">
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-neutral-200 to-neutral-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
      
      <div className="relative bg-white border-2 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
          {/* Header */}
          <div className="h-32 bg-black relative p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-white/50 text-[10px] font-mono tracking-widest uppercase">
                      <Fingerprint className="w-3 h-3" /> ACCESS_LEVEL_00
                  </div>
                  <div className="px-2 py-1 bg-white text-black text-[10px] font-bold rounded uppercase">
                      Architect
                  </div>
              </div>
              <div className="text-white">
                  <h3 className="text-3xl font-black tracking-tighter">HARIOM SUTHAR</h3>
                  <p className="text-neutral-400 font-mono text-xs">FOUNDER & LEAD ENGINEER</p>
              </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
              <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-neutral-100 rounded-lg border-2 border-black flex items-center justify-center text-xl font-black relative overflow-hidden">
                      HS
                      {/* Scanline */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent h-[50%] animate-scan"></div>
                  </div>
                  <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-500">
                          <Briefcase className="w-3 h-3 text-green-500" /> Status
                      </div>
                      <div className="text-sm font-black bg-green-100 text-green-800 px-3 py-1 rounded-full inline-block border border-green-200">
                          OPEN FOR WORK
                      </div>
                  </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-dashed border-neutral-300">
                  <a href="mailto:hariomsuthar7143@gmail.com" className="flex items-center justify-between group/link hover:bg-neutral-50 p-2 rounded transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-bold">Email</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                  <a href="https://github.com/Heria021" target="_blank" className="flex items-center justify-between group/link hover:bg-neutral-50 p-2 rounded transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                          <Github className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-bold">GitHub</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                  <a href="https://www.linkedin.com/in/hariom-suthar-5a070a277/" target="_blank" className="flex items-center justify-between group/link hover:bg-neutral-50 p-2 rounded transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                          <Linkedin className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-bold">LinkedIn</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                  <div className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-bold text-neutral-600">701-424-7460</span>
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Footer Barcode */}
          <div className="bg-neutral-100 p-3 border-t border-neutral-200 flex justify-between items-center">
              <div className="h-6 flex gap-[2px] opacity-50">
                  {[...Array(20)].map((_,i) => (
                      <div key={i} className="w-1 bg-black" style={{height: (i % 3 === 0 || i % 2 !== 0) ? '100%' : '60%'}}></div>
                  ))}
              </div>
              <span className="text-[10px] font-mono text-neutral-400">AUTH_VALID</span>
          </div>
      </div>
  </div>
);

// 3. Brutalist Value Card
const ValueCard = ({ title, desc, icon: Icon, index }: { title: string, desc: string, icon: any, index: string }) => (
    <div className="bg-white border-2 border-black p-8 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-black text-white rounded-lg">
                <Icon className="w-6 h-6" />
            </div>
            <span className="font-mono text-xs font-bold text-neutral-400">0{index}</span>
        </div>
        <h3 className="font-black text-xl mb-3 uppercase tracking-tight">{title}</h3>
        <p className="text-neutral-600 text-sm font-medium leading-relaxed flex-grow">{desc}</p>
    </div>
);

// 4. Stat Minimal
const StatMinimal = ({ label, value }: { label: string, value: string }) => (
    <div className="text-center md:text-left">
        <div className="text-4xl font-black tracking-tighter mb-1">{value}</div>
        <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{label}</div>
    </div>
);

// --- MAIN PAGE ---

export default function AboutPage() {
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
            <Link href="/support" className={`text-sm font-bold hover:opacity-70 transition-opacity ${scrolled ? 'text-neutral-300' : 'text-black'}`}>SUPPORT</Link>
            <button className={`${scrolled ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'} px-6 py-2.5 rounded-full text-sm font-bold transition-colors`}>
              LOGIN
            </button>
          </div>
          <button className={`md:hidden ${scrolled ? 'text-white' : 'text-black'}`}><Menu /></button>
        </div>
      </nav>

      {/* --- Hero Section (KEPT AS IS) --- */}
      <header className="relative pt-40 pb-24 bg-white text-black overflow-hidden flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-1">
              <div className="inline-flex items-center gap-3 border-2 border-black bg-white px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Rocket className="w-4 h-4" />
                Connecting Since 2020
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                ABOUT<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-500 to-black">CHATPULSE.</span>
              </h1>
              <p className="text-xl text-neutral-600 max-w-lg leading-relaxed font-medium">
                The world's most trusted platform for random chat. We're revolutionizing how strangers connect, one encrypted packet at a time.
              </p>
              
              <div className="flex gap-12 pt-6">
                 <StatMinimal label="Active Users" value="10M+" />
                 <StatMinimal label="Countries" value="150+" />
                 <StatMinimal label="Uptime" value="99.9%" />
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative perspective-1000 order-2 mt-12 lg:mt-0 h-[400px]">
               <SystemCoreMockup />
            </div>
          </div>
        </div>
      </header>

      {/* --- Mission Section (REDESIGNED - Grid Style) --- */}
      <section className="py-24 bg-neutral-50 border-y border-neutral-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
               <h2 className="text-4xl font-black tracking-tight mb-6">ENGINEERING SERENDIPITY.</h2>
               <p className="text-lg text-neutral-600 font-medium leading-relaxed max-w-3xl">
                  ChatPulse wasn't built to just be another chat app. It was built to solve a specific human problem: 
                  <span className="text-black font-bold"> Loneliness in the digital age.</span> We engineer instant, safe connections.
               </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ValueCard 
                    index="1"
                    title="Zero Logs" 
                    desc="We don't store your chats. Once the tab closes, the conversation is gone forever. Privacy by design." 
                    icon={Shield} 
                />
                <ValueCard 
                    index="2"
                    title="Anti-Bot" 
                    desc="Our proprietary algorithm filters out 99% of bots and spam, ensuring you talk to real humans." 
                    icon={Users} 
                />
                <ValueCard 
                    index="3"
                    title="Global" 
                    desc="With servers in 150+ regions, we connect you to the world with low-latency speed." 
                    icon={Globe} 
                />
                <ValueCard 
                    index="4"
                    title="Open Core" 
                    desc="We believe in transparency. Core parts of our connection protocol are open source." 
                    icon={Code} 
                />
            </div>
         </div>
      </section>

      {/* --- Developer Section (REDESIGNED - Creator ID Card) --- */}
      <section className="py-32 bg-white text-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                 <div className="inline-flex items-center gap-2 border border-black px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 bg-black text-white">
                    The Architect
                 </div>
                 <h2 className="text-5xl font-black tracking-tight mb-6 leading-tight">
                    BUILT BY<br/>ONE DEV.
                 </h2>
                 <p className="text-lg text-neutral-600 font-medium leading-relaxed mb-8">
                    Hi, I'm Hariom. I built ChatPulse from the ground up because I was tired of social apps that treat users like data points. 
                 </p>
                 <p className="text-lg text-neutral-600 font-medium leading-relaxed mb-8">
                    I'm a full-stack engineer passionate about WebRTC and system design. I'm currently <strong>open to new opportunities</strong> to build impactful software.
                 </p>
                 
                 <div className="flex gap-4">
                    <a href="https://www.linkedin.com/in/hariom-suthar-5a070a277/" target="_blank" className="text-sm font-bold border-b-2 border-black pb-1 hover:text-neutral-600 transition-colors">
                        View LinkedIn Profile
                    </a>
                 </div>
              </div>

              {/* New Visual ID Card */}
              <div className="flex justify-center md:justify-end">
                 <CreatorIDCard />
              </div>
           </div>
        </div>
      </section>

      {/* --- Footer / CTA (Redesigned Links) --- */}
      <section className="py-24 bg-black border-t border-neutral-800 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
           
           <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
             READY TO JOIN<br/>THE NETWORK?
           </h2>
           
           <div className="flex flex-col sm:flex-row justify-center gap-4 mb-24">
              <Link href="/auth/signin" className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                 Start Chatting <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="https://www.linkedin.com/in/hariom-suthar-5a070a277/" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
                 Hire Me
              </a>
           </div>
           
           {/* Footer Links with Personal Branding */}
           <div className="pt-10 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-bold uppercase tracking-wider text-neutral-500">
              <span>© 2025 ChatPulse Inc.</span>
              
              <div className="flex gap-8 items-center">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                
                {/* Social Icons in Footer */}
                <div className="h-4 w-[1px] bg-neutral-700 mx-2"></div>
                
                <a href="https://github.com/Heria021" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                   <Github className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/hariom-suthar-5a070a277/" target="_blank" rel="noopener noreferrer" className="hover:text-[#0077b5] transition-colors">
                   <Linkedin className="w-5 h-5" />
                </a>
                <a href="mailto:hariomsuthar7143@gmail.com" className="hover:text-white transition-colors">
                   <Mail className="w-5 h-5" />
                </a>
              </div>
           </div>
        </div>
      </section>
      
      {/* CSS Animations */}
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        @keyframes scan {
          0% { top: -100%; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>

    </div>
  );
}