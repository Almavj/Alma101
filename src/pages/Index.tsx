import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import { ArrowUpRight, Mail, Github, Twitter, Linkedin, Dribbble } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const words = ["Design", "Create", "Inspire"];

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
        <span className="text-xs text-muted uppercase tracking-[0.3em]">Portfolio</span>
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

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const footerVideoRef = useRef<HTMLVideoElement>(null);
  const parallaxContainerRef = useRef(null);

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
        
      const ctx = gsap.context(() => {
        gsap.to(".parallax-left", {
          yPercent: -50,
          ease: "none",
          scrollTrigger: {
            trigger: parallaxContainerRef.current,
            start: "top top",
            end: "+=200%",
            scrub: 1
          }
        });
        gsap.to(".parallax-right", {
          yPercent: -80,
          ease: "none",
          scrollTrigger: {
            trigger: parallaxContainerRef.current,
            start: "top top",
            end: "+=200%",
            scrub: 1.5
          }
        });
        gsap.to(".marquee-content", {
          xPercent: -100,
          duration: 40,
          ease: "none",
          repeat: -1
        });
      });
      return () => ctx.revert();
    }
  }, [isLoading]);

  const handleComplete = useCallback(() => setIsLoading(false), []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleComplete} />}
      </AnimatePresence>

      <div className="bg-bg min-h-screen font-body selection:bg-text-primary selection:text-bg">
        {/* Section 2: Hero */}
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
               <div className="w-9 h-9 rounded-full accent-gradient p-[1px] group cursor-pointer hover:scale-110 transition-transform">
                 <div className="w-full h-full bg-bg rounded-full flex items-center justify-center">
                   <span className="font-display italic text-[13px] text-text-primary">A101</span>
                 </div>
               </div>
               
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
                   <a key={item.name} href={item.path} className="text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1 text-muted hover:text-text-primary hover:bg-stroke/50 transition-colors">
                     {item.name}
                   </a>
                 ))}
               </div>
               
               <div className="w-px h-5 bg-stroke mx-2"></div>
               
               <a href="/auth" className="relative group ml-1 rounded-full text-xs sm:text-sm px-4 py-1 text-text-primary hover:text-white transition-colors">
                 <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                 <span className="relative z-10 bg-surface rounded-full backdrop-blur-md flex items-center gap-1 absolute inset-0 justify-center">
                   Log In <ArrowUpRight size={14} />
                 </span>
                 <span className="opacity-0">Log In <ArrowUpRight size={14} /></span>
               </a>
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
              <button className="group relative rounded-full hover:scale-105 transition-transform duration-300">
                <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative z-10 flex items-center justify-center px-7 py-3.5 bg-text-primary text-bg group-hover:bg-bg group-hover:text-text-primary rounded-full transition-colors duration-300 text-sm font-medium">
                  Start Learning
                </span>
              </button>
              <button className="group relative rounded-full hover:scale-105 transition-transform duration-300">
                <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative z-10 flex items-center justify-center px-7 py-3.5 bg-bg text-text-primary border-2 border-stroke group-hover:border-transparent rounded-full transition-all duration-300 text-sm font-medium">
                  Join Now
                </span>
              </button>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
            <span className="text-xs text-muted uppercase tracking-[0.2em] mb-4 drop-shadow-md">SCROLL</span>
            <div className="w-px h-10 bg-stroke relative overflow-hidden">
              <div className="w-full h-full bg-text-primary animate-scroll-down"></div>
            </div>
          </div>
        </section>

        {/* Section 3: Selected Works */}
        <section className="bg-bg py-16 md:py-24 relative z-20">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-12"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-px bg-stroke"></div>
                  <span className="text-xs text-muted uppercase tracking-[0.3em]">Tools & Writeups</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight">
                  Featured <span className="font-display italic text-5xl md:text-6xl lg:text-7xl">resources</span>
                </h2>
                <p className="text-muted mt-4 max-w-md text-sm md:text-base">
                  A selection of practical tools and detailed writeups for the security community.
                </p>
              </div>
              <a href="/tools" className="hidden md:inline-flex group relative rounded-full">
                <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative z-10 flex items-center gap-2 px-6 py-3 bg-surface text-text-primary rounded-full transition-colors border border-stroke group-hover:border-transparent text-sm">
                  Explore tools <ArrowUpRight size={14} />
                </span>
              </a>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
              {[
                { title: "Zero-Day Exploit", img: "1555949963-c1c5a9dd52a2", label: "Writeup", cols: 7, aspect: "aspect-[4/3]" },
                { title: "Network Scanner", img: "1526374965328-7f61d4dc18c5", label: "Tool", cols: 5, aspect: "aspect-square md:aspect-auto" },
                { title: "Malware Analysis", img: "1550751827-4bd374c3f58b", label: "Writeup", cols: 5, aspect: "aspect-square md:aspect-auto" },
                { title: "Payload Generator", img: "1614064007833-289b53e87853", label: "Tool", cols: 7, aspect: "aspect-[4/3]" }
              ].map((project, idx) => (
                <div key={idx} className={`md:col-span-${project.cols} ${project.aspect} group relative rounded-3xl overflow-hidden border border-stroke bg-surface cursor-pointer`}>
                  <img src={`https://images.unsplash.com/photo-${project.img}?q=80&w=2000&auto=format&fit=crop`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={project.title} />
                  <div className="absolute inset-0 opacity-20 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
                  <div className="absolute inset-0 bg-bg/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-md flex items-center justify-center">
                    <div className="relative rounded-full p-[2px] accent-gradient scale-90 group-hover:scale-100 transition-transform duration-500 delay-75">
                      <div className="bg-white rounded-full px-6 py-2 flex items-center gap-2">
                        <span className="text-black text-sm">View — </span>
                        <span className="text-black font-display italic text-lg">{project.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Journal */}
        <section className="bg-bg py-16 md:py-24 relative z-20">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-12"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-px bg-stroke"></div>
                  <span className="text-xs text-muted uppercase tracking-[0.3em]">Security Blog</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight">
                  Advisories & <span className="font-display italic text-5xl md:text-6xl lg:text-7xl">news</span>
                </h2>
              </div>
              <a href="/blogs" className="mt-6 md:mt-0 group relative rounded-full self-start md:self-auto">
                <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative z-10 flex items-center gap-2 px-6 py-3 bg-surface text-text-primary rounded-full transition-colors border border-stroke group-hover:border-transparent text-sm">
                  View all advisories <ArrowUpRight size={14} />
                </span>
              </a>
            </motion.div>

            <div className="flex flex-col gap-4">
              {[
                { title: "Zero-Day Analysis: The latest RCE vulnerability", date: "Oct 12, 2026", time: "5 min read", img: "1550745165-9bc0b252726f" },
                { title: "Defending against supply chain attacks", date: "Sep 28, 2026", time: "4 min read", img: "1561070791-2526d30994b5" },
                { title: "Securing modern cloud infrastructure", date: "Aug 15, 2026", time: "7 min read", img: "1555066931-4365d14bab8c" },
                { title: "The evolution of modern ransomware", date: "Jul 02, 2026", time: "6 min read", img: "1518770660439-4636190af475" }
              ].map((article, i) => (
                <a key={i} href="#" className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-surface/30 hover:bg-surface border border-stroke rounded-[40px] sm:rounded-full transition-colors group">
                  <img src={`https://images.unsplash.com/photo-${article.img}?w=200&h=200&fit=crop`} className="w-16 h-16 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={article.title} />
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                    <h3 className="text-lg md:text-xl text-text-primary group-hover:text-white transition-colors">{article.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span>{article.time}</span>
                      <div className="w-1 h-1 rounded-full bg-stroke"></div>
                      <span>{article.date}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Explorations */}
        <section className="bg-bg relative z-20" style={{ minHeight: '300vh' }}>
          <div ref={parallaxContainerRef} className="h-screen sticky top-0 flex items-center justify-center overflow-hidden">
            <div className="z-10 text-center pointer-events-none relative pt-20 mix-blend-difference">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-8 h-px bg-stroke"></div>
                <span className="text-xs text-muted uppercase tracking-[0.3em]">Attack Vectors</span>
                <div className="w-8 h-px bg-stroke"></div>
              </div>
              <h2 className="text-6xl md:text-8xl lg:text-9xl text-text-primary tracking-tight mb-8">
                Threat <span className="font-display italic">landscape</span>
              </h2>
              <a href="/writeup" className="pointer-events-auto group relative rounded-full inline-block mix-blend-normal">
                <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative z-10 flex items-center gap-2 px-8 py-4 bg-bg text-text-primary rounded-full border border-stroke group-hover:border-transparent transition-all">
                  Explore Vulnerabilities
                </span>
              </a>
            </div>

            <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center">
              <div className="grid grid-cols-2 gap-8 md:gap-32 max-w-[1200px] w-full px-8 relative h-[150vh]">
                <div className="flex flex-col gap-24 pt-[20vh] parallax-left">
                  {[
                    { title: "Hacking Videos", desc: "Learn from expert tutorials covering penetration testing and network security.", img: "1614064007833-289b53e87853" },
                    { title: "Security Blogs", desc: "Stay updated with the latest cybersecurity trends and vulnerabilities.", img: "1498050108023-c5249f4df085" },
                    { title: "Hacking Tools", desc: "Access curated collections of essential pentesting tools.", img: "1526374965328-7f61d4dc18c5" }
                  ].map((card, i) => (
                    <div key={`l-${i}`} className="w-full max-w-[280px] aspect-[4/5] rounded-3xl overflow-hidden border border-stroke/50 -rotate-3 transform hover:rotate-0 transition-transform duration-500 pointer-events-auto ml-auto grayscale hover:grayscale-0 relative group/card cursor-pointer">
                      <img src={`https://images.unsplash.com/photo-${card.img}?q=80&w=600&h=800&fit=crop`} className="w-full h-full object-cover" alt={card.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent flex flex-col justify-end p-6 translate-y-8 group-hover/card:translate-y-0 transition-transform duration-500">
                        <h3 className="text-2xl text-text-primary font-display italic mb-2">{card.title}</h3>
                        <p className="text-sm text-muted opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100">{card.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-24 pt-[50vh] parallax-right">
                  {[
                    { title: "Bug Bounty", desc: "Detailed writeups on finding and exploiting real-world vulnerabilities.", img: "1555949963-c1c5a9dd52a2" },
                    { title: "Threat Intel", desc: "Analysis of the latest APT groups, malware strains, and cyber attacks.", img: "1550751827-4bd374c3f58b" },
                    { title: "CTF Events", desc: "Participate in Capture The Flag events and level up your hacking skills.", img: "1542831371229-5915d31cb7ee" }
                  ].map((card, i) => (
                    <div key={`r-${i}`} className="w-full max-w-[280px] aspect-[4/5] rounded-3xl overflow-hidden border border-stroke/50 rotate-3 transform hover:rotate-0 transition-transform duration-500 pointer-events-auto mr-auto grayscale hover:grayscale-0 relative group/card cursor-pointer">
                      <img src={`https://images.unsplash.com/photo-${card.img}?q=80&w=600&h=800&fit=crop`} className="w-full h-full object-cover" alt={card.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent flex flex-col justify-end p-6 translate-y-8 group-hover/card:translate-y-0 transition-transform duration-500">
                        <h3 className="text-2xl text-text-primary font-display italic mb-2">{card.title}</h3>
                        <p className="text-sm text-muted opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100">{card.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Stats */}
        <section className="bg-bg py-16 md:py-24 border-t border-stroke/30 relative z-20">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-stroke/50">
              <div className="flex flex-col items-center md:items-start pt-8 md:pt-0">
                <span className="text-5xl lg:text-7xl font-display italic text-text-primary mb-4">10K+</span>
                <span className="text-sm text-muted uppercase tracking-[0.2em]">Community Members</span>
              </div>
              <div className="flex flex-col items-center md:items-start pt-8 md:pt-0 md:pl-12">
                <span className="text-5xl lg:text-7xl font-display italic text-text-primary mb-4">500+</span>
                <span className="text-sm text-muted uppercase tracking-[0.2em]">Security Writeups</span>
              </div>
              <div className="flex flex-col items-center md:items-start pt-8 md:pt-0 md:pl-12">
                <span className="text-5xl lg:text-7xl font-display italic text-text-primary mb-4">50+</span>
                <span className="text-sm text-muted uppercase tracking-[0.2em]">Ethical Hacking Tools</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Contact / Footer */}
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
            <div className="flex whitespace-nowrap overflow-hidden mb-20 marquee-container mix-blend-difference">
              <div className="flex items-center text-7xl md:text-9xl font-display italic text-white marquee-content">
                {Array(10).fill("PROTECTING DIGITAL ASSETS • SECURING THE FUTURE • ").map((text, i) => (
                  <span key={i} className="px-4">{text}</span>
                ))}
              </div>
              <div className="flex items-center text-7xl md:text-9xl font-display italic text-white marquee-content">
                {Array(10).fill("PROTECTING DIGITAL ASSETS • SECURING THE FUTURE • ").map((text, i) => (
                  <span key={i} className="px-4">{text}</span>
                ))}
              </div>
            </div>

            <div className="flex justify-center mb-20">
              <a href="mailto:contact@alma101.com" className="group relative rounded-full inline-block">
                <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative z-10 flex flex-col items-center justify-center px-16 py-12 bg-bg text-text-primary rounded-full transition-colors border border-stroke group-hover:border-transparent">
                  <Mail size={32} className="mb-4 text-muted group-hover:text-white transition-colors" />
                  <span className="text-3xl md:text-4xl tracking-tight">Get in touch</span>
                </span>
              </a>
            </div>

            <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <a href="#" className="text-muted hover:text-white transition-colors"><Twitter size={20} /></a>
                <a href="#" className="text-muted hover:text-white transition-colors"><Linkedin size={20} /></a>
                <a href="#" className="text-muted hover:text-white transition-colors"><Dribbble size={20} /></a>
                <a href="#" className="text-muted hover:text-white transition-colors"><Github size={20} /></a>
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