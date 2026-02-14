import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developer Docs — Simvado",
  description: "Integrate your game engine with Simvado's platform API.",
};

const guides = [
  {
    title: "API Reference",
    description:
      "Complete reference for the Game Engine API: authentication, session management, event reporting, and completion.",
    href: "/docs/api",
  },
  {
    title: "Unreal Engine",
    description:
      "Step-by-step integration guide with C++ code examples for Unreal Engine 5.",
    href: "/docs/unreal",
  },
  {
    title: "Unity",
    description:
      "Integration guide with C# MonoBehaviour examples for Unity 2022+.",
    href: "/docs/unity",
  },
];

export default function DocsPage() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-16">
          <p className="text-sm font-medium text-brand-400 mb-3 tracking-wide uppercase">
            Developer Documentation
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Integrate with Simvado
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl">
            Connect your Unreal Engine or Unity simulation to Simvado&apos;s
            platform. Track sessions, report events, and generate AI-powered
            debriefs automatically.
          </p>
        </div>

        {/* Quick start */}
        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-8 mb-12">
          <h2 className="text-xl font-semibold mb-6">Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-brand-600 text-white text-sm font-bold mb-3">
                1
              </span>
              <h3 className="font-medium">Get an API Key</h3>
              <p className="mt-1 text-sm text-text-muted">
                Generate a key from the Admin panel under API Keys.
              </p>
            </div>
            <div>
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-brand-600 text-white text-sm font-bold mb-3">
                2
              </span>
              <h3 className="font-medium">Create a Session</h3>
              <p className="mt-1 text-sm text-text-muted">
                POST to /api/game/sessions when the player starts.
              </p>
            </div>
            <div>
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-brand-600 text-white text-sm font-bold mb-3">
                3
              </span>
              <h3 className="font-medium">Report &amp; Complete</h3>
              <p className="mt-1 text-sm text-text-muted">
                Send events during gameplay and POST final scores on completion.
              </p>
            </div>
          </div>
        </div>

        {/* Guide cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group rounded-2xl border border-border-subtle bg-surface-raised p-6 hover:border-brand-600/50 transition"
            >
              <h3 className="text-lg font-semibold group-hover:text-brand-300 transition">
                {guide.title}
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                {guide.description}
              </p>
            </Link>
          ))}
        </div>

        {/* SDK downloads */}
        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-8">
          <h2 className="text-xl font-semibold mb-4">SDK Downloads</h2>
          <p className="text-sm text-text-muted mb-4">
            Drop-in wrapper classes for your game engine.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/sdk/SimvadoClient.h"
              download
              className="px-4 py-2 rounded-lg border border-border-default text-sm font-medium text-text-secondary hover:text-text-primary hover:border-brand-600/50 transition"
            >
              SimvadoClient.h (C++)
            </a>
            <a
              href="/sdk/SimvadoClient.cs"
              download
              className="px-4 py-2 rounded-lg border border-border-default text-sm font-medium text-text-secondary hover:text-text-primary hover:border-brand-600/50 transition"
            >
              SimvadoClient.cs (C#)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
