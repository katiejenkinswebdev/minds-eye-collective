import { ContactForm } from "./contact-form";
import { PrismMark } from "./prism-mark";
import styles from "./page.module.css";

const OUTCOMES = [
  {
    title: "Reclaim hundreds of hours.",
    body: "Custom AI automation for your highest volume manual workflow. Typical range: 60 to 80% less hands-on time.",
  },
  {
    title: "Your company's knowledge, on demand.",
    body: "An AI assistant trained on your docs and processes. Answers in seconds, not searches.",
  },
  {
    title: "A workforce that actually uses AI.",
    body: "Role-specific enablement with adoption tracked from day one.",
  },
];

const STEPS = [
  {
    number: "01",
    label: "Discover.",
    body: "We find the highest-value AI opportunity in your operation.",
  },
  {
    number: "02",
    label: "Design.",
    body: "I build the system, custom to your workflow.",
  },
  {
    number: "03",
    label: "Deploy.",
    body: "Your team ships with it, with adoption measured.",
  },
];

export default function Page() {
  return (
    <>
      <header className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.lockup}
          src="/logos/lockup-horizontal-dark.svg"
          alt="Minds Eye Collective"
          height={46}
        />
        <a className={styles.ghostCta} href="#contact">
          Get in Touch
        </a>
      </header>

      <main>
        <div className={styles.heroGlow}>
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <h1 className={styles.h1}>
                Your team, working at full capacity with AI.
              </h1>
              <p className={styles.heroLede}>
                Custom-built AI systems and hands-on enablement for
                organizations that want outcomes, not experiments.
              </p>
              <a className={styles.solidCta} href="#contact">
                Get in Touch
              </a>
            </div>
            <div className={styles.heroMark}>
              <PrismMark />
            </div>
          </section>
        </div>

        <section className={styles.outcomes}>
          <h2 className={styles.eyebrow}>What you get</h2>
          <div className={styles.cardGrid}>
            {OUTCOMES.map((outcome) => (
              <article className={styles.card} key={outcome.title}>
                <h3 className={styles.cardTitle}>{outcome.title}</h3>
                <p className={styles.cardBody}>{outcome.body}</p>
              </article>
            ))}
          </div>
          <a className={styles.darkCta} href="#contact">
            Get in Touch
          </a>
        </section>

        <section className={styles.process}>
          <div className={styles.processInner}>
            <h2 className={styles.eyebrowDark}>How it works</h2>
            <ol className={styles.steps}>
              {STEPS.map((step) => (
                <li className={styles.step} key={step.number}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <span className={styles.stepText}>
                    <strong>{step.label}</strong>{" "}
                    <span className={styles.stepBody}>{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.about}>
          <div className={styles.prismBar} aria-hidden="true" />
          <h2 className={styles.eyebrow}>About</h2>
          <p className={styles.aboutBody}>
            {
              "I'm Katie, founder of Minds Eye Collective. I've spent 15+ years building and shipping software products and leading product and engineering teams. I build the systems myself rather than handing off a slide deck. Today I design AI-powered products and workflows end to end, from AI document analysis platforms to custom communication workflows, and I teach teams to do the same. I only take on work where I can point to a measurable outcome. If AI can't move a number you care about, I'll tell you."
            }
          </p>
        </section>

        <section className={styles.contact} id="contact">
          <div className={styles.contactInner}>
            <div className={styles.contactCopy}>
              <h2 className={styles.contactHeading}>Get in Touch</h2>
              <p className={styles.contactLede}>
                {
                  "Tell me the number you want to move. I'll reply within one business day."
                }
              </p>
            </div>
            <ContactForm />
          </div>

          <footer className={styles.footer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/pupil-dot-dark.svg"
              alt=""
              width={18}
              height={18}
            />
            <span className={styles.footerText}>Minds Eye Collective</span>
          </footer>
        </section>
      </main>
    </>
  );
}
