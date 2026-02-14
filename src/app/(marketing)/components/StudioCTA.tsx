"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StudioCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current!.children, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 border-t border-border-subtle">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative rounded-3xl overflow-hidden border border-border-subtle">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="https://kitbash3d.com/cdn/shop/files/NWD-Collections-Banners-Desktop-02.png"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-surface/50" />
          </div>

          <div
            ref={contentRef}
            className="relative px-8 md:px-16 py-16 md:py-20 max-w-2xl"
          >
            <p className="text-sm font-medium text-brand-400 mb-3 tracking-wide uppercase">
              For Developers
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Build simulations.
              <br />
              Reach thousands of leaders.
            </h2>
            <p className="mt-4 text-text-secondary max-w-lg leading-relaxed">
              Join the Simvado Studio program and publish your training
              simulations on our marketplace. Integrate with our SDK, submit
              for review, and earn revenue from every completion.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                70% revenue share
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                Unreal & Unity SDKs
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                Full analytics dashboard
              </span>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/studio/apply"
                className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition shadow-lg shadow-brand-600/25 text-center"
              >
                Apply as a Studio
              </Link>
              <Link
                href="/docs"
                className="px-8 py-3.5 rounded-xl border border-border-default/50 text-text-secondary hover:text-text-primary hover:border-brand-500/50 font-medium transition text-center"
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
