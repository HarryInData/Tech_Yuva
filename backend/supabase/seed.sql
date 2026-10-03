-- ============================================================================
-- TECH YUVA DATABASE SEED SCRIPT
-- Run this in the Supabase SQL Editor to seed sample data
-- ============================================================================

-- 1. Insert Active Cohort ("Admission Open · New Cohort 2026")
INSERT INTO public.cohorts (
    id,
    name,
    code,
    year,
    badge_label,
    description,
    is_admissions_open,
    start_date,
    end_date,
    application_deadline,
    max_capacity,
    accepted_count
) VALUES (
    'c0000000-0000-0000-0000-000000002026',
    'New Cohort 2026',
    'cohort-2026',
    2026,
    'Admission Open · New Cohort 2026',
    'Student-led technology and innovation guild cohort. Build real systems, ship production code, participate in hackathons, and launch venture prototypes.',
    true,
    '2026-09-01',
    '2027-06-30',
    '2026-10-31 23:59:59+00',
    300,
    145
) ON CONFLICT (code) DO UPDATE
SET 
    is_admissions_open = EXCLUDED.is_admissions_open,
    badge_label = EXCLUDED.badge_label;

-- 2. Insert Events (DropHack'26 + Workshops)
INSERT INTO public.events (
    id,
    title,
    slug,
    tagline,
    description,
    date,
    duration,
    mode,
    venue,
    capacity,
    registered_count,
    banner_url,
    prize_pool,
    team_size,
    themes,
    stages,
    registration_link,
    status,
    is_featured
) VALUES 
(
    'e0000000-0000-0000-0000-000000000001',
    'DropHack''26',
    'drophack-26',
    'Unknown Problems. Unstoppable Minds. 10 Hours. Zero Excuses.',
    'SIEC Community Hackathon with Tech Yuva as Community Partner. 10 hours offline, 5 tracks, intense problem solving, fast deployment, and ₹50,000+ prize pool.',
    '2026-08-29 09:00:00+00',
    '10 Hours Offline',
    'offline',
    'Paytm Office, Noida',
    200,
    188,
    '/assets/drophack.png',
    '₹50,000+',
    '2–4 Members',
    ARRAY['FinTech', 'AI', 'Web3', 'Cybersecurity', 'Healthcare'],
    '[
        {"stage": 1, "name": "Online Qualifier", "date": "15 Aug 2026"},
        {"stage": 2, "name": "Offline Finale", "date": "29 Aug 2026"}
    ]'::jsonb,
    null,
    'past',
    true
),
(
    'e0000000-0000-0000-0000-000000000000',
    'Workshop on "Cyber Intelligence & Digital Defence"',
    'cyber-intelligence-workshop-26',
    'Analyze. Detect. Protect.',
    'A workshop on how Open Source Intelligence (OSINT) strengthens Dark Web investigations and intelligence-driven cybercrime detection with Vikas Kumar.',
    '2026-09-23 14:00:00+05:30',
    '1.5 Hours',
    'offline',
    'Mini Auditorium IMS Ghaziabad',
    150,
    150,
    '/events/cyber-intelligence-workshop-26/cyber-intelligence-poster.webp',
    null,
    null,
    ARRAY['OSINT', 'Dark Web Investigations', 'Threat Actor Profiling', 'Digital Forensics', 'OPSEC'],
    '[]'::jsonb,
    null,
    'past',
    true
),
(
    'e0000000-0000-0000-0000-000000000002',
    'Production Systems & Scalable APIs Bootcamp',
    'production-systems-bootcamp',
    'Architecting high-concurrency microservices, caching, and database scaling.',
    'Hands-on engineering workshop where students build production-grade backends using Node.js, PostgreSQL, Redis, and Docker. Zero toy projects.',
    '2026-10-15 14:00:00+00',
    '4 Hours Hands-on',
    'hybrid',
    'Tech Yuva Discord HQ / Delhi Lab',
    120,
    64,
    null,
    'Certificates & Cloud Packs',
    'Individual',
    ARRAY['Backend', 'PostgreSQL', 'Docker', 'Systems Architecture'],
    '[{"stage": 1, "name": "Live Coding & Architecture Review", "date": "15 Oct 2026"}]'::jsonb,
    null,
    'upcoming',
    false
),
(
    'e0000000-0000-0000-0000-000000000003',
    'Autonomous AI Agents & LLM Embeddings Lab',
    'ai-agents-llm-embeddings',
    'Build and deploy real multi-agent workflows with tool use and vector search.',
    'Deep dive into generative AI architectures, retrieval-augmented generation (RAG), vector databases, and agentic workflows.',
    '2026-11-05 15:00:00+00',
    '3 Hours Live',
    'online',
    'Google Meet / Discord Stage',
    250,
    112,
    null,
    'Cloud API Credits',
    'Individual / Duo',
    ARRAY['AI', 'LLMs', 'Vector Search', 'Agents'],
    '[{"stage": 1, "name": "Live Workshop & Project Submission", "date": "05 Nov 2026"}]'::jsonb,
    null,
    'upcoming',
    false
)
ON CONFLICT (slug) DO UPDATE
SET 
    title = EXCLUDED.title,
    date = EXCLUDED.date,
    status = EXCLUDED.status;

-- 3. Seed System Metrics (Baseline impact counters)
INSERT INTO public.system_metrics (key, numeric_value, label, display_suffix)
VALUES 
    ('active_members', 500, 'Active Members', '+'),
    ('events_hosted', 20, 'Events Hosted', '+'),
    ('prototypes_built', 80, 'Prototypes Built', '+'),
    ('builders_impacted', 1000, 'Builders Impacted', '+')
ON CONFLICT (key) DO UPDATE
SET 
    numeric_value = EXCLUDED.numeric_value,
    label = EXCLUDED.label;

-- 4. Seed Announcements
INSERT INTO public.announcements (
    id,
    title,
    slug,
    content,
    category,
    is_pinned
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Admissions Open for New Cohort 2026',
    'admissions-open-2026',
    'Welcome prospective builders! Applications are now officially open for our 2026 cohort. We are accepting applications across AI, Web3, Systems, and Cybersecurity tracks.',
    'Cohort',
    true
) ON CONFLICT (slug) DO NOTHING;
