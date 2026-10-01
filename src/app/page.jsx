import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChartNoAxesCombined,
  Code2,
  Flame,
  FolderKanban,
  GitBranch,
  Languages,
  ListTodo,
  NotebookPen,
  Sparkles,
  Timer,
} from "lucide-react";

const features = [
  {
    title: "Projects with context",
    description:
      "Keep milestones, decisions, and the small next steps connected to the work they belong to.",
    icon: FolderKanban,
    href: "/projects",
    tone: "violet",
  },
  {
    title: "A clear next step",
    description:
      "Turn a busy project into a short task list you can actually move through.",
    icon: ListTodo,
    href: "/tasks",
    tone: "blue",
  },
  {
    title: "Focus that counts",
    description:
      "Start a session for a project or task, then see your time add up over the week.",
    icon: Timer,
    href: "/focus",
    tone: "amber",
  },
  {
    title: "Language, in small doses",
    description:
      "Practice a handful of useful words each day and keep track of the ones to revisit.",
    icon: Languages,
    href: "/languages",
    tone: "green",
  },
  {
    title: "Notes that stay close",
    description:
      "Save a code detail, a useful phrase, or an idea before it slips away.",
    icon: NotebookPen,
    href: "/notes",
    tone: "rose",
  },
  {
    title: "Progress you can see",
    description:
      "Look back on focus time, project movement, and the days you showed up to learn.",
    icon: ChartNoAxesCombined,
    href: "/analytics",
    tone: "cyan",
  },
];

const rhythm = [
  { title: "Capture", detail: "Keep the thought", icon: NotebookPen },
  { title: "Plan", detail: "Choose one next step", icon: ListTodo },
  { title: "Focus", detail: "Give it your attention", icon: Timer },
  { title: "Learn", detail: "Practice a little", icon: BookOpen },
  { title: "Reflect", detail: "Notice the progress", icon: ChartNoAxesCombined },
];

