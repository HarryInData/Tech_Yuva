# Tech Yuva Event Asset Guidelines

This folder contains optimized media assets and photo galleries for Tech Yuva events and flagship hackathons.

## Directory Structure
```
public/events/
├── README.md
├── drophack-26/
│   ├── drophack-02-team.webp (Tech Yuva team at Paytm office reception, Noida)
│   ├── drophack-04-coding-floor.webp (10 hours of building)
│   ├── drophack-06-session.webp (Session with participants)
│   └── drophack-poster.webp
└── cyber-intelligence-workshop-26/
    ├── cyber-01-auditorium.webp (Full session at the Mini Auditorium)
    ├── cyber-03-memento.webp (Memento presentation)
    ├── cyber-04-group.webp (Group photo)
    └── cyber-intelligence-poster.webp (Workshop poster)
```

## Optimization Rules
- Format: WebP, max 1600px long side, under 250KB each
- Never crop faces or group members; maintain natural aspect ratios
- To re-optimize or convert newly uploaded JPG/PNG images:
```bash
npm run optimize:images
```
