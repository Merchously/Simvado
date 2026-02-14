import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const KB3D = (file: string) =>
  `https://kitbash3d.com/cdn/shop/files/${file}`;

async function main() {
  console.log("Seeding Simvado marketplace...\n");

  // 1. Seed user (platform admin / studio owner)
  const seedUser = await db.user.upsert({
    where: { clerkId: "seed_simvado_admin" },
    update: {},
    create: {
      clerkId: "seed_simvado_admin",
      email: "studio@simvado.com",
      name: "Simvado Studios",
      role: "platform_admin",
      subscriptionTier: "pro_annual",
    },
  });

  // 2. Simvado first-party studio
  const studio = await db.studio.upsert({
    where: { slug: "simvado" },
    update: {},
    create: {
      name: "Simvado",
      slug: "simvado",
      description:
        "First-party simulations by the Simvado team. Immersive, high-fidelity training experiences built with KitBash3D environments for maximum realism.",
      websiteUrl: "https://simvado.com",
      status: "approved",
      ownerId: seedUser.id,
      revenueSplitPercent: 100,
    },
  });

  await db.studioMember.upsert({
    where: {
      studioId_userId: { studioId: studio.id, userId: seedUser.id },
    },
    update: {},
    create: {
      studioId: studio.id,
      userId: seedUser.id,
      role: "owner",
    },
  });

  // 3. Simulations + Modules
  const simulations = [
    {
      title: "Operation Blackout",
      slug: "operation-blackout",
      description:
        "A coordinated cyberattack cripples a major financial institution. As the CISO, you must lead the incident response team through containment, forensic analysis, stakeholder communication, and recovery — all while the clock ticks and attackers probe deeper into the network.",
      category: "Cybersecurity",
      difficulty: "advanced" as const,
      format: "realtime_crisis" as const,
      thumbnailUrl: KB3D("CPI_WEB_POSTER_72f41b22-bd95-4e0c-9ed0-cc3fede96d75.png"),
      estimatedDurationMin: 90,
      skillTags: ["incident-response", "crisis-management", "cybersecurity", "leadership"],
      modules: [
        { title: "Initial Detection", slug: "initial-detection", sortOrder: 0, estimatedDurationMin: 20, isFreeDemo: true, narrativeContext: "Anomalous network traffic is detected at 2:47 AM. Your SOC team escalates to you. Assess the situation and activate the incident response plan.", platform: "unreal" as const },
        { title: "Containment Protocol", slug: "containment-protocol", sortOrder: 1, estimatedDurationMin: 25, isFreeDemo: false, narrativeContext: "The breach is spreading through lateral movement. Isolate compromised systems without disrupting critical banking operations.", platform: "unreal" as const },
        { title: "Stakeholder Communication", slug: "stakeholder-communication", sortOrder: 2, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "Regulators, the board, customers, and the media are demanding answers. Craft your communications strategy while managing legal exposure.", platform: "unreal" as const },
        { title: "Recovery & Post-Mortem", slug: "recovery-post-mortem", sortOrder: 3, estimatedDurationMin: 25, isFreeDemo: false, narrativeContext: "Restore operations and lead the post-incident review. Identify root causes, remediation steps, and present to the executive committee.", platform: "unreal" as const },
      ],
    },
    {
      title: "The Geneva Accord",
      slug: "the-geneva-accord",
      description:
        "Navigate a high-stakes multilateral summit where competing national interests threaten global stability. As the lead diplomat, you must balance alliances, manage secret back-channels, and forge consensus before the deadline — or risk international crisis.",
      category: "Diplomacy",
      difficulty: "executive" as const,
      format: "branching_narrative" as const,
      thumbnailUrl: KB3D("WDC_WEB_POSTER.png"),
      estimatedDurationMin: 120,
      skillTags: ["negotiation", "diplomacy", "geopolitics", "stakeholder-management"],
      modules: [
        { title: "Pre-Summit Intelligence", slug: "pre-summit-intelligence", sortOrder: 0, estimatedDurationMin: 25, isFreeDemo: true, narrativeContext: "Review classified briefings on each delegation's priorities, red lines, and internal politics. Develop your negotiation strategy.", platform: "unreal" as const },
        { title: "Opening Negotiations", slug: "opening-negotiations", sortOrder: 1, estimatedDurationMin: 30, isFreeDemo: false, narrativeContext: "The summit opens with posturing and power plays. Navigate the formal sessions while building trust in informal corridors.", platform: "unreal" as const },
        { title: "Crisis Escalation", slug: "crisis-escalation", sortOrder: 2, estimatedDurationMin: 35, isFreeDemo: false, narrativeContext: "A leaked document threatens to derail talks entirely. Manage the fallout and decide whether to push forward or regroup.", platform: "unreal" as const },
        { title: "Final Resolution", slug: "final-resolution", sortOrder: 3, estimatedDurationMin: 30, isFreeDemo: false, narrativeContext: "Time is running out. Forge the final accord or walk away. Every clause you negotiate will have real consequences for millions.", platform: "unreal" as const },
      ],
    },
    {
      title: "Fault Lines",
      slug: "fault-lines",
      description:
        "A 7.2 magnitude earthquake devastates a major metropolitan area. As the Emergency Management Director, coordinate first responders, allocate scarce resources, manage mass casualties, and communicate with a panicked public — all in real time.",
      category: "Crisis Management",
      difficulty: "advanced" as const,
      format: "realtime_crisis" as const,
      thumbnailUrl: KB3D("WRK_WEB_POSTER.png"),
      estimatedDurationMin: 80,
      skillTags: ["emergency-management", "resource-allocation", "triage", "crisis-communication"],
      modules: [
        { title: "The First 30 Minutes", slug: "first-30-minutes", sortOrder: 0, estimatedDurationMin: 20, isFreeDemo: true, narrativeContext: "Buildings are collapsing, communications are failing, and the scope of destruction is unknown. Establish command and begin triage.", platform: "unreal" as const },
        { title: "Search & Rescue", slug: "search-rescue", sortOrder: 1, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "Deploy search and rescue teams across the city. Prioritize sites based on survivor probability while managing team safety.", platform: "unreal" as const },
        { title: "Resource Allocation", slug: "resource-allocation", sortOrder: 2, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "Hospitals are overwhelmed, shelters are filling up, and supplies are running low. Make impossible choices about who gets what.", platform: "unreal" as const },
        { title: "Recovery Operations", slug: "recovery-operations", sortOrder: 3, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "Transition from emergency response to recovery. Manage public expectations, coordinate with federal agencies, and plan rebuilding.", platform: "unreal" as const },
      ],
    },
    {
      title: "Shadow Market",
      slug: "shadow-market",
      description:
        "Lead a multi-agency task force investigating an international arms trafficking network operating through underground black markets. Balance intelligence gathering, diplomatic sensitivities, and operational security in a race against the clock.",
      category: "Intelligence",
      difficulty: "advanced" as const,
      format: "ai_adaptive" as const,
      thumbnailUrl: KB3D("BMK_WEB_POSTER.png"),
      estimatedDurationMin: 100,
      skillTags: ["intelligence-analysis", "investigation", "strategic-thinking", "risk-assessment"],
      modules: [
        { title: "Intelligence Briefing", slug: "intelligence-briefing", sortOrder: 0, estimatedDurationMin: 20, isFreeDemo: true, narrativeContext: "Receive and analyze intelligence from multiple agencies. Identify key targets, connections, and the network's operational pattern.", platform: "unreal" as const },
        { title: "Undercover Operations", slug: "undercover-operations", sortOrder: 1, estimatedDurationMin: 30, isFreeDemo: false, narrativeContext: "Manage undercover assets in hostile territory. Every decision affects agent safety and intelligence quality.", platform: "unreal" as const },
        { title: "Network Analysis", slug: "network-analysis", sortOrder: 2, estimatedDurationMin: 25, isFreeDemo: false, narrativeContext: "Connect the dots across financial records, communications intercepts, and surveillance data. Map the full network before it goes dark.", platform: "unreal" as const },
        { title: "Takedown Operation", slug: "takedown-operation", sortOrder: 3, estimatedDurationMin: 25, isFreeDemo: false, narrativeContext: "Coordinate a synchronized multinational operation. Time it wrong and the network vanishes. Time it right and you dismantle it entirely.", platform: "unreal" as const },
      ],
    },
    {
      title: "Neon District",
      slug: "neon-district",
      description:
        "Govern a sprawling megacity in 2055 where mega-corporations, citizen collectives, and AI systems compete for power. Navigate the politics of a post-scarcity society where technology has solved old problems and created terrifying new ones.",
      category: "Leadership",
      difficulty: "executive" as const,
      format: "branching_narrative" as const,
      thumbnailUrl: KB3D("BTL_WEB_POSTER.png"),
      estimatedDurationMin: 110,
      skillTags: ["governance", "strategic-planning", "ethics", "change-management"],
      modules: [
        { title: "City Council Crisis", slug: "city-council-crisis", sortOrder: 0, estimatedDurationMin: 25, isFreeDemo: true, narrativeContext: "A rogue AI has been discovered managing critical infrastructure without authorization. The council is divided on how to respond.", platform: "unreal" as const },
        { title: "Corporate Confrontation", slug: "corporate-confrontation", sortOrder: 1, estimatedDurationMin: 30, isFreeDemo: false, narrativeContext: "The largest mega-corp threatens to relocate unless you approve their controversial biotech district. The economic stakes are enormous.", platform: "unreal" as const },
        { title: "Citizens' Uprising", slug: "citizens-uprising", sortOrder: 2, estimatedDurationMin: 30, isFreeDemo: false, narrativeContext: "A populist movement is growing in the lower districts. Their demands are reasonable, but their methods are escalating. Find a path forward.", platform: "unreal" as const },
        { title: "New Order", slug: "new-order", sortOrder: 3, estimatedDurationMin: 25, isFreeDemo: false, narrativeContext: "Every decision you've made converges. Shape the future governance model of the city and set a precedent for the rest of the world.", platform: "unreal" as const },
      ],
    },
    {
      title: "Rising Sun Protocol",
      slug: "rising-sun-protocol",
      description:
        "Close a critical technology partnership in Tokyo while navigating complex cultural dynamics, competing corporate interests, and your own team's blind spots. One cultural misstep could cost your company billions.",
      category: "Business",
      difficulty: "intermediate" as const,
      format: "branching_narrative" as const,
      thumbnailUrl: KB3D("JPN_WEB_POSTER.png"),
      estimatedDurationMin: 75,
      skillTags: ["cross-cultural", "negotiation", "business-development", "emotional-intelligence"],
      modules: [
        { title: "Cultural Briefing", slug: "cultural-briefing", sortOrder: 0, estimatedDurationMin: 15, isFreeDemo: true, narrativeContext: "Prepare for the partnership meetings. Study cultural protocols, review your counterparts' backgrounds, and align your team.", platform: "unreal" as const },
        { title: "First Meeting", slug: "first-meeting", sortOrder: 1, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "The formal introduction meeting sets the tone for everything. Navigate the protocol, build rapport, and read between the lines.", platform: "unreal" as const },
        { title: "Stakeholder Dinner", slug: "stakeholder-dinner", sortOrder: 2, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "An informal dinner reveals the real concerns. Navigate social dynamics, build trust, and lay the groundwork for the final deal.", platform: "unreal" as const },
        { title: "Final Negotiations", slug: "final-negotiations", sortOrder: 3, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "Close the deal. Every term you negotiate reflects the relationship you've built — or failed to build — throughout the process.", platform: "unreal" as const },
      ],
    },
    {
      title: "The Iron Gambit",
      slug: "the-iron-gambit",
      description:
        "A catastrophic failure at a petrochemical refinery threatens an environmental disaster and the lives of hundreds of workers. As the Plant Emergency Coordinator, you must lead the crisis response while managing regulatory, media, and community pressure.",
      category: "Crisis Management",
      difficulty: "advanced" as const,
      format: "realtime_crisis" as const,
      thumbnailUrl: KB3D("RFS_WEB_POSTER.png"),
      estimatedDurationMin: 85,
      skillTags: ["industrial-safety", "crisis-response", "environmental", "regulatory-compliance"],
      modules: [
        { title: "Incident Alert", slug: "incident-alert", sortOrder: 0, estimatedDurationMin: 20, isFreeDemo: true, narrativeContext: "Alarms sound across the facility. Initial reports are confused and contradictory. Assess the situation and activate emergency protocols.", platform: "unreal" as const },
        { title: "Evacuation Protocol", slug: "evacuation-protocol", sortOrder: 1, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "Evacuate the facility while rescue teams work to contain the incident. Some workers are unaccounted for. Every minute counts.", platform: "unreal" as const },
        { title: "Environmental Containment", slug: "environmental-containment", sortOrder: 2, estimatedDurationMin: 25, isFreeDemo: false, narrativeContext: "A chemical plume is moving toward residential areas. Coordinate with environmental agencies and make decisions about shelter-in-place vs. evacuation.", platform: "unreal" as const },
        { title: "Public Communication", slug: "public-communication", sortOrder: 3, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "Face the media, regulators, and the community. Your communication will define the narrative and legal exposure for years to come.", platform: "unreal" as const },
      ],
    },
    {
      title: "Havana Crossroads",
      slug: "havana-crossroads",
      description:
        "Step into the tense world of Cold War diplomacy in 1960s Havana. As a diplomatic envoy caught between superpowers, every conversation is a potential intelligence asset and every misstep could escalate to nuclear confrontation.",
      category: "Diplomacy",
      difficulty: "executive" as const,
      format: "branching_narrative" as const,
      thumbnailUrl: KB3D("HAN_WEB_POSTER.png"),
      estimatedDurationMin: 95,
      skillTags: ["diplomacy", "intelligence", "historical-analysis", "decision-making"],
      modules: [
        { title: "Arrival & Assessment", slug: "arrival-assessment", sortOrder: 0, estimatedDurationMin: 20, isFreeDemo: true, narrativeContext: "You arrive in Havana with official cover. Assess the political landscape, identify key players, and establish your operating environment.", platform: "unreal" as const },
        { title: "Embassy Operations", slug: "embassy-operations", sortOrder: 1, estimatedDurationMin: 25, isFreeDemo: false, narrativeContext: "Navigate the complex web of embassy politics, local contacts, and competing intelligence agencies. Trust is your most valuable and dangerous currency.", platform: "unreal" as const },
        { title: "Secret Negotiations", slug: "secret-negotiations", sortOrder: 2, estimatedDurationMin: 25, isFreeDemo: false, narrativeContext: "A secret back-channel opens. The stakes couldn't be higher — you're negotiating outside official channels with potential consequences for global peace.", platform: "unreal" as const },
        { title: "The Resolution", slug: "the-resolution", sortOrder: 3, estimatedDurationMin: 25, isFreeDemo: false, narrativeContext: "Events are accelerating beyond anyone's control. Make your final move — the outcome could prevent or trigger the next global crisis.", platform: "unreal" as const },
      ],
    },
    {
      title: "Abyss Station",
      slug: "abyss-station",
      description:
        "A catastrophic systems failure at a deep-sea research station 3,000 meters below the surface puts 47 crew members at risk. Direct the crisis response from Mission Control as pressure, oxygen, and time work against you.",
      category: "Crisis Management",
      difficulty: "advanced" as const,
      format: "realtime_crisis" as const,
      thumbnailUrl: KB3D("ATL_WEB_POSTER.png"),
      estimatedDurationMin: 70,
      skillTags: ["crisis-management", "decision-making", "resource-management", "team-coordination"],
      modules: [
        { title: "Systems Failure", slug: "systems-failure", sortOrder: 0, estimatedDurationMin: 15, isFreeDemo: true, narrativeContext: "Multiple systems go offline simultaneously. Telemetry is intermittent. Determine what happened and assess the threat to the crew.", platform: "unreal" as const },
        { title: "Crew Rescue", slug: "crew-rescue", sortOrder: 1, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "The station is compartmentalized. Some sections are flooding, others are losing atmosphere. Prioritize rescue operations across the facility.", platform: "unreal" as const },
        { title: "Pressure Management", slug: "pressure-management", sortOrder: 2, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "A structural breach threatens to cascade. Manage pressure differentials, life support, and crew morale while awaiting surface support.", platform: "unreal" as const },
        { title: "Surface Protocol", slug: "surface-protocol", sortOrder: 3, estimatedDurationMin: 15, isFreeDemo: false, narrativeContext: "Coordinate the emergency ascent. Decompression protocols, medical triage, and the final evacuation sequence must be flawless.", platform: "unreal" as const },
      ],
    },
    {
      title: "Digital Fortress",
      slug: "digital-fortress",
      description:
        "Your company discovers a massive data breach affecting 12 million customers. Lead the cross-functional response across legal, technical, communications, and executive teams. Every hour of delay costs $2.4 million in regulatory exposure.",
      category: "Cybersecurity",
      difficulty: "intermediate" as const,
      format: "ai_adaptive" as const,
      thumbnailUrl: KB3D("NOF_WEB_POSTER.png"),
      estimatedDurationMin: 80,
      skillTags: ["data-breach", "compliance", "crisis-communication", "cross-functional-leadership"],
      modules: [
        { title: "Breach Discovery", slug: "breach-discovery", sortOrder: 0, estimatedDurationMin: 20, isFreeDemo: true, narrativeContext: "The security team discovers unauthorized access to customer databases. Assess the scope, determine the attack vector, and initiate the response plan.", platform: "unreal" as const },
        { title: "Legal & Compliance", slug: "legal-compliance", sortOrder: 1, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "GDPR, CCPA, and sector-specific regulations impose strict notification timelines. Work with legal to navigate the regulatory landscape while the investigation continues.", platform: "unreal" as const },
        { title: "Technical Containment", slug: "technical-containment", sortOrder: 2, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "Plug the breach without alerting the attackers or disrupting service. Preserve forensic evidence while securing systems against continued exploitation.", platform: "unreal" as const },
        { title: "Public Response", slug: "public-response", sortOrder: 3, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "Draft the public disclosure, prepare the CEO for press conferences, and launch the customer notification campaign. Your response defines the company's future.", platform: "unreal" as const },
      ],
    },
    {
      title: "Spice Routes",
      slug: "spice-routes",
      description:
        "Establish your company's first operations in New Delhi's dynamic commercial landscape. Navigate regulatory complexity, build local partnerships, understand cultural nuances, and outmaneuver competitors in one of the world's fastest-growing markets.",
      category: "Business",
      difficulty: "intermediate" as const,
      format: "branching_narrative" as const,
      thumbnailUrl: KB3D("NWD_WEB_POSTER.png"),
      estimatedDurationMin: 70,
      skillTags: ["emerging-markets", "market-entry", "cultural-intelligence", "business-strategy"],
      modules: [
        { title: "Market Research", slug: "market-research", sortOrder: 0, estimatedDurationMin: 15, isFreeDemo: true, narrativeContext: "Analyze the competitive landscape, regulatory environment, and consumer behavior in the target market. Develop your entry strategy.", platform: "unreal" as const },
        { title: "Regulatory Navigation", slug: "regulatory-navigation", sortOrder: 1, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "The regulatory environment is complex and opaque. Navigate licensing, permits, and compliance requirements while avoiding costly delays.", platform: "unreal" as const },
        { title: "Partnership Building", slug: "partnership-building", sortOrder: 2, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "Identify and vet potential local partners. Build relationships, negotiate terms, and align on a shared vision for market entry.", platform: "unreal" as const },
        { title: "Launch Strategy", slug: "launch-strategy", sortOrder: 3, estimatedDurationMin: 15, isFreeDemo: false, narrativeContext: "Execute your market entry. Coordinate the launch across operations, marketing, and sales. Every decision from here shapes your long-term position.", platform: "unreal" as const },
      ],
    },
    {
      title: "Phantom Protocol",
      slug: "phantom-protocol",
      description:
        "A classified government research facility reports unexplained phenomena that defy conventional explanation. As the incident commander, manage the response under extreme uncertainty, psychological pressure, and the weight of decisions that could reshape our understanding of reality.",
      category: "Crisis Management",
      difficulty: "executive" as const,
      format: "ai_adaptive" as const,
      thumbnailUrl: KB3D("GHR_WEB_POSTER.png"),
      estimatedDurationMin: 90,
      skillTags: ["uncertainty-management", "psychological-resilience", "decision-making", "leadership"],
      modules: [
        { title: "Initial Report", slug: "initial-report", sortOrder: 0, estimatedDurationMin: 20, isFreeDemo: true, narrativeContext: "Receive the classified briefing. The reports are credible but impossible. Assemble your team and establish the response framework.", platform: "unreal" as const },
        { title: "Site Assessment", slug: "site-assessment", sortOrder: 1, estimatedDurationMin: 25, isFreeDemo: false, narrativeContext: "Arrive at the facility. What you encounter challenges everything you thought you knew. Maintain operational discipline while your team's confidence wavers.", platform: "unreal" as const },
        { title: "Containment Measures", slug: "containment-measures", sortOrder: 2, estimatedDurationMin: 25, isFreeDemo: false, narrativeContext: "Standard protocols don't apply. Improvise containment strategies while managing information security and team psychology.", platform: "unreal" as const },
        { title: "Debrief & Analysis", slug: "debrief-analysis", sortOrder: 3, estimatedDurationMin: 20, isFreeDemo: false, narrativeContext: "Debrief your team, compile findings, and present recommendations to senior leadership. What you report will determine the government's response.", platform: "unreal" as const },
      ],
    },
  ];

  const now = new Date();

  for (let i = 0; i < simulations.length; i++) {
    const sim = simulations[i];
    const publishedAt = new Date(now.getTime() - i * 3 * 24 * 60 * 60 * 1000); // stagger by 3 days

    const created = await db.simulation.upsert({
      where: { slug: sim.slug },
      update: {
        title: sim.title,
        description: sim.description,
        category: sim.category,
        difficulty: sim.difficulty,
        format: sim.format,
        thumbnailUrl: sim.thumbnailUrl,
        estimatedDurationMin: sim.estimatedDurationMin,
        skillTags: sim.skillTags,
        status: "published",
        publishedAt,
        studioId: studio.id,
        authorId: seedUser.id,
      },
      create: {
        title: sim.title,
        slug: sim.slug,
        description: sim.description,
        category: sim.category,
        difficulty: sim.difficulty,
        format: sim.format,
        thumbnailUrl: sim.thumbnailUrl,
        estimatedDurationMin: sim.estimatedDurationMin,
        skillTags: sim.skillTags,
        status: "published",
        publishedAt,
        studioId: studio.id,
        authorId: seedUser.id,
      },
    });

    // Delete existing modules and re-create (for idempotency)
    await db.module.deleteMany({ where: { simulationId: created.id } });

    for (const mod of sim.modules) {
      await db.module.create({
        data: {
          simulationId: created.id,
          title: mod.title,
          slug: mod.slug,
          sortOrder: mod.sortOrder,
          estimatedDurationMin: mod.estimatedDurationMin,
          isFreeDemo: mod.isFreeDemo,
          narrativeContext: mod.narrativeContext,
          platform: mod.platform,
          status: "published",
        },
      });
    }

    console.log(`  Created: ${sim.title} (${sim.modules.length} modules)`);
  }

  // 4. Promote any real user with a matching email to platform_admin + pro
  const realAdmin = await db.user.findFirst({
    where: {
      email: { not: "studio@simvado.com" },
      clerkId: { not: "seed_simvado_admin" },
    },
    orderBy: { createdAt: "asc" },
  });

  if (realAdmin) {
    await db.user.update({
      where: { id: realAdmin.id },
      data: { role: "platform_admin", subscriptionTier: "pro_annual" },
    });
    console.log(`\n  Promoted ${realAdmin.email} to platform_admin + pro_annual`);
  }

  console.log(`\nDone! Seeded ${simulations.length} simulations with ${simulations.reduce((acc, s) => acc + s.modules.length, 0)} total modules.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