export default function HomePage() {
  return (
    <main className="landing-page marketing-page">
      <header className="landing-header">
        <Link className="brand" href="/" aria-label="DevFlow home">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">devflow</span>
        </Link>
        <span className="landing-header-note">A workspace for the work and the learning.</span>
        <a
          className="landing-github"
          href="https://github.com/atef7534/DevFlow"
          target="_blank"
          rel="noreferrer"
        >
          <GitBranch size={14} /> GitHub <ArrowUpRight size={13} />
        </a>
        <Link className="landing-login" href="/signin">
          Sign in <ArrowRight size={14} />
        </Link>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy">
          <div className="landing-kicker">
            <span className="online-dot" /> ONE CALM SPACE TO MAKE PROGRESS
          </div>
          <h1 id="landing-title">
            Build at your pace.<br />
            <span>Stay in your flow.</span>
          </h1>
          <p>
            Plan the software you’re building, focus without distraction, and
            keep language learning moving — all in one thoughtful workspace.
          </p>
          <div className="landing-actions">
            <div className="landing-primary-actions">
              <Link href="/today" className="button button-primary button-lg">
                Get started free <ArrowRight size={16} />
              </Link>
              <Link href="#flow" className="button button-secondary button-lg">
                See how it works
              </Link>
            </div>
            <span><Check size={14} /> No account needed to start. Your data stays on this device.</span>
          </div>
        </div>

        <div className="preview-window" aria-label="Preview of the DevFlow workspace">
          <div className="preview-top">
            <span className="preview-dot" /><span className="preview-dot" />
            <span className="preview-dot" /><span className="preview-address">devflow / today</span>
            <span className="preview-mini-mark">d</span>
          </div>
          <div className="preview-body">
            <div className="preview-rail"><span className="preview-logo">d</span><i className="selected" /><i /><i /><i /><i /><i /></div>
            <div className="preview-content">
              <div className="preview-greeting">
                <small>A SMALL PLAN FOR TODAY</small>
                <b>Good morning, Atif.</b>
                <span>A little progress, every day.</span>
              </div>
              <div className="preview-metrics">
                <div><small>FOCUS</small><b>42 <em>min</em></b></div>
                <div><small>TO LEARN</small><b>5 <em>words</em></b></div>
                <div><small>TO SHIP</small><b>3 <em>tasks</em></b></div>
              </div>
              <div className="preview-panels">
                <div className="preview-panel preview-task-panel">
                  <div className="preview-panel-head"><span><Code2 size={13} /> IN MOTION</span><small>View all ↗</small></div>
                  <strong>Interactive Comments Section</strong>
                  <div className="preview-task"><span className="preview-check"><Check size={10} /></span>Build the reply state <i>Today</i></div>
                  <div className="preview-task"><span className="preview-check empty" />Review mobile layout <i>Tomorrow</i></div>
                  <div className="preview-progress"><span /></div>
                  <small className="preview-caption">8 of 12 things done</small>
                </div>
                <div className="preview-panel preview-word-panel">
                  <div className="preview-panel-head"><span><BookOpen size={13} /> GERMAN · A2</span><Flame size={13} className="preview-flame" /></div>
                  <div className="preview-word">behalten</div>
                  <div className="preview-pos">verb · to keep, to hold on to</div>
                  <p>„Ich möchte dieses Buch behalten.“</p>
                  <div className="preview-word-actions"><span>01 / 05</span><b>Know this word <ArrowRight size={11} /></b></div>
                </div>
              </div>
              <div className="preview-focus"><span><Timer size={13} /> A little focus goes a long way.</span><strong>25:00 <i>Start a session</i></strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-rhythms" aria-label="DevFlow at a glance">
        <div className="landing-rhythm-intro"><span>ONE WORKSPACE</span><strong>Four useful rhythms.</strong></div>
        <div className="landing-rhythm-item"><Code2 size={16} /><span><strong>Build</strong><small>Projects and tasks</small></span></div>
        <div className="landing-rhythm-item"><Timer size={16} /><span><strong>Focus</strong><small>Sessions with intent</small></span></div>
        <div className="landing-rhythm-item"><BookOpen size={16} /><span><strong>Learn</strong><small>Daily vocabulary</small></span></div>
        <div className="landing-rhythm-item"><Sparkles size={16} /><span><strong>Reflect</strong><small>Notes and progress</small></span></div>
      </section>

      <section className="landing-section" id="features" aria-labelledby="features-title">
        <div className="landing-section-heading">
          <div>
            <div className="eyebrow">MADE FOR THE LONG GAME</div>
            <h2 id="features-title">Everything you need, in one flow.</h2>
          </div>
          <p>Useful tools that stay connected, so your attention can stay on the work.</p>
        </div>
        <div className="landing-feature-grid">
          {features.map(({ title, description, icon: Icon, href, tone }, index) => (
            <Link className={`landing-feature-card tone-${tone}`} href={href} key={title} style={{ "--feature-index": index }}>
              <span className="landing-feature-icon"><Icon size={18} strokeWidth={1.8} /></span>
              <span className="landing-feature-copy"><strong>{title}</strong><small>{description}</small></span>
              <ArrowUpRight className="landing-feature-arrow" size={16} />
            </Link>
          ))}
        </div>
      </section>

      <section className="landing-flow-section" id="flow" aria-labelledby="flow-title">
        <div className="landing-section-heading">
          <div>
            <div className="eyebrow">FROM THOUGHT TO DONE</div>
            <h2 id="flow-title">A steadier way to move forward.</h2>
          </div>
          <p>Start small. Carry your context with you. Come back tomorrow with a little more momentum.</p>
        </div>
        <div className="landing-flow">
          {rhythm.map(({ title, detail, icon: Icon }, index) => (
            <div className="landing-flow-step" key={title} style={{ "--step-index": index }}>
              <span className="landing-flow-icon"><Icon size={17} /></span>
              <span className="landing-flow-copy"><strong>{title}</strong><small>{detail}</small></span>
              {index < rhythm.length - 1 && <ArrowRight className="landing-flow-arrow" size={15} />}
            </div>
          ))}
        </div>
      </section>

      <section className="landing-final-cta">
        <div className="landing-final-glow" />
        <div className="landing-final-copy">
          <span className="eyebrow">YOUR NEXT GOOD SESSION STARTS HERE</span>
          <h2>Ready to find your flow?</h2>
          <p>Open your workspace and make room for the next small win.</p>
        </div>
        <Link href="/today" className="button button-primary button-lg">
          Open DevFlow <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="landing-footer">
        <span>Build software. Learn languages. Track your progress.</span>
        <a href="https://github.com/atef7534/DevFlow" target="_blank" rel="noreferrer">
          Open source on GitHub <ArrowUpRight size={13} />
        </a>
        <span>Made for the long game <span className="footer-star">✳</span></span>
      </footer>
    </main>
  );
}
