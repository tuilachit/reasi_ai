import { useEffect, useRef, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient.js'

/** Matches legacy waitlist `handleSubmit` validation. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MSG_INVALID_EMAIL = 'Enter a valid email address.'
const MSG_SUPABASE_MISSING =
  'Supabase client is not configured. Please check your environment variables.'
const MSG_ALREADY_ON_LIST = "Looks like you're already on the list!"
const MSG_SUBMIT_FAILED =
  'Something went wrong submitting the form. Please try again in a moment.'

/** Baseline signups shown before adding live rows from Supabase. */
const DEFAULT_WAITLIST_COUNT = 100

function formatFlooredPlus(count) {
  const n = Number(count)
  if (!Number.isFinite(n) || n < 0) {
    return '0+'
  }
  return `${Math.floor(n)}+`
}

function focusHeroEmail(heroEmailRef) {
  heroEmailRef.current?.focus()
  heroEmailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

export default function App() {
  const heroEmailRef = useRef(null)
  const wlEmailRef = useRef(null)

  const [rowCount, setRowCount] = useState(DEFAULT_WAITLIST_COUNT)
  const [extraAfterSuccess, setExtraAfterSuccess] = useState(0)

  const [heroEmail, setHeroEmail] = useState('')
  const [wlEmail, setWlEmail] = useState('')

  const [heroSuccess, setHeroSuccess] = useState(false)
  const [wlSuccess, setWlSuccess] = useState(false)

  const [heroError, setHeroError] = useState('')
  const [wlError, setWlError] = useState('')

  const [heroSubmitting, setHeroSubmitting] = useState(false)
  const [wlSubmitting, setWlSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadCount() {
      if (!supabase) {
        setRowCount(DEFAULT_WAITLIST_COUNT)
        return
      }

      // Prefer a concrete column: `select('*', { count })` can return null count under RLS
      // when no row-level SELECT is allowed for `*`.
      const { count, error } = await supabase
        .from('waitlist_signups')
        .select('email', { count: 'exact', head: true })

      if (cancelled) {
        return
      }

      if (error) {
        console.warn('Waitlist count query failed:', error.message)
        setRowCount(DEFAULT_WAITLIST_COUNT)
        return
      }

      const n = typeof count === 'string' ? parseInt(count, 10) : count
      if (Number.isFinite(n)) {
        setRowCount(DEFAULT_WAITLIST_COUNT + n)
      } else {
        setRowCount(DEFAULT_WAITLIST_COUNT)
      }
    }

    loadCount()

    return () => {
      cancelled = true
    }
  }, [])

  const countStrong = formatFlooredPlus(rowCount + extraAfterSuccess)

  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal')
    if (nodes.length === 0) {
      return
    }

    const thresholds = Array.from({ length: 21 }, (_, i) => i * 0.05)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          const el = entry.target
          const want = parseFloat(el.getAttribute('data-reveal-ratio') || '0.8')
          const rootH = entry.rootBounds?.height ?? window.innerHeight
          const tall = entry.boundingClientRect.height > rootH * 0.85
          const effective = tall ? Math.min(want, 0.2) : want

          if (entry.intersectionRatio >= effective) {
            el.classList.add('revealed')
            observer.unobserve(el)
          }
        })
      },
      { threshold: thresholds },
    )

    nodes.forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, [])

  /**
   * Same Supabase contract as legacy `handleSubmit`: `waitlist_signups` insert,
   * lowercased email, `23505` duplicate branch, try/catch + console.error on failure.
   */
  async function insertWaitlistSignup(trimmedEmail) {
    try {
      const { error: insertError } = await supabase.from('waitlist_signups').insert({
        email: trimmedEmail.toLowerCase(),
      })

      if (insertError) {
        if (insertError.code === '23505') {
          return { ok: false, reason: 'duplicate' }
        }
        throw insertError
      }

      return { ok: true }
    } catch (submitError) {
      console.error('Failed to add email to waitlist:', submitError)
      return { ok: false, reason: 'generic' }
    }
  }

  const onHeroSubmit = async (e) => {
    e.preventDefault()

    const trimmedEmail = heroEmail.trim()
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setHeroError(MSG_INVALID_EMAIL)
      return
    }

    setHeroError('')
    if (!supabase) {
      setHeroError(MSG_SUPABASE_MISSING)
      return
    }

    setHeroSubmitting(true)
    const result = await insertWaitlistSignup(trimmedEmail)
    setHeroSubmitting(false)

    if (result.ok) {
      setHeroSuccess(true)
      setHeroEmail('')
      setExtraAfterSuccess((n) => n + 1)
      return
    }

    if (result.reason === 'duplicate') {
      setHeroError(MSG_ALREADY_ON_LIST)
      return
    }
    setHeroError(MSG_SUBMIT_FAILED)
  }

  const onWlSubmit = async (e) => {
    e.preventDefault()

    const trimmedEmail = wlEmail.trim()
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setWlError(MSG_INVALID_EMAIL)
      return
    }

    setWlError('')
    if (!supabase) {
      setWlError(MSG_SUPABASE_MISSING)
      return
    }

    setWlSubmitting(true)
    const result = await insertWaitlistSignup(trimmedEmail)
    setWlSubmitting(false)

    if (result.ok) {
      setWlSuccess(true)
      setWlEmail('')
      setExtraAfterSuccess((n) => n + 1)
      return
    }

    if (result.reason === 'duplicate') {
      setWlError(MSG_ALREADY_ON_LIST)
      return
    }
    setWlError(MSG_SUBMIT_FAILED)
  }

  return (
    <>
      <nav className="nav-reveal">
        <span className="nav-logo">Reasi</span>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#waitlist">Features</a>
        </div>
        <div className="nav-right">
          <button type="button" className="nav-login">
            Log in
          </button>
          <button
            type="button"
            className="nav-cta"
            onClick={() => focusHeroEmail(heroEmailRef)}
          >
            Join waitlist
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">AI grocery assistant · Australia</p>
          <h1>
            One plan,
            <br />
            every shop.
          </h1>
          <p className="hero-desc">
            Reasi handles your entire grocery workflow. From weekly meal planning to building your Woolworths or Coles cart automatically.
          </p>

          <form
            className="hero-form"
            onSubmit={onHeroSubmit}
            style={{ display: heroSuccess ? 'none' : 'flex' }}
          >
            <input
              ref={heroEmailRef}
              className="hero-email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              value={heroEmail}
              disabled={heroSubmitting}
              onChange={(e) => {
                setHeroEmail(e.target.value)
                if (heroError) setHeroError('')
              }}
            />
            <button type="submit" className="hero-btn" disabled={heroSubmitting}>
              Get early access
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
          {heroError && <p className="form-inline-error">{heroError}</p>}
          <p
            className="hero-form-note"
            id="hero-note"
            style={{ display: heroSuccess ? 'none' : 'block' }}
          >
            Launching in Australia. No spam, unsubscribe any time.
          </p>

          <div className="hero-success" id="hero-success" style={{ display: heroSuccess ? 'block' : 'none' }}>
            <div className="hs-inner">
              <div className="hs-check">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="hs-text">
                <h4>You&apos;re on the list.</h4>
                <p>We&apos;ll be in touch when Reasi launches in Australia.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="float-card-float-anchor">
            <div className="float-card">
            <div className="fc-label">Your meals</div>
            <div className="fc-meal">
              <div className="fc-day">Monday</div>
              <div className="fc-name">Thai Green Curry</div>
              <div className="fc-tags">
                <span className="fc-tag">$12.50</span>
                <span className="fc-tag">25 min</span>
              </div>
            </div>
            <div className="fc-meal">
              <div className="fc-day">Tuesday</div>
              <div className="fc-name">Salmon with Greens</div>
              <div className="fc-tags">
                <span className="fc-tag">$14.80</span>
                <span className="fc-tag">20 min</span>
              </div>
            </div>
            <div className="fc-meal">
              <div className="fc-day">Wednesday</div>
              <div className="fc-name">Shakshuka</div>
              <div className="fc-tags">
                <span className="fc-tag">$8.00</span>
                <span className="fc-tag">25 min</span>
              </div>
            </div>
            </div>
          </div>

          <div className="phone-float-anchor">
            <div className="phone">
            <div className="phone-status">
              <span className="phone-time">9:41</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <svg width="13" height="10" viewBox="0 0 17 12" fill="#0a0a0a">
                  <rect x="0" y="3" width="3" height="9" rx="1" />
                  <rect x="4.5" y="2" width="3" height="10" rx="1" />
                  <rect x="9" y="0" width="3" height="12" rx="1" />
                  <rect x="13.5" y="1" width="3" height="11" rx="1" />
                </svg>
                <svg width="19" height="10" viewBox="0 0 25 12" fill="none">
                  <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#0a0a0a" strokeOpacity="0.3" />
                  <rect x="2" y="2" width="14" height="8" rx="2" fill="#0a0a0a" />
                  <path d="M23 4.5v3a2 2 0 000-3z" fill="#0a0a0a" fillOpacity="0.4" />
                </svg>
              </div>
            </div>
            <div className="phone-screen">
              <div className="app-header">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.75">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <div className="app-title">This week</div>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.75">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <div className="app-cost-row">
                <span className="app-cost-label">Estimated total</span>
                <span className="app-cost-val">$68.40</span>
              </div>
              <div className="app-sl">Meat &amp; Seafood</div>
              <div className="app-item">
                <div className="app-check done">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="app-item-name done">Chicken thighs</span>
                <span className="app-item-qty">600 g</span>
              </div>
              <div className="app-item">
                <div className="app-check" />
                <span className="app-item-name">Atlantic salmon</span>
                <span className="app-item-qty">400 g</span>
              </div>
              <div className="app-item">
                <div className="app-check" />
                <span className="app-item-name">Beef mince</span>
                <span className="app-item-qty">500 g</span>
              </div>
              <div className="app-sl">Produce</div>
              <div className="app-item">
                <div className="app-check done">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="app-item-name done">Broccolini</span>
                <span className="app-item-qty">1 bunch</span>
              </div>
              <div className="app-item">
                <div className="app-check" />
                <span className="app-item-name">Cherry tomatoes</span>
                <span className="app-item-qty">250 g</span>
              </div>
              <div className="app-item">
                <div className="app-check" />
                <span className="app-item-name">Lime</span>
                <span className="app-item-qty">3</span>
              </div>
              <div className="app-sl">Pantry</div>
              <div className="app-item">
                <div className="app-check" />
                <span className="app-item-name">Coconut milk</span>
                <span className="app-item-qty">400 ml</span>
              </div>
              <div className="app-item">
                <div className="app-check" />
                <span className="app-item-name">Jasmine rice</span>
                <span className="app-item-qty">2 cups</span>
              </div>
              <div className="app-footer">
                <div className="app-btn">
                  View recipes
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      <div className="waitlist-bar reveal reveal--waitlist" id="waitlist" data-reveal-ratio="0.8">
        <p className="wl-count">
          Join <strong id="count-num">{countStrong}</strong> others on the waitlist.
        </p>
        <div
          id="wl-form-wrap"
          style={{
            display: wlSuccess ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <form className="wl-form" onSubmit={onWlSubmit}>
            <input
              ref={wlEmailRef}
              className="wl-email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              value={wlEmail}
              disabled={wlSubmitting}
              onChange={(e) => {
                setWlEmail(e.target.value)
                if (wlError) setWlError('')
              }}
            />
            <button type="submit" className="wl-btn" disabled={wlSubmitting}>
              Join now
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
          {wlError && <p className="form-inline-error">{wlError}</p>}
        </div>
        <div className="wl-success" id="wl-success" style={{ display: wlSuccess ? 'flex' : 'none' }}>
          <div className="wls-check">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3>You&apos;re on the list.</h3>
          <p>We&apos;ll be in touch when Reasi launches in Australia.</p>
        </div>
        <p className="wl-fine">No spam. Unsubscribe any time.</p>
      </div>

      <section className="how-section" id="how">
        <div className="how-inner">
          <p className="how-label reveal reveal--fade" data-reveal-ratio="0.6">
            How it works
          </p>
          <div className="steps-grid">
            {[
              {
                n: '01',
                title: 'Plan your meals',
                desc: "Tell Reasi how you eat and what you're craving. Get a tailored weekly meal plan with recipes in one tap.",
              },
              {
                n: '02',
                title: 'Build your list',
                desc: 'Your shopping list is generated automatically. Organised by aisle, with cost estimates included.',
              },
              {
                n: '03',
                title: 'Automate your cart',
                desc: 'Reasi adds everything to your Woolworths or Coles cart. Ready to checkout in seconds, not minutes.',
              },
              {
                n: '04',
                title: 'Navigate the store',
                desc: 'Shopping in person? Get aisle-by-aisle guidance so you move through the store fast and forget nothing.',
              },
            ].map((step, index) => (
              <div
                key={step.n}
                className="step-item reveal"
                data-reveal-ratio="0.8"
                data-delay={index * 100}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="step-n">{step.n}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <span className="footer-word">Reasi</span>
        <span className="footer-copy">© 2025 Reasi AI · Australia</span>
      </footer>
    </>
  )
}
