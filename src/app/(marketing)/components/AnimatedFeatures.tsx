"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Immersive Simulations",
    description:
      "Built in Unreal Engine and Unity with KitBash3D environments. Cinematic quality that puts leaders inside the scenario.",
    image:
      "https://kitbash3d.com/cdn/shop/files/hp-genre-highlights-SciFi.png",
  },
  {
    title: "AI-Powered Debriefs",
    description:
      "After every session, receive personalized AI coaching that analyzes your decisions, identifies blind spots, and recommends growth areas.",
    image:
      "https://kitbash3d.com/cdn/shop/files/hp-genre-highlights-Fantasy.png",
  },
  {
    title: "Multi-Axis Scoring",
    description:
      "Measure Financial Impact, Reputational Risk, Ethical Integrity, Stakeholder Confidence, and Long-term Stability across every decision.",
    image:
      "https://kitbash3d.com/cdn/shop/files/hp-genre-highlights-gameplay-ready.png",
  },
  {
    title: "Simulation Marketplace",
    description:
      "Browse a growing catalog built by Simvado and third-party studios. From cybersecurity to diplomacy, find the challenge that fits.",
    image:
      "https://kitbash3d.com/cdn/shop/files/hp-genre-highlights-Modern-Cities.png",
  },
  {
    title: "Enterprise Analytics",
    description:
      "Track team performance, identify organizational risk patterns, assign simulations, and export reports across your entire workforce.",
    image:
      "https://kitbash3d.com/cdn/shop/files/hp-genre-highlights-Battlefields.png",
  },
  {
    title: "Studio Developer Platform",
    description:
      "Build and publish simulations on Simvado. Integrate with our SDK, submit for review, and earn revenue from every completion.",
    image:
      "https://kitbash3d.com/cdn/shop/files/hp-genre-highlights-Strange-lands.png",
  },
];

export default function AnimatedFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

      gsap.from(gridRef.current!.children, {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-32 border-t border-border-subtle"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className="text-center mb-16">
          <p className="text-sm font-medium text-brand-400 mb-3 tracking-wide uppercase">
            Platform Features
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Training that feels like the real thing
          </h2>
        </div>

        <div
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border-subtle bg-surface-raised overflow-hidden hover:border-brand-600/40 transition-all duration-300"
            >
              {/* Background image */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                <Image
                  src={feature.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-surface-raised/95 to-surface-raised/70" />

              {/* Content */}
              <div className="relative p-8">
                <h3 className="text-lg font-semibold group-hover:text-brand-300 transition">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
