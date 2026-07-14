import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import { ArrowUpRight, Mail, Github, BookOpen, Wrench, FileText, Video } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const words = ["Defend", "Exploit", "Secure"];

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 900);
    return () => clearInterval(wordInterval);
  }, []);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;
    const duration = 2700;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      const percentage = Math.min((progress / duration) * 100, 100);
      setCount(Math.floor(percentage));
      
      if (progress < duration) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setTimeout(onComplete, 400);
      }
    };
    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-bg flex flex-col justify-between p-8">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}>
        <span className="text-xs text-muted uppercase tracking-[0.3em]">Alma101 Security</span>
      </motion.div>

      <div className="flex-1 flex items-center justify-center">
        <div className="h-24 overflow-hidden relative w-full flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display italic text-text-primary/80 absolute"
            >
              {words[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col items-end w-full">
        <span className="text-7xl md:text-9xl lg:text-[12rem] font-display text-text-primary tabular-nums leading-none">
          {String(count).padStart(3, "0")}
        </span>
        <div className="w-full h-[3px] bg-stroke/50 mt-4 overflow-hidden origin-left rounded-full">
          <div 
            className="h-full accent-gradient origin-left transition-transform duration-75 ease-linear rounded-full"
            style={{ 
              transform: `scaleX(${count / 100})`, 
              boxShadow: '0 0 12px rgba(137, 170, 204, 0.5)' 
            }}
          />
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: Video,
    title: "Hacking Videos",
    description: "Expert tutorials covering penetration testing, network security, and exploitation techniques.",
    path: "/videos",
  },
  {
    icon: BookOpen,
    title: "Security Blog",
    description: "Stay updated with the latest cybersecurity trends, CVEs, and vulnerability disclosures.",
    path: "/blogs",
  },
  {
    icon: Wrench,
    title: "Ethical Hacking Tools",
    description: "Access curated collections of essential pentesting and security assessment tools.",
    path: "/tools",
  },
  {
    icon: FileText,
    title: "Security Writeups",
    description: "Detailed walkthroughs of real-world vulnerabilities, CTF challenges, and bug bounties.",
    path: "/writeup",
  },
];

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const footerVideoRef = useRef<HTMLVideoElement>(null);

  const roles = ["Cybersecurity", "Penetration Testing", "Ethical Hacking", "Threat Hunting"];
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const roleInterval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2000);
    return () => clearInterval(roleInterval);
  }, []);

  useEffect(() => {
    const videoSrc = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";
    const setupVideo = (element: HTMLVideoElement | null) => {
      if (element) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(videoSrc);
          hls.attachMedia(element);
        } else if (element.canPlayType('application/vnd.apple.mpegurl')) {
          element.src = videoSrc;
        }
      }
    };
    
    setupVideo(videoRef.current);
    setupVideo(footerVideoRef.current);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const tl = gsap.timeline();
      tl.to(".blur-in", { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1, delay: 0.3, ease: "power3.out" }, 0)
        .to(".name-reveal", { opacity: 1, y: 0, duration: 1.2, delay: 0.1, ease: "power3.out" }, 0);
    }
  }, [isLoading]);

  const handleComplete = useCallback(() => setIsLoading(false), []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleComplete} />}
      </AnimatePresence>

      <div className="bg-bg min-h-screen font-body selection:bg-text-primary selection:text-bg">
        {/* Hero */}
        <section className="relative h-screen w-full overflow-hidden">
          <div className="absolute inset-0 z-0">
            <video 
              ref={videoRef}
              autoPlay muted loop playsInline
              className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2"
            />
            <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent"></div>
          </div>

          <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 transition-shadow duration-300 ${scrollY > 100 ? 'shadow-md shadow-black/10' : ''}`}>
            <div className="inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface/80 px-2 py-1">
               <Link to="/" className="w-9 h-9 rounded-full accent-gradient p-[1px] group cursor-pointer hover:scale-110 transition-transform">
                 <div className="w-full h-full bg-bg rounded-full flex items-center justify-center">
                   <span className="font-display italic text-[13px] text-text-primary">A101</span>
                 </div>
               </Link>
               
               <div className="w-px h-5 bg-stroke mx-2 hidden sm:block"></div>
               
               <div className="flex space-x-1 px-1">
                 {[
                   { name: "Home", path: "/" },
                   { name: "Hacking Videos", path: "/videos" },
                   { name: "Blog", path: "/blogs" },
                   { name: "Tools", path: "/tools" },
                   { name: "Writeups", path: "/writeup" },
                   { name: "Contact", path: "/contact" },
                 ].map(item => (
                   <Link key={item.name} to={item.path} className="text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1 text-muted hover:text-text-primary hover:bg-stroke/50 transition-colors">
                     {item.name}
                   </Link>
                 ))}
               </div>
               
               <div className="w-px h-5 bg-stroke mx-2"></div>
               
               <Link to="/auth" className="relative group ml-1 rounded-full text-xs sm:text-sm px-4 py-1 text-text-primary hover:text-white transition-colors">
                 <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                 <span className="relative z-10 bg-surface rounded-full backdrop-blur-md flex items-center gap-1 absolute inset-0 justify-center">
                   Log In <ArrowUpRight size={14} />
                 </span>
                 <span className="opacity-0">Log In <ArrowUpRight size={14} /></span>
               </Link>
            </div>
          </nav>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-20 pointer-events-none">
            <div className="blur-in opacity-0 translate-y-5 blur-[10px] text-xs text-muted uppercase tracking-[0.3em] mb-8">
              SECURE YOUR FUTURE
            </div>
            <h1 className="name-reveal opacity-0 translate-y-[50px] text-6xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6 drop-shadow-lg">
              Alma101 Security
            </h1>
            <div className="text-xl md:text-2xl mb-4 text-text-primary/90 flex items-center gap-2 drop-shadow-md">
              Mastering
              <span key={roleIndex} className="font-display italic text-text-primary animate-role-fade-in inline-block w-[180px] text-left">
                {roles[roleIndex]}
              </span>
            </div>
            <p className="text-sm md:text-base text-muted max-w-md mb-12 drop-shadow-md">
              Your premier online platform for mastering cybersecurity and ethical hacking techniques to protect digital assets.
            </p>
            <div className="flex gap-4 pointer-events-auto">
              <Link to="/auth" className="group relative rounded-full hover:scale-105 transition-transform duration-300">
                <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative z-10 flex items-center justify-center px-7 py-3.5 bg-text-primary text-bg group-hover:bg-bg group-hover:text-text-primary rounded-full transition-colors duration-300 text-sm font-medium">
                  Start Learning
                </span>
              </Link>
              <Link to="/contact" className="group relative rounded-full hover:scale-105 transition-transform duration-300">
                <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative z-10 flex items-center justify-center px-7 py-3.5 bg-bg text-text-primary border-2 border-stroke group-hover:border-transparent rounded-full transition-all duration-300 text-sm font-medium">
                  Get in Touch
                </span>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
            <span className="text-xs text-muted uppercase tracking-[0.2em] mb-4 drop-shadow-md">SCROLL</span>
            <div className="w-px h-10 bg-stroke relative overflow-hidden">
              <div className="w-full h-full bg-text-primary animate-scroll-down"></div>
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="bg-bg py-16 md:py-24 relative z-20">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-8 h-px bg-stroke"></div>
                <span className="text-xs text-muted uppercase tracking-[0.3em]">What We Offer</span>
                <div className="w-8 h-px bg-stroke"></div>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight">
                Master the <span className="font-display italic text-5xl md:text-6xl lg:text-7xl">art of security</span>
              </h2>
              <p className="text-muted mt-4 max-w-lg mx-auto text-sm md:text-base">
                Everything you need to learn, practice, and stay ahead in cybersecurity — all in one platform.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Link
                    to={feature.path}
                    className="block p-8 rounded-3xl border border-stroke bg-surface/30 hover:bg-surface/60 transition-all duration-500 group h-full"
                  >
                    <div className="w-12 h-12 rounded-2xl accent-gradient flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl text-text-primary font-display italic mb-3 group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-muted uppercase tracking-[0.15em] group-hover:text-text-primary transition-colors">
                      Explore <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact / Footer */}
        <section className="bg-bg pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden relative z-20">
          <div className="absolute inset-0 z-0">
            <video 
              ref={footerVideoRef}
              autoPlay muted loop playsInline
              className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 scale-y-[-1]"
            />
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[4px]"></div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-center mb-20">
              <Link to="/contact" className="group relative rounded-full inline-block">
                <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative z-10 flex flex-col items-center justify-center px-16 py-12 bg-bg text-text-primary rounded-full transition-colors border border-stroke group-hover:border-transparent">
                  <Mail size={32} className="mb-4 text-muted group-hover:text-white transition-colors" />
                  <span className="text-3xl md:text-4xl tracking-tight">Get in touch</span>
                </span>
              </Link>
            </div>

            <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <a href="https://github.com/Almavj" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-white transition-colors"><Github size={20} /></a>
              </div>
              <div className="flex items-center gap-3 bg-surface/50 backdrop-blur border border-stroke px-5 py-2.5 rounded-full">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <span className="text-xs text-muted uppercase tracking-[0.1em]">Available for projects</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}