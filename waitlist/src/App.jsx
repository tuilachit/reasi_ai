import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient.js'

function App() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const metrics = [
    {
      value: 'Less stress',
      label: 'No more aisle anxiety',
      detail: 'Skip the guesswork and wandering. Every stop is intentional, not hopeful.',
    },
    {
      value: 'Faster trips',
      label: 'In, out, done',
      detail: 'Turn 45‑minute shops into focused missions that fit between everything else.',
    },
    {
      value: 'Smarter baskets',
      label: 'Decisions you trust',
      detail: 'See better options instantly so your cart matches your goals—not just habits.',
    },
  ]

  const demoMessages = [
    { from: 'user', text: 'I have 20 minutes, need dinner for 2.' },
    { from: 'ai', text: 'Got it. Any dietary preferences or allergies?' },
    { from: 'user', text: 'Gluten-free, something under $25.' },
    {
      from: 'ai',
      text:
        'I’ll guide you through pasta, veg, and sauce in Aisles 4 and 6, with two promo options on gluten-free spaghetti.',
    },
    { from: 'user', text: 'Perfect. Can we add a quick dessert?' },
    {
      from: 'ai',
      text:
        'Yes. I’ll route you past the chilled aisle for a 2-minute pick-up on mini cheesecakes that fit your budget.',
    },
  ]

  const flowSteps = [
    {
      title: 'Ask',
      description:
        'Tell REASI AI what you’re doing—“quick dinner for two under $25” or “nut‑free snacks for school”.',
    },
    {
      title: 'Locate',
      description: 'We translate that into exact products and aisle‑accurate locations in your specific store.',
    },
    {
      title: 'Navigate',
      description: 'Follow an iOS‑style map that minimizes backtracking and keeps you moving with purpose.',
    },
    {
      title: 'Shop smarter',
      description: 'Get live suggestions, swaps, and reminders so you leave with everything you actually need.',
    },
  ]

  const backgroundNodes = [
    { id: 'orb-1', size: 360, top: '6%', left: '-8%', duration: 24 },
    { id: 'orb-2', size: 280, top: '68%', left: '10%', duration: 28 },
    { id: 'orb-3', size: 420, top: '32%', left: '72%', duration: 32 },
    { id: 'orb-4', size: 240, top: '80%', left: '62%', duration: 26 },
  ]

  useEffect(() => {
    const animated = document.querySelectorAll('[data-animate]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -10% 0px',
      },
    )

    animated.forEach((element) => observer.observe(element))

    return () => {
      animated.forEach((element) => observer.unobserve(element))
      observer.disconnect()
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)

    if (!isValidEmail) {
      setError('Enter a valid email address.')
      setStatus('idle')
      return
    }

    setError('')
    if (!supabase) {
      setStatus('idle')
      setError('Supabase client is not configured. Please check your environment variables.')
      return
    }

    setStatus('loading')

    try {
      const { error: insertError } = await supabase.from('waitlist_signups').insert({
        email: trimmedEmail.toLowerCase(),
      })

      if (insertError) {
        if (insertError.code === '23505') {
          setStatus('idle')
          setError('Looks like you’re already on the list!')
          return
        }

        throw insertError
      }

      setStatus('success')
      setEmail('')
    } catch (submitError) {
      console.error('Failed to add email to waitlist:', submitError)
      setStatus('idle')
      setError('Something went wrong submitting the form. Please try again in a moment.')
    }
  }

  return (
    <div className="page">
      <div className="motion-bg" aria-hidden="true">
        <video
          className="motion-bg__video"
          src="/videos/1105127_1080p_Shop_1920x1080.mov"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="motion-bg__scanlines" />
        <div className="motion-bg__grid" />
        {backgroundNodes.map((node) => (
          <div
            key={node.id}
            className="motion-bg__orb"
            style={{
              '--size': `${node.size}px`,
              '--top': node.top,
              '--left': node.left,
              '--duration': `${node.duration}s`,
            }}
          />
        ))}
      </div>

      <main className="main">
        <section className="hero container reveal" data-animate>
          <div className="hero__logo-mark">
            <img src="/logos/Logo.png" alt="Reasi logo" />
            <span>Reasi</span>
          </div>
          <span className="hero__accent" aria-hidden="true" />
          <span className="hero__accent hero__accent--secondary" aria-hidden="true" />
          <h1 className="hero__title">Never get lost in the supermarket again.</h1>
          <p className="hero__eyebrow">Ask anything. Find it instantly.</p>
          <p className="hero__subtitle">
            REASI AI is your in‑store supermarket companion that knows every aisle, every shelf, and every
            corner. Just describe what you’re looking for in natural language and it tells you exactly
            where to go—down to the aisle, bay, and section.
          </p>
          <div className="hero__scroll" aria-hidden="true">
            <span>Scroll for the walkthrough</span>
            <div className="hero__scroll-indicator" />
          </div>

          <form className="waitlist" onSubmit={handleSubmit} data-animate>
            <label className="sr-only" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) setError('')
              }}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'email-error' : undefined}
              required
            />
            <button type="submit" disabled={status === 'loading'}>
              {status === 'success'
                ? 'Added to waitlist'
                : status === 'loading'
                  ? 'Joining...'
                  : 'Join the waitlist'}
            </button>
          </form>

          {error && (
            <p id="email-error" className="waitlist__feedback waitlist__feedback--error">
              {error}
            </p>
          )}
          {status === 'success' && !error && (
            <p className="waitlist__feedback">We’ll be in touch when REASI AI is ready for you.</p>
          )}
          {status !== 'success' && !error && (
            <p className="waitlist__microcopy">No spam, no fees, early access only.</p>
          )}
        </section>

        <section className="demo container reveal" data-animate>
          <div className="demo__copy">
            <h2>See your in‑store co‑pilot in action.</h2>
            <p>
              Watch REASI AI turn a messy grocery run into a calm, guided walkthrough—every question from
              “where’s the tahini?” to “what’s a quick gluten‑free dinner?” answered in seconds. It feels
              less like using an app, and more like talking to the one store staff member who knows
              everything.
            </p>
          </div>

          <div className="demo__phone">
            <div className="demo__status-bar">
              <span>Reasi Assistant</span>
              <span className="demo__status-dot" />
            </div>
            <div className="demo__screen">
              {demoMessages.map((message, index) => (
                <div
                  key={`${message.from}-${index}`}
                  className={`demo__bubble demo__bubble--${message.from}`}
                  style={{ '--delay': `${index * 0.08}s` }}
                >
                  <p>{message.text}</p>
                </div>
              ))}
            </div>
            <div className="demo__input-bar">
              <span>Ask Reasi anything about this store…</span>
            </div>
          </div>
        </section>

        <section className="metrics container" aria-label="Pilot highlights" data-animate>
          {metrics.map((metric, index) => (
            <article
              key={metric.label}
              className="reveal"
              data-animate
              style={{ '--delay': `${index * 0.08}s` }}
            >
              <h3>{metric.value}</h3>
              <p>{metric.label}</p>
              <span>{metric.detail}</span>
            </article>
          ))}
        </section>

        <section className="divider" aria-hidden="true" data-animate>
          <div />
        </section>

        <section className="features container reveal" data-animate>
          <h2 className="features__title">REASI AI turns the supermarket into a place that finally makes sense.</h2>
          <p className="features__intro">
            Ask in your own words, and REASI AI responds with conversational answers, aisle‑accurate
            directions, and an iOS‑style map that feels familiar from the first use. No more hunting through
            categories or guessing where things “should” be.
          </p>
          <ul className="features__list">
            <li>
              <span>Ask naturally (voice or text)</span>
              <p>Speak or type like you would to a friend—no rigid keywords or menus.</p>
            </li>
            <li>
              <span>Aisle‑accurate directions</span>
              <p>Get precise guidance inside the store, not just “somewhere in aisle 7”.</p>
            </li>
            <li>
              <span>Visual map navigation</span>
              <p>Follow a clean, phone‑native route that minimizes backtracking and dead ends.</p>
            </li>
            <li>
              <span>Real‑time product info</span>
              <p>Check variants, availability, and key details before you even walk to the shelf.</p>
            </li>
            <li>
              <span>Smart alternatives &amp; healthier suggestions</span>
              <p>Discover swaps that match your budget, health goals, and dietary needs.</p>
            </li>
            <li>
              <span>Works in major supermarkets</span>
              <p>Designed to plug into leading supermarket chains so your experience travels with you.</p>
            </li>
          </ul>
        </section>

        <section className="flow container reveal" data-animate>
          <div className="flow__header">
            <h2>How REASI AI fits into your shop.</h2>
            <p>
              Shop with a simple, reassuring flow: describe your mission once and let REASI AI handle the
              locating, routing, and smart suggestions while you stay present in the aisle.
            </p>
          </div>
          <div className="flow__steps">
            {flowSteps.map((step, index) => (
              <article key={step.title} className="flow__step" data-animate style={{ '--delay': `${index * 0.1}s` }}>
                <span className="flow__index">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="story container reveal" data-animate>
          <div className="story__content">
            <h2>The aisle hunt shouldn’t be this hard.</h2>
            <p>
              You walk in for “just a few things” and end up pacing aisles, backtracking, and squinting at
              signs that never quite match what’s in your head. Products move, layouts change, each store
              has its own secret logic, and simple questions like “where’s the coconut milk?” turn into
              five‑minute detours. It’s a weekly time tax that quietly drains energy from already busy
              days—and it shouldn’t be on you to memorize every shelf.
            </p>
          </div>

          <blockquote className="story__quote">
            <p>
              “I asked for ‘kid‑friendly snacks under five bucks’ and it walked me straight to a promo I
              would’ve never spotted. That alone saved me a lap.”
            </p>
            <cite>— Maya, parent of two, pilot family of four</cite>
          </blockquote>
        </section>

        <section className="perks container reveal" data-animate>
          <h2>Why join the waitlist now.</h2>
          <ul>
            <li>
              <span>Early beta access</span>
              <p>Be among the first shoppers to use REASI AI in real supermarkets as we roll out.</p>
            </li>
            <li>
              <span>Shape the product</span>
              <p>Vote on features, share feedback, and influence what we build next.</p>
            </li>
            <li>
              <span>Insider updates</span>
              <p>Get behind‑the‑scenes progress, launch timelines, and store rollout news.</p>
            </li>
            <li>
              <span>Founding member perks</span>
              <p>Enjoy recognition and benefits reserved for our earliest supporters.</p>
            </li>
          </ul>
        </section>

        <section className="social container reveal" data-animate>
          <h2>Built by people who know supermarkets and AI.</h2>
          <p>
            REASI AI is created by people who’ve worked inside supermarkets and on cutting‑edge AI systems.
            We test with real shoppers doing real weekly shops—families, students, and busy professionals—to
            refine every interaction. Under the hood, REASI AI combines store‑level data with advanced
            language models to understand your intent and translate it into precise, in‑store actions.
          </p>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner" data-animate>
          <span>Built with ❤️ in Australia.</span>
          <span>© 2025 REASI AI.</span>
        </div>
      </footer>
    </div>
  )
}

export default App
