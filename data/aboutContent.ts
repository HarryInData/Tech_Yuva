/**
 * TECH YUVA — ABOUT & MISSION SECTION CONTENT
 * 
 * Single source of truth for all copy in the Enhanced About + Mission experience.
 * Edit this file to update text, quotes, or timeline steps without touching components.
 */

export interface PillarItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export interface WhatWeDoItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  desc: string;
}

export const aboutContent = {
  // BLOCK 1 — INTRO / HEADER
  intro: {
    eyebrow: 'ABOUT TECH YUVA',
    heading: 'Where Youth Meet to Build Future Tech',
    badge: '500+ Active Members',
    subheadingPrefix: 'Tech Yuva is a student-led innovation guild empowering young developers to launch real production systems, not just tutorial projects.',
    body: 'We move students from tutorial hell to real production deployments, client architectures, and high-stakes hackathons. Powered by AI, Web3, cyber security, and a high-performance startup culture, Tech Yuva is where ambitious young builders come together, learn by shipping, and grow into the developers who shape what comes next.',
  },

  // BLOCK 2 — OUR MISSION (Feature Statement)
  mission: {
    label: 'OUR MISSION',
    statement:
      'To turn curious students into confident builders, through real projects, real deployments, and a community that builds alongside them.',
    pillars: [
      {
        id: 'ship-real',
        icon: 'rocket',
        title: 'Ship Real Systems',
        desc: 'Move beyond generic todo apps into production-grade projects with real launch exposure.',
      },
      {
        id: 'build-secure',
        icon: 'shield',
        title: 'Build Securely',
        desc: 'Learn to launch software the right way, with security and quality built in from day one.',
      },
      {
        id: 'grow-together',
        icon: 'users',
        title: 'Grow Together',
        desc: 'A guild culture of peers, mentors, and builders who deploy alongside each other.',
      },
    ] as PillarItem[],
  },

  // BLOCK 3 — THE PROBLEM WE SAW (Vision Quote)
  quote: {
    label: 'WHY TECH YUVA EXISTS',
    quoteBody:
      'I observed hundreds of brilliant young developers stuck in tutorial hell, spending hours building identical generic todo apps with zero actual production launch exposure. Tech Yuva was created to smash those constraints.',
    quoteHighlight: "We don't teach. We deploy alongside you.",
    author: 'Lakshay Soni',
    role: 'Visionary Council Lead',
  },

  // BLOCK 4 — FROM TUTORIAL HELL TO PRODUCTION (Before / After)
  contrast: {
    title: 'THE PARADIGM SHIFT',
    before: {
      tag: 'Tutorial Hell',
      points: [
        'Watching endless tutorials',
        'Building generic todo apps',
        'No real launch exposure',
        'Learning alone',
      ],
    },
    after: {
      tag: 'The Tech Yuva Way',
      points: [
        'Shipping real projects',
        'Production deployments',
        'Client-style architectures',
        'High-stakes hackathons',
        'Building with a guild',
      ],
    },
  },

  // BLOCK 5 — WHAT WE DO
  whatWeDo: {
    label: 'WHAT WE DO',
    heading: 'Engineered for Real Execution',
    items: [
      {
        id: 'build',
        title: 'Build',
        desc: 'Ship real production systems and client-style projects, not throwaway demos.',
        icon: 'terminal',
      },
      {
        id: 'learn',
        title: 'Learn',
        desc: 'Hands-on workshops across AI, Web3, and cyber security.',
        icon: 'cpu',
      },
      {
        id: 'compete',
        title: 'Compete',
        desc: 'Take on hackathons and high-stakes challenges that sharpen real skills.',
        icon: 'zap',
      },
      {
        id: 'grow',
        title: 'Grow',
        desc: 'Join a startup-minded community of builders, mentors, and future founders.',
        icon: 'trending',
      },
    ] as WhatWeDoItem[],
  },

  // BLOCK 6 — HOW IT WORKS (Timeline)
  howItWorks: {
    label: 'HOW IT WORKS',
    heading: 'Your Path From Learner to Shipper',
    steps: [
      {
        step: '01',
        title: 'Join the Guild',
        desc: 'Enroll in the community and get onboarded.',
      },
      {
        step: '02',
        title: 'Learn by Building',
        desc: 'Pick a track and start working on real projects.',
      },
      {
        step: '03',
        title: 'Deploy Together',
        desc: 'Launch alongside peers and mentors.',
      },
      {
        step: '04',
        title: 'Showcase and Grow',
        desc: 'Present your work, enter hackathons, and level up.',
      },
    ] as HowItWorksStep[],
  },

  // BLOCK 7 — IMPACT STRIP
  impact: {
    count: 500,
    suffix: '+',
    label: 'Students Impacted / Active Members',
    subtext: 'Building production-grade software together across Delhi NCR and beyond.',
  },

  // BLOCK 8 — CLOSING CALL TO ACTION
  cta: {
    heading: 'Ready to Build the Future With Us?',
    text: 'Join Tech Yuva and start shipping real projects with a community that deploys alongside you.',
    buttonLabel: 'Join Community',
  },
};
