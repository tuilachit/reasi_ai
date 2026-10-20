import Image from "next/image";
import Link from "next/link";
import { Brand, CTA, Check } from "@/components/ui";
import { SiteHeader } from "@/components/site-header";
import { Reveal } from "@/components/reveal";
import { PhotoMotion } from "@/components/photo-motion";

const steps = [
  { title: "Set the guidance.", text: "Your clinic defines the guidance once. Reasi works from your instructions, not a generic meal plan.", detail: "Your expertise comes first." },
  { title: "Make it local.", text: "Each new patient gets a priced basket at their nearest Coles, Woolworths or ALDI.", detail: "Their own supermarket." },
  { title: "Review, then share.", text: "Your team reviews the basket before the patient sees it. The final say is always yours.", detail: "Nothing sent without your approval." },
];

export default function Home() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div id="top" />
    <SiteHeader />
    <main id="main">
      <section className="hero wrap" aria-labelledby="hero-title">
        <Reveal className="hero-copy" distance={18}>
          <p className="eyebrow">For clinics. For everyday life.</p>
          <h1 id="hero-title"><span>Clinics write the plan.</span><span>Reasi finds it on the shelf.</span></h1>
          <p className="hero-description">Every new patient gets a priced basket at their own Coles, Woolworths or ALDI, built from your guidance and checked by your team.</p>
          <CTA />
        </Reveal>
        <Reveal className="hero-photo-wrap" kind="image" distance={26} delay={0.12}>
          <figure className="hero-photo editorial-photo">
            <PhotoMotion><Image src="/lifestyle/home-cooking.jpg" alt="Hands preparing fresh herbs on a kitchen chopping board." fill sizes="(max-width: 700px) 100vw, 92vw" preload /></PhotoMotion>
            <figcaption className="photo-caption glass-surface">
              <span className="caption-kicker">From the clinic to the kitchen.</span>
              <p>Good guidance belongs<br />in everyday life.</p>
            </figcaption>
            <div className="photo-note glass-surface"><Check /><span>Your guidance. Their first shop.</span></div>
          </figure>
        </Reveal>
      </section>
      <section className="wrap section problem-section" id="the-gap" aria-labelledby="problem-title">
        <Reveal className="section-heading">
          <p className="eyebrow">Why Reasi</p>
          <h2 id="problem-title">The plan makes sense.<br /><span className="muted-heading">The first shop is harder.</span></h2>
        </Reveal>
        <div className="problem-grid">
          <Reveal><h3>In the consult room.</h3><p>A conversation, a plan and a handout to take home. But not yet a shopping list.</p></Reveal>
          <Reveal delay={0.1}><h3>In the supermarket.</h3><p>Thousands of choices. Different labels and pack sizes. Which ones fit the guidance?</p></Reveal>
          <Reveal delay={0.2}><h3>Back at home.</h3><p>Another search. Another forum. Advice from somewhere else, for food that isn&apos;t here.</p></Reveal>
        </div>
        <div className="quotes">
          <Reveal as="article" className="quote-card glass-surface liquid-card"><blockquote>“Doctor didn&apos;t really talk about what kind of foods to eat.”</blockquote></Reveal>
          <Reveal as="article" className="quote-card glass-surface liquid-card" delay={0.1}><blockquote>“I think I&apos;ve read every thread on reddit and they&apos;re all Americans talking snacks we don&apos;t have here.”</blockquote></Reveal>
        </div>
        <p className="quote-note">Anonymous research quotes, not Reasi customer testimonials.</p>
        <Reveal className="story-photo-wrap" kind="image">
          <figure className="editorial-photo shared-table-photo">
            <PhotoMotion><Image src="/lifestyle/shared-table.jpg" alt="An overhead view of people sharing a meal around an outdoor table." fill sizes="(max-width: 700px) 100vw, 92vw" /></PhotoMotion>
            <figcaption className="image-label glass-surface">For life around the table.</figcaption>
          </figure>
        </Reveal>
      </section>
      <section className="workflow-section" id="how-it-works" aria-labelledby="how-title">
        <div className="wrap section">
          <Reveal className="section-heading split-heading">
            <div><p className="eyebrow">How it works</p><h2 id="how-title">Your expertise.<br /><span className="muted-heading">A practical next step.</span></h2></div>
            <p>One set of guidance.<br />A first shop for each new patient.</p>
          </Reveal>
          <ol className="workflow-grid">
            {steps.map((step, index) => <Reveal as="li" className="workflow-card glass-surface liquid-card" key={step.title} delay={index * 0.14} distance={38}>
              <span className="step-number" aria-hidden="true">{index + 1}</span>
              <h3>{step.title}</h3><p>{step.text}</p>
              <div className="step-detail"><Check /><span>{step.detail}</span></div>
            </Reveal>)}
          </ol>
        </div>
      </section>
      <section className="wrap section everyday-section" id="everyday-life" aria-labelledby="everyday-title">
        <Reveal className="everyday-image" kind="image" distance={24}>
          <figure className="editorial-photo coastal-photo">
            <PhotoMotion><Image src="/lifestyle/coastal-walk.jpg" alt="A distant person walking along a quiet sandy beach." fill sizes="(max-width: 899px) 100vw, 45vw" /></PhotoMotion>
          </figure>
        </Reveal>
        <Reveal className="everyday-copy" delay={0.1}>
          <p className="eyebrow">Everyday life</p>
          <h2 id="everyday-title">The days between<br /><span className="muted-heading">appointments matter.</span></h2>
          <p>The supermarket. The kitchen. The question of what to buy this week.</p>
          <p>Reasi connects your clinical guidance to the everyday choices your patients have to make.</p>
          <CTA className="cta-outline" />
          <Reveal className="everyday-detail-photo" kind="image" delay={0.12}>
            <figure className="editorial-photo yoga-photo">
              <PhotoMotion><Image src="/lifestyle/beach-yoga.jpg" alt="A person practising yoga on a sunny beach beside the sea." fill sizes="(max-width: 899px) 100vw, 42vw" /></PhotoMotion>
            </figure>
          </Reveal>
        </Reveal>
      </section>
      <section className="approach-section" id="our-approach" aria-labelledby="approach-title">
        <div className="wrap section approach-layout">
          <Reveal className="approach-copy">
            <p className="eyebrow">Our approach</p>
            <h2 id="approach-title">Checked by default.<br /><span className="muted-heading">Human by design.</span></h2>
            <p>AI can make up product details. A patient&apos;s basket is no place for guesses.</p>
            <p>Reasi checks every product claim against source data. Anything that cannot be verified stays out.</p>
          </Reveal>
          <Reveal className="approval-panel glass-surface liquid-card" delay={0.12}>
            <h3>Your team has<br />the final say.</h3>
            <ul className="approval-list">
              <li><Check /><span>Product details checked against source data.</span></li>
              <li><Check /><span>A basket built from your clinic&apos;s guidance.</span></li>
              <li><Check /><span>Clinician approval before anything reaches a patient.</span></li>
            </ul>
            <p className="approval-note">No source, no claim.<br />No approval, no patient basket.</p>
          </Reveal>
        </div>
      </section>
      <section className="wrap section focus-section" id="for-clinics" aria-labelledby="focus-title">
        <Reveal className="focus-copy"><p className="eyebrow">For clinics</p><h2 id="focus-title">Built for<br /><span className="muted-heading">the hardest weeks.</span></h2><p>Starting with weight-loss clinics, where a change in eating habits can make the first supermarket trip difficult to navigate.</p></Reveal>
        <Reveal className="focus-panel glass-surface liquid-card" delay={0.1}>
          <p className="focus-label">Starting here</p><h3>Weight-loss clinics</h3>
          <p className="future-label">Looking ahead</p><ul className="condition-list"><li>Coeliac</li><li>IBS</li><li>Diabetes</li></ul>
          <p>Same engine. Same dietitians.</p>
          <p className="future-note">Future areas, not available programmes. Each needs the right evidence and clinical review before launch.</p>
        </Reveal>
      </section>
      <div className="wrap lifestyle-interlude">
        <Reveal kind="image">
          <figure className="editorial-photo cycling-photo">
            <PhotoMotion><Image src="/lifestyle/forest-cycle.jpg" alt="A cyclist riding away along a quiet, sunlit woodland path." fill sizes="(max-width: 700px) 100vw, 92vw" /></PhotoMotion>
            <figcaption className="image-label glass-surface">Life beyond the appointment.</figcaption>
          </figure>
        </Reveal>
      </div>
      <section className="wrap section founders-section" id="our-team" aria-labelledby="founders-title">
        <Reveal className="founders-copy"><p className="eyebrow">Our team</p><h2 id="founders-title">A small team.<br /><span className="muted-heading">A very practical problem.</span></h2><p>We&apos;re building Reasi in Australia, starting with conversations with clinics and dietitians.</p><p>Book a call and you&apos;ll talk directly with a founder.</p></Reveal>
        <Reveal className="founders-photo-wrap" kind="image" delay={0.1}>
          <figure className="founders-photo">
            <Image src="/team/reasi-cofounders.jpg" alt="Reasi's two co-founders standing together outdoors." fill sizes="(max-width: 899px) 100vw, 45vw" />
          </figure>
        </Reveal>
      </section>
      <section className="wrap final-section" aria-labelledby="final-title">
        <Reveal className="final-panel glass-surface liquid-card"><p className="eyebrow">Let&apos;s start with your clinic</p><h2 id="final-title">The plan is yours.<br /><span className="muted-heading">Let&apos;s put it on the shelf.</span></h2><p>Show us the guidance you give. We&apos;ll talk through what a first basket could look like.</p><CTA /><span className="final-note">15 minutes. A conversation with a founder.</span></Reveal>
      </section>
    </main>
    <footer className="site-footer wrap">
      <div className="footer-top"><Brand footer /><nav className="footer-links" aria-label="Legal and support"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/support">Support</Link></nav></div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()} Reasi. Built in Australia.</p><p>Independent of Coles, Woolworths and ALDI.</p></div>
      <details className="photo-credits"><summary>Photography</summary><p>Lifestyle imagery by <a href="https://unsplash.com/photos/person-cutting-vegetables-with-knife-yWG-ndhxvqY" target="_blank" rel="noreferrer">Alyson McPhee</a>, <a href="https://unsplash.com/photos/a-lone-person-walking-on-a-beach-near-the-ocean-U09mS6uwKmA" target="_blank" rel="noreferrer">Matthieu Lemarchal</a>, <a href="https://unsplash.com/photos/people-eating-on-table-with-foods-aFzg83dvnAI" target="_blank" rel="noreferrer">Luisa Brimble</a>, <a href="https://unsplash.com/photos/a-woman-doing-a-yoga-pose-on-the-beach-qXT3gNIeEfE" target="_blank" rel="noreferrer">Alonso Reyes</a> and <a href="https://unsplash.com/photos/person-riding-on-bicycle-during-daytime-_k31aFqnmTM" target="_blank" rel="noreferrer">Rikki Chan</a>, used under the <a href="https://unsplash.com/license" target="_blank" rel="noreferrer">Unsplash License</a>. Images are illustrative, not Reasi patients or clinicians.</p></details>
    </footer>
  </>;
}
