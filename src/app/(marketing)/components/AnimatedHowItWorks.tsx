"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    step: "01",
    title: "Discover a simulation",
    description:
      "Browse the marketplace by category, difficulty, or studio. Filter by cybersecurity, diplomacy, crisis management, and more.",
  },
  {
    step: "02",
    title: "Launch the experience",
    description:
      "Launch directly into immersive Unreal Engine or Unity simulations. Play on desktop — no downloads, no plugins.",
  },
  {
    step: "03",
    title: "Make decisions under pressure",
    description:
      "Face realistic scenarios with real trade-offs. Your decisions flow back to Simvado in real time via our game SDK.",
  },
  {
    step: "04",
    title: "Review your scorecard",
    description:
      "See your 5-axis score, compare to peers, and receive a personalized AI coaching debrief that pinpoints your strengths and blind spots.",
  },
];

export default function AnimatedHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current!.children, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // Line draws across
      if (lineRef.current) {
        gsap.from(lineRef.current, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: stepsRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }

      // Steps stagger in
      gsap.from(stepsRef.current!.children, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-32 border-t border-border-subtle"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className="text-center mb-20">
          <p className="text-sm font-medium text-brand-400 mb-3 tracking-wide uppercase">
            How It Works
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Four steps to better decisions
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div
            ref={lineRef}
            className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-brand-600/0 via-brand-600/40 to-brand-600/0"
          />

          <div
            ref={stepsRef}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((item) => (
              <div key={item.step} className="relative text-center lg:text-left">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-600/10 border border-brand-600/20 mb-6">
                  <span className="text-2xl font-bold font-mono text-brand-400">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
