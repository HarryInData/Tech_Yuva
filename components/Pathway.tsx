const STEPS = [
  {
    num: '01',
    title: 'Apply & Join',
    desc: 'Submit your GitHub profile, share your passion, and join the zero-fee builder community.',
  },
  {
    num: '02',
    title: 'Learn by Building',
    desc: 'AI bootcamps, systems engineering tracks, Web3 labs. No theory — pure production.',
  },
  {
    num: '03',
    title: 'Hack & Compete',
    desc: '36-hour hackathons, coding sprints, DropHack — solve real problems under pressure.',
  },
  {
    num: '04',
    title: 'Deploy & Scale',
    desc: 'Ship to production with cloud credits, hosting packs, and mentorship from practitioners.',
  },
  {
    num: '05',
    title: 'Launch & Fund',
    desc: 'PitchCraft Accelerator — angel reviews, funding, and startup incubation support.',
  },
];

export default function Pathway() {
  return (
    <section className="pathway-section" id="pathway">
      <div className="container">
        <div className="section-header reveal-up">
          <span className="section-eyebrow">Pathway</span>
          <h2 className="section-heading">The Builder Journey</h2>
          <p className="section-sub">
            From student to system architect — a cohort-based journey through real-world engineering.
          </p>
        </div>
        <div className="pathway-list">
          {STEPS.map((step, idx) => (
            <div key={step.num} style={{ display: 'contents' }}>
              <div className="path-step reveal-up">
                <span className="path-num">{step.num}</span>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
              {idx < STEPS.length - 1 && <div className="path-connector"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
