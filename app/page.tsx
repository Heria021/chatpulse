"use client"
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Users, Shield, Zap, Menu, ArrowRight, 
  MapPin, Clock, Lock, Activity, Globe, Ghost, FileUp, CheckCircle2,
  HelpCircle, ChevronDown, FileText, Smartphone, Plus, AlertTriangle,
  Crown, UserCheck, User
} from 'lucide-react';
import Link from 'next/link';

// --- VISUAL MOCKUPS (Updated to reflect Product Analysis) ---

// 1. DISCOVERY MOCKUP: Visualizes the "Hybrid Smart Discovery" Algorithm with LIVE SIMULATION
const DiscoveryMockup = () => {
  // Simulation State
  const [users, setUsers] = useState([
    { id: 1, name: "Sarah_Design", status: "ACTIVE NOW", isOnline: true, type: "local", location: "Local (CA)" },
    { id: 2, name: "Mike_Dev", status: "Active 2m ago", isOnline: false, type: "national", location: "National (USA)" },
    { id: 3, name: "Global_User_99", status: "Active 12m ago", isOnline: false, type: "global", location: "Global" }
  ]);

  useEffect(() => {
    // Simulate real-time activity updates
    const interval = setInterval(() => {
      setUsers(currentUsers => {
        return currentUsers.map(user => {
          // Randomly toggle Mike_Dev's status
          if (user.id === 2 && Math.random() > 0.7) {
            const newOnline = !user.isOnline;
            return {
              ...user,
              isOnline: newOnline,
              status: newOnline ? "ACTIVE NOW" : "Active 1m ago"
            };
          }
          return user;
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col border border-neutral-800 transform rotate-1 hover:rotate-0 transition-transform duration-500">
      {/* Header */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 justify-between">
        <div className="text-white text-sm font-bold tracking-wide flex items-center gap-2">
          <MapPin className="w-4 h-4 text-white" />
          SMART_DISCOVERY
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] text-neutral-500 font-mono">LIVE FEED</span>
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 p-2 space-y-2 bg-black">
        {users.map((user) => (
          <div 
            key={user.id}
            className={`p-3 rounded-lg border transition-all duration-500 ${
              user.type === 'local' ? 'bg-neutral-900/50 border-neutral-800' : 
              user.type === 'national' ? 'bg-neutral-900/30 border-neutral-800/50' : 
              'bg-black border-neutral-900 opacity-50'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                Priority {user.id}: {user.location}
              </span>
              {user.type === 'local' && (
                <span className="text-[10px] bg-white text-black px-1 rounded font-bold">NEARBY</span>
              )}
            </div>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border transition-colors duration-300 ${user.isOnline ? 'bg-neutral-700 border-green-500' : 'bg-neutral-800 border-transparent'}`}></div>
                <div>
                    <div className={`text-sm font-bold transition-colors ${user.isOnline ? 'text-white' : 'text-neutral-500'}`}>{user.name}</div>
                    <div className={`text-[10px] font-mono transition-colors ${user.isOnline ? 'text-green-500' : 'text-neutral-600'}`}>
                      {user.status}
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. PRIVATE CHAT MOCKUP
const PrivateChatMockup = () => (
  <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col border border-neutral-200 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
    <div className="h-14 bg-white border-b border-neutral-200 flex items-center px-4 justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-black"></div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div>
          <div className="text-black text-sm font-bold tracking-wide">Alex_Pro</div>
          <div className="text-neutral-500 text-[10px] font-mono font-bold tracking-wider animate-pulse">TYPING...</div>
        </div>
      </div>
      <div className="flex gap-1">
         <div className="w-1 h-1 rounded-full bg-neutral-300"></div>
         <div className="w-1 h-1 rounded-full bg-neutral-300"></div>
         <div className="w-1 h-1 rounded-full bg-neutral-300"></div>
      </div>
    </div>
    
    <div className="flex-1 p-4 space-y-6 bg-neutral-50 relative">
       <div className="flex gap-3">
        <div className="w-6 h-6 rounded-full bg-black flex-shrink-0 mt-auto"></div>
        <div className="space-y-1">
          <div className="bg-white border border-neutral-200 text-black px-4 py-3 rounded-2xl rounded-bl-none text-sm shadow-sm">
            Got the high-res assets?
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 flex-row-reverse">
        <div className="w-6 h-6 rounded-full bg-neutral-300 flex-shrink-0 mt-auto"></div>
        <div className="space-y-1 items-end flex flex-col">
          <div className="bg-black text-white px-4 py-3 rounded-2xl rounded-br-none text-sm font-medium shadow-lg flex items-center gap-3">
             <div className="bg-neutral-800 p-2 rounded-lg">
                <FileText className="w-4 h-4 text-white" />
             </div>
             <div>
                <div className="font-bold text-xs">Project_Alpha_Final.raw</div>
                <div className="text-[10px] text-neutral-400">48.2 MB</div>
             </div>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
             READ 10:45 AM <CheckCircle2 className="w-3 h-3 text-black" />
          </span>
        </div>
      </div>
    </div>
  </div>
);

// 3. GUEST PASS (Retained & Refined text)
const GuestModeIllustration = () => (
  <div className="w-full h-full bg-neutral-100 rounded-3xl overflow-hidden relative border border-black flex items-center justify-center group shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-200 to-transparent opacity-40"></div>
      
      {/* The Pass Card */}
      <div className="relative w-[300px] h-[480px] bg-[#0a0a0a] text-white rounded-2xl shadow-2xl border border-neutral-800 flex flex-col overflow-hidden transform transition-all duration-700 hover:scale-[1.02]">
          {/* Noise Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E")' }}></div>

          <div className="mt-12 px-8 text-center relative z-10">
             <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <div className="text-[10px] font-mono font-bold tracking-[0.3em] text-neutral-400">AUTO-DELETION</div>
             </div>
             <h3 className="text-4xl font-black tracking-tighter text-white">GUEST<br/>MODE</h3>
          </div>

          <div className="flex-1 p-8 flex flex-col gap-6 relative z-10">
             <div className="flex gap-4 p-4 bg-neutral-900/80 border border-neutral-800 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                   <Ghost className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col justify-center">
                   <div className="text-[9px] text-neutral-500 font-mono mb-1">EMAIL REQUIRED?</div>
                   <div className="text-xl font-mono font-bold tracking-widest text-white">NO</div>
                </div>
             </div>

             <div className="space-y-3 mt-auto border-t border-neutral-800 pt-4">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-neutral-500 font-mono">TTL (TIME TO LIVE)</span>
                   <span className="font-bold text-red-500">24 HOURS</span>
                </div>
                <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-[80%]"></div>
                </div>
                <p className="text-[9px] text-neutral-500 text-center pt-2">
                    System automatically purges user data, sessions, and messages upon expiration.
                </p>
             </div>
          </div>
      </div>
  </div>
);

// 4. ONE GROUP RULE MOCKUP (Updated with Role Badges)
const OneGroupMockup = () => (
    <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col border border-neutral-200 transform -rotate-1 hover:rotate-0 transition-transform duration-500 relative group">
        
        {/* Floating Roles - Positioned absolutely within the container */}
        <div className="absolute top-8 left-8 z-30 animate-bounce-slow">
           <div className="bg-black text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg border-2 border-white transform -rotate-6">
              <Crown className="w-3 h-3 text-yellow-400" /> OWNER
           </div>
        </div>
        <div className="absolute top-12 right-12 z-30 animate-bounce-delayed">
           <div className="bg-neutral-800 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg border-2 border-white transform rotate-3">
              <Shield className="w-3 h-3 text-blue-400" /> ADMIN
           </div>
        </div>
        <div className="absolute bottom-20 left-12 z-30 animate-bounce-slow">
           <div className="bg-neutral-700 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg border-2 border-white transform -rotate-3">
              <UserCheck className="w-3 h-3 text-green-400" /> MOD
           </div>
        </div>
        <div className="absolute bottom-10 right-10 z-30 animate-bounce-delayed">
           <div className="bg-neutral-200 text-black px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg border-2 border-white transform rotate-6">
              <Users className="w-3 h-3 text-neutral-600" /> MEMBER
           </div>
        </div>

        {/* Central Badge */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-black text-white px-6 py-3 rounded-full font-black text-xl border-4 border-white shadow-xl transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
                QUALITY {'>'} QUANTITY
            </div>
        </div>
        
        <div className="h-14 bg-neutral-50 border-b border-neutral-200 flex items-center px-4 justify-between blur-[1px]">
             <div className="w-20 h-4 bg-neutral-200 rounded"></div>
             <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
        </div>
        <div className="p-4 space-y-4 blur-[1px] opacity-50">
            <div className="h-20 bg-neutral-100 rounded-xl"></div>
            <div className="h-20 bg-neutral-100 rounded-xl"></div>
            <div className="h-20 bg-neutral-100 rounded-xl"></div>
        </div>
    </div>
);

// 5. FOUNDER STORY COMPONENT
const FounderStory = () => (
  <section className="py-32 bg-white text-black border-t border-neutral-200">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-7">
          <div className="inline-flex items-center gap-2 border border-black px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 bg-black text-white">
            From the desk of
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-none">
            WHY I BUILT<br />CHATPULSE.
          </h2>
          <div className="text-lg text-neutral-700 font-medium leading-relaxed space-y-6">
            <p>
              I was tired. Tired of social apps that treat users like data points to be harvested. Tired of "global" chats that are just digital ghost towns. Tired of joining groups only to find them abandoned and full of spam bots.
            </p>
            <p>
              I built ChatPulse to solve the problem of <strong>connection quality</strong>.
            </p>
            <p>
              I wanted to build something raw. Something that respects the ephemeral nature of real conversation. That's why I coded the <span className="font-bold text-black bg-neutral-200 px-1">24-hour auto-delete</span> hard into the database logic. That's why I wrote the <span className="font-bold text-black bg-neutral-200 px-1">One Group Rule</span> to force quality over quantity.
            </p>
            <p>
              ChatPulse isn't about collecting friends or likes. It's about connecting with the living.
            </p>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white font-black text-xl border-4 border-neutral-100 shadow-lg">
               HS
            </div>
            <div>
              <div className="font-bold text-xl text-black">Hariom Suthar</div>
              <div className="text-xs text-neutral-500 font-mono uppercase tracking-widest font-bold">Founder & Lead Engineer</div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-5 md:pt-24">
           {/* Replaced Quote Card with Code Snippet Visual */}
           <div className="bg-black p-6 rounded-xl border border-neutral-800 rotate-2 shadow-2xl relative overflow-hidden group hover:rotate-0 transition-transform duration-500 font-mono text-sm">
              {/* Window Controls */}
              <div className="flex gap-2 mb-4 border-b border-neutral-800 pb-4">
                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              
              {/* Code Content */}
              <div className="space-y-1 text-neutral-400">
                 <div className="flex gap-4"><span className="text-neutral-600 select-none">01</span> <span><span className="text-purple-400">const</span> Hariom = <span className="text-purple-400">new</span> <span className="text-yellow-400">Founder</span>({'{'}</span></div>
                 <div className="flex gap-4"><span className="text-neutral-600 select-none">02</span> <span className="pl-4">traits: [<span className="text-green-400">'Creative'</span>, <span className="text-green-400">'Humorous'</span>],</span></div>
                 <div className="flex gap-4"><span className="text-neutral-600 select-none">03</span> <span className="pl-4">passion: <span className="text-green-400">'Human_Psychology'</span>,</span></div>
                 <div className="flex gap-4"><span className="text-neutral-600 select-none">04</span> <span className="pl-4">caffeineLevel: <span className="text-red-400">Infinity</span></span></div>
                 <div className="flex gap-4"><span className="text-neutral-600 select-none">05</span> <span>{'}'});</span></div>
                 <div className="flex gap-4"><span className="text-neutral-600 select-none">06</span> <span></span></div>
                 <div className="flex gap-4"><span className="text-neutral-600 select-none">07</span> <span><span className="text-blue-400">Hariom</span>.build(<span className="text-green-400">'ChatPulse'</span>, () ={'>'} {'{'}</span></div>
                 <div className="flex gap-4"><span className="text-neutral-600 select-none">08</span> <span className="pl-4"><span className="text-neutral-500">// Fixes loneliness, not just bugs.</span></span></div>
                 <div className="flex gap-4"><span className="text-neutral-600 select-none">09</span> <span className="pl-4"><span className="text-purple-400">return</span> <span className="text-yellow-400">RealConnections</span>;</span></div>
                 <div className="flex gap-4"><span className="text-neutral-600 select-none">10</span> <span>{'}'});</span></div>
              </div>

              <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none">
                 <AlertTriangle className="w-24 h-24 text-yellow-500" />
              </div>
           </div>
        </div>
      </div>
    </div>
  </section>
);

// 6. FAQ Component (Enhanced Card Style)
const FAQItem = ({ question, answer, index }: { question: string, answer: string, index: number }) => {
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
            <span className="text-neutral-500 font-mono text-sm pt-1">0{index + 1}</span>
            <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                {question}
            </span>
        </div>
        <div className={`flex-shrink-0 p-1 rounded-full border border-neutral-700 transition-all duration-300 ${isOpen ? 'bg-white text-black rotate-45 border-white' : 'text-neutral-400 group-hover:border-neutral-500'}`}>
             <Plus className="w-4 h-4" />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-6 pb-6 pl-14 text-neutral-400 leading-relaxed text-sm md:text-base border-t border-neutral-800/50 pt-4 mt-2">
            {answer}
        </p>
      </div>
    </div>
  );
};


const ChatPulseLanding = () => {
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
            <div className={`p-2 rounded-lg ${scrolled ? 'bg-white' : 'bg-black'}`}>
              <Activity className={`w-5 h-5 ${scrolled ? 'text-black' : 'text-white'}`} />
            </div>
            <span className={`text-2xl font-black tracking-tighter ${scrolled ? 'text-white' : 'text-black'}`}>ChatPulse.</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {/* Added Links */}
            <Link href="/about" className={`text-sm font-bold hover:opacity-70 transition-opacity ${scrolled ? 'text-neutral-300' : 'text-black'}`}>ABOUT</Link>
            <Link href="/blog" className={`text-sm font-bold hover:opacity-70 transition-opacity ${scrolled ? 'text-neutral-300' : 'text-black'}`}>BLOG</Link>
            <Link href="/terms" className={`text-sm font-bold hover:opacity-70 transition-opacity ${scrolled ? 'text-neutral-300' : 'text-black'}`}>TERMS</Link>
            <Link href="/support" className={`text-sm font-bold hover:opacity-70 transition-opacity ${scrolled ? 'text-neutral-300' : 'text-black'}`}>SUPPORT</Link>
            
            <button className={`${scrolled ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'} px-6 py-2.5 rounded-full text-sm font-bold transition-colors`}>
              <Link href="/auth/signin">Sign In</Link>
            </button>
          </div>
          <button className={`md:hidden ${scrolled ? 'text-white' : 'text-black'}`}><Menu /></button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="relative pt-32 pb-24 bg-white text-black overflow-hidden min-h-[90vh] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-1">
              <div className="inline-flex items-center gap-3 border-2 border-black bg-white px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                No Ghost Users Allowed
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                CONNECT WITH<br />
                THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-500 to-black">LIVING.</span>
              </h1>
              <p className="text-xl text-neutral-600 max-w-lg leading-relaxed font-medium">
                The only platform that filters out ghost users. 
                <span className="font-bold text-black"> 24-hour guest access.</span> Zero spam.
                See "Active in your State" before "Active Globally."
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="h-14 px-10 rounded-full bg-black text-white font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(200,200,200,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                  <Link href="/auth/guest">Start Chatting Now</Link> <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center px-6 h-14 text-sm font-bold text-neutral-500">
                    NO EMAIL REQUIRED
                </div>
              </div>
            </div>

            {/* Hero Visual: Smart Discovery Focus - UPDATED FOR MOBILE */}
            <div className="relative perspective-1000 order-2 mt-12 lg:mt-0">
              <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-neutral-100 rounded-full blur-3xl opacity-60"></div>
              <div className="relative transform md:rotate-y-[-8deg] md:rotate-x-[5deg] hover:rotate-y-[0deg] hover:rotate-x-[0deg] transition-transform duration-700 ease-out h-[400px] w-full">
                 <DiscoveryMockup />
                 
                 {/* Floating Feature Tags */}
                 <div className="hidden md:block absolute -left-10 top-1/2 bg-white border-2 border-black px-4 py-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-xs uppercase animate-bounce-slow">
                    State Level Matching
                 </div>
                 <div className="hidden md:block absolute -right-5 bottom-20 bg-white border-2 border-black px-4 py-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-xs uppercase animate-bounce-delayed">
                    Real-Time Status
                 </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Feature 1: Smart Discovery (The USP) --- */}
      <section id="discovery" className="py-32 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
             
             {/* Left Text */}
             <div className="order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-white text-black rounded-lg">
                      <MapPin className="w-6 h-6" />
                   </div>
                   <span className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-500">The Algorithm</span>
                </div>
                
                <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
                   STOP CHATTING<br/>WITH GHOSTS.
                </h2>
                <p className="text-xl text-neutral-400 mb-8 leading-relaxed font-medium">
                   Random matching sucks. Our Hybrid Discovery Algorithm prioritizes proximity and activity.
                </p>
                
                <div className="grid gap-6">
                   <div className="flex gap-4">
                      <div className="mt-1"><Globe className="w-6 h-6 text-neutral-500"/></div>
                      <div>
                         <h3 className="text-xl font-bold">Location-First Priority</h3>
                         <p className="text-neutral-500 text-sm mt-1">We show you "Active in [Your State]" users before "Global" users.</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="mt-1"><Activity className="w-6 h-6 text-green-500"/></div>
                      <div>
                         <h3 className="text-xl font-bold">5-Minute Activity Filter</h3>
                         <p className="text-neutral-500 text-sm mt-1">Our system hides anyone who hasn't been active in the last 5 minutes. If you see them, they are there.</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Visual (Radar concept) */}
             <div className="order-1 lg:order-2 h-[400px] flex items-center justify-center relative">
                {/* Radar Circles */}
                <div className="absolute w-[400px] h-[400px] border border-neutral-800 rounded-full opacity-20"></div>
                <div className="absolute w-[250px] h-[250px] border border-neutral-700 rounded-full opacity-40"></div>
                <div className="absolute w-[100px] h-[100px] border border-neutral-600 rounded-full opacity-60 bg-neutral-900 flex items-center justify-center">
                   <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-pulse"></div>
                </div>
                
                {/* Connecting Lines */}
                <div className="absolute w-[150px] h-[1px] bg-gradient-to-r from-green-500/50 to-transparent rotate-45 top-1/2 left-1/2 origin-left"></div>
                <div className="absolute w-[150px] h-[1px] bg-gradient-to-r from-green-500/20 to-transparent rotate-[160deg] top-1/2 left-1/2 origin-left"></div>

                {/* Users dots */}
                <div className="absolute top-10 right-20 w-3 h-3 bg-white rounded-full"></div>
                <div className="absolute bottom-20 left-10 w-2 h-2 bg-neutral-500 rounded-full"></div>
             </div>
           </div>
        </div>
      </section>

      {/* --- Feature 2: Private Chat (NEW SECTION) --- */}
      <section id="private" className="py-32 bg-neutral-100 text-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
             
             {/* Left Visual: Private Chat Mockup */}
             <div className="h-[450px] relative">
                 <div className="absolute inset-0 bg-white rounded-3xl transform rotate-3 border border-neutral-200"></div>
                 <div className="relative z-10 h-full w-full">
                    <PrivateChatMockup />
                 </div>
             </div>

             {/* Right Text */}
             <div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-black text-white rounded-lg">
                      <MessageSquare className="w-6 h-6" />
                   </div>
                   <span className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-500">1:1 Messaging</span>
                </div>
                
                <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
                   DIRECT &<br/>DISCREET.
                </h2>
                <p className="text-xl text-neutral-600 mb-8 leading-relaxed font-medium">
                   Slide into DMs without the noise. High-fidelity one-on-one messaging designed for privacy.
                </p>
                
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="p-2 bg-white border border-neutral-200 rounded-lg mt-1"><FileUp className="w-5 h-5 text-black" /></div>
                      <div>
                         <h3 className="font-bold text-lg">50MB File Sharing</h3>
                         <p className="text-neutral-500 text-sm">Send raw photos, videos, and zips directly. No compression.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="p-2 bg-white border border-neutral-200 rounded-lg mt-1"><Clock className="w-5 h-5 text-black" /></div>
                      <div>
                         <h3 className="font-bold text-lg">Real-Time Indicators</h3>
                         <p className="text-neutral-500 text-sm">See when they're typing and exactly when they read your message.</p>
                      </div>
                   </div>
                </div>
             </div>

           </div>
        </div>
      </section>

      {/* --- Feature 3: Guest Mode (Privacy) --- */}
      <section id="privacy" className="py-32 bg-white text-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
             
             <div className="h-[500px] relative order-2 lg:order-1">
                <GuestModeIllustration />
             </div>

             <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-black text-white rounded-lg">
                      <Ghost className="w-6 h-6" />
                   </div>
                   <span className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-500">Privacy First</span>
                </div>
                
                <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
                   TRY IT.<br/>THEN DELETE IT.
                </h2>
                <p className="text-xl text-neutral-600 mb-8 leading-relaxed font-medium">
                   Commitment issues? We get it. 
                </p>
                
                <ul className="space-y-6">
                   <li className="flex items-start gap-4">
                      <div className="p-1 bg-black rounded-full mt-1"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                      <div>
                         <span className="font-bold text-lg block">No Email Required</span>
                         <span className="text-neutral-500">Generate a Guest ID instantly. No password to remember.</span>
                      </div>
                   </li>
                   <li className="flex items-start gap-4">
                      <div className="p-1 bg-black rounded-full mt-1"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                      <div>
                         <span className="font-bold text-lg block">24-Hour Auto-Delete</span>
                         <span className="text-neutral-500">If you don't upgrade, we wipe your user data, sessions, and messages from the DB.</span>
                      </div>
                   </li>
                </ul>
             </div>

           </div>
        </div>
      </section>

      {/* --- Feature 4: One Group Rule (Quality) --- */}
      <section id="quality" className="py-32 bg-neutral-100 text-black">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
                
                <div className="max-w-xl">
                   <div className="inline-flex items-center justify-center p-3 bg-black text-white rounded-lg mb-6">
                      <Shield className="w-6 h-6" />
                   </div>
                   <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                      THE "ONE GROUP" RULE.
                   </h2>
                   <p className="text-xl text-neutral-600 font-medium mb-6">
                      Most chat apps are graveyards of dead groups. We fixed that with a database-level restriction.
                   </p>
                   <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xl">
                        <p className="font-mono text-sm text-neutral-500 mb-4">// convex/groups.ts</p>
                        <div className="font-mono text-sm bg-neutral-50 p-4 rounded border border-neutral-200 text-neutral-700">
                            if (user.hasCreatedGroup) {'{'}<br/>
                            &nbsp;&nbsp;throw new Error("One group limit reached.");<br/>
                            {'}'}
                        </div>
                        <p className="mt-4 font-bold">Result: Every group on ChatPulse is active and moderated.</p>
                   </div>
                </div>

                <div className="relative h-[400px]">
                    <OneGroupMockup />
                </div>
            </div>
            {/* REMOVED: Extra Features Grid (as requested) */}
         </div>
      </section>
      
      <FounderStory />

      {/* --- FAQ Section --- */}
      <section className="py-32 bg-black text-white border-t border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="mb-16">
             <div className="inline-flex items-center gap-3 border border-neutral-800 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
                <HelpCircle className="w-4 h-4 text-neutral-400" />
                Common Questions
              </div>
              <h2 className="text-5xl font-black tracking-tight">FAQ.</h2>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
              <FAQItem 
                index={0}
                question="What happens to my data after 24 hours?" 
                answer="It is hard-deleted. Our cleanup cron job runs daily at 2 AM UTC and strictly removes all guest users, their sessions, and their messages. We do not keep backups of guest data." 
              />
              <FAQItem 
                index={1}
                question="Why can I only create one group?" 
                answer="To prevent spam and abandoned communities. By limiting users to one active group, we ensure that every group creator is committed to moderation and activity." 
              />
              <FAQItem 
                index={2}
                question="Does 'Guest Mode' really require no email?" 
                answer="Yes. We generate a session token based on your device signature. You can start chatting instantly. You only need an email if you choose to upgrade to a permanent account." 
              />
              <FAQItem 
                index={3}
                question="How does the location discovery work?" 
                answer="We use a tiered priority system. If there are enough active users in your state/region, we show them first. If not, we widen the circle to your country, then globally." 
              />
           </div>
        </div>
      </section>

      {/* --- CTA / Footer --- */}
      <section className="py-32 bg-black border-t border-neutral-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
           <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter">
             READY TO GO<br/>GHOST?
           </h2>
           
           <div className="flex flex-col items-center justify-center gap-6">
             <button className="bg-white text-black px-12 py-5 rounded-full font-black hover:bg-neutral-200 transition-colors uppercase tracking-widest text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                <Link href="/auth/guest">Create Guest Account</Link>
             </button>
             <p className="text-neutral-500 font-mono text-sm">Session expires automatically in 24:00:00</p>
           </div>
           
           <div className="mt-32 pt-10 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono uppercase tracking-wider text-neutral-500">
              <span>© 2025 ChatPulse Inc.</span>
              <div className="flex gap-8">
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Systems Normal</span>
                <a href="/privacy" className="hover:text-white">Privacy</a>
                <a href="/terms" className="hover:text-white">Terms</a>
              </div>
           </div>
        </div>
      </section>
      
      {/* CSS Animations */}
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-\[-8deg\] { transform: rotateY(-8deg) rotateX(5deg); }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        .animate-bounce-delayed { animation: bounce 3s infinite 1.5s; }
      `}</style>

    </div>
  )
}

export default ChatPulseLanding; // Ensure the default export is present