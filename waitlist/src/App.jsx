import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient.js'

function App() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const metrics = [
    { label: 'Households surveyed', value: '320+', detail: 'Shoppers shaped our AI co-pilot.' },
    { label: 'Average time saved', value: '18 min', detail: 'Per grocery visit during pilot runs.' },
    { label: 'Fridge waste reduced', value: '27%', detail: 'Less guesswork, fewer expired items.' },
  ]

  const flowSteps = [
    {
      title: 'Tell Reasi what you need',
      description: 'Speak or type it naturally—“quick dinner for four” or “gluten-free snacks under $10”—and we build the plan.',
    },
    {
      title: 'See the smartest route',
      description: 'We pull live shelf data, promos, and aisle maps so you glide through the store without double-backs.',
    },
    {
      title: 'Adapt in real time',
      description: 'If something moves or sells out, Reasi suggests swaps that still match your taste, budget, and pantry.',
    },
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
      <header className="header">
        <div className="header__brand">
          <img className="header__logo" src="/logos/Logo.png" alt="Reasi logo" />
          <div className="header__mark">Reasi</div>
        </div>
        <span className="header__badge">AI supermarket co-pilot</span>
      </header>

      <main className="main">
        <section className="hero container reveal" data-animate>
          <span className="hero__accent" aria-hidden="true" />
          <span className="hero__accent hero__accent--secondary" aria-hidden="true" />
          <p className="hero__eyebrow">Smarter supermarket runs</p>
          <h1 className="hero__title">A store-savvy co-pilot that knows every aisle, promo, and preference.</h1>
          <p className="hero__subtitle">
            Reasi fuses live supermarket data with an LLM concierge so you can ask for items in plain
            language, get instant directions, and swap when shelves surprise you. It’s like chatting
            with a store associate who actually knows everything.
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
            <p className="waitlist__feedback">We’ll be in touch when Reasi is ready for you.</p>
          )}
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
          <h2 className="features__title">What makes Reasi different?</h2>
          <ul className="features__list">
            <li>
              <span>Conversational find-as-you-go</span>
              <p>Ask for “vegan pesto for pasta” or “budget-friendly cereal” and get aisle-level guidance instantly.</p>
            </li>
            <li>
              <span>Live store intelligence</span>
              <p>Pair real-time shelf data with your household’s preferences and allergies to avoid dead ends.</p>
            </li>
            <li>
              <span>Suggested swaps that stick</span>
              <p>See promotion-ready alternatives and smart substitutions the moment the shelf is empty.</p>
            </li>
          </ul>
        </section>

        <section className="flow container reveal" data-animate>
          <div className="flow__header">
            <h2>How the in-store magic happens</h2>
            <p>
              Reasi feels like the team member on staff who knows every aisle, every circular, and your
              go-to picks. Here’s how a single request becomes a streamlined route.
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
            <h2>Built for those tight grocery missions.</h2>
            <p>
              Reasi blends your pantry plan with store signals, so the route adapts when the deli counter
              is crowded or the produce bins shift. No juggling multiple apps—just natural language
              prompts, instant aisle directions, and checkout-ready baskets.
            </p>
          </div>

          <blockquote className="story__quote">
            <p>
              “I asked for ‘kid-friendly snacks under five bucks’ and it walked me to a promo I would’ve
              never spotted. That alone saved me a lap.”
            </p>
            <cite>— Maya, parent of two, pilot family of four</cite>
          </blockquote>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner" data-animate>
          <span>© {new Date().getFullYear()} Reasi Labs</span>
          <span>Built with intention, in black &amp; white.</span>
        </div>
      </footer>
    </div>
  )
}

export default App
