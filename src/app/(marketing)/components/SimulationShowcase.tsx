"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Simulation = {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  description: string | null;
  thumbnailUrl: string | null;
  moduleCount: number;
  estimatedDurationMin: number | null;
};

export default function SimulationShowcase({
  simulations,
}: {
  simulations: Simulation[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header entrance
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

      // Cards stagger in
      gsap.from(gridRef.current!.children, {
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 0.7,
        stagger: 0.1,
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
    <section ref={sectionRef} className="py-32 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className="text-center mb-16">
          <p className="text-sm font-medium text-brand-400 mb-3 tracking-wide uppercase">
            Simulation Library
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Cinematic training environments
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">
            Every simulation is built in professional game engines with
            KitBash3D environments for maximum realism and immersion.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {simulations.slice(0, 6).map((sim) => (
            <Link
              key={sim.slug}
              href={`/simulations/${sim.slug}`}
              className="group rounded-2xl border border-border-subtle bg-surface-raised overflow-hidden hover:border-brand-600/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/5"
            >
              <div className="aspect-video relative overflow-hidden">
                {sim.thumbnailUrl ? (
                  <Image
                    src={sim.thumbnailUrl}
                    alt={sim.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-overlay" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-medium backdrop-blur-sm border border-brand-500/20">
                    {sim.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-medium backdrop-blur-sm capitalize">
                    {sim.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold group-hover:text-brand-300 transition">
                  {sim.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted line-clamp-2">
                  {sim.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                  <span>{sim.moduleCount} modules</span>
                  {sim.estimatedDurationMin && (
                    <span>{sim.estimatedDurationMin} min</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/simulations"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border-default/50 text-text-secondary hover:text-text-primary hover:border-brand-500/50 font-medium transition"
          >
            View All Simulations
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
