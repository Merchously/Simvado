"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

export default function AnimatedHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Badge drops in
      tl.from(badgeRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
      });

      // Headline words stagger up
      tl.from(
        headlineRef.current!.querySelectorAll(".word"),
        {
          y: 80,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
        },
        "-=0.2"
      );

      // Subtitle fades in
      tl.from(
        subtitleRef.current,
        { y: 30, opacity: 0, duration: 0.7 },
        "-=0.4"
      );

      // CTAs slide up
      tl.from(
        ctaRef.current!.children,
        { y: 30, opacity: 0, duration: 0.6, stagger: 0.1 },
        "-=0.3"
      );

      // Stats count up
      tl.from(
        statsRef.current!.children,
        { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 },
        "-=0.3"
      );

      // Background image parallax on scroll
      gsap.to(imgRef.current, {
        y: 100,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden min-h-screen flex items-center">
      {/* Background image */}
      <div ref={imgRef} className="absolute inset-0 -z-10 scale-110">
        <Image
          src="https://kitbash3d.com/cdn/shop/files/CPI_WEB_HERO.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-surface/80 to-surface" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/60 via-transparent to-surface/60" />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[400px] rounded-full bg-brand-600/15 blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] rounded-full bg-brand-400/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 text-center w-full">
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/5 px-4 py-1.5 text-xs text-brand-300 mb-8 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
          Marketplace Live &mdash; 12 simulations available
        </div>

        <h1
          ref={headlineRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] max-w-5xl mx-auto"
        >
          <span className="word inline-block">Leadership</span>{" "}
          <span className="word inline-block">Training</span>{" "}
          <span className="word inline-block text-brand-400">Reimagined</span>
        </h1>

        <p
          ref={subtitleRef}
          className="mt-8 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          Immersive, game-engine-powered simulations built by industry experts.
          Make high-stakes decisions in cinematic environments — then get
          AI-powered coaching on your performance.
        </p>

        <div
          ref={ctaRef}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base transition shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5"
          >
            Start Training Free
          </Link>
          <Link
            href="/simulations"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-border-default/50 text-text-secondary hover:text-text-primary hover:border-brand-500/50 font-medium text-base transition backdrop-blur-sm"
          >
            Browse Simulations
          </Link>
        </div>

        <div
          ref={statsRef}
          className="mt-20 grid grid-cols-4 gap-8 max-w-2xl mx-auto"
        >
          {[
            { value: "12", label: "Simulations" },
            { value: "48", label: "Training Modules" },
            { value: "5", label: "Scoring Dimensions" },
            { value: "AI", label: "Powered Debriefs" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-bold text-brand-400">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />
    </section>
  );
}
