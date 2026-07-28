import { useEffect, useRef, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient.js'
import { formatFlooredPlus, validateWaitlistSignup } from './lib/waitlist.js'

const MSG_SUPABASE_MISSING =
  'Supabase client is not configured. Please check your environment variables.'
const MSG_ALREADY_ON_LIST = "Looks like you're already on the list!"
const MSG_SUBMIT_FAILED =
  'Something went wrong submitting the form. Please try again in a moment.'
const DEFAULT_WAITLIST_COUNT = 100

const lifecycleStages = [
  {
    key: 'plan',
    label: 'Plan',
    title: 'A week of meals, already decided.',
    body: 'Reasi builds meals around your budget, time, household, and what you actually like eating.',
    meta: '$68.40 weekly shop',
    items: ['Thai Green Curry', 'Salmon with Greens', 'Shakshuka'],
  },
  {
    key: 'swap',
    label: 'Swap',
    title: 'Cheaper, healthier, smarter alternatives.',
    body: 'When an item is expensive, unavailable, or not worth it, the agent suggests the next best move.',
    meta: '3 smarter swaps found',
    items: ['Greek yoghurt for cream', 'Frozen berries for fresh', 'Brown rice for jasmine'],
  },
  {
    key: 'list',
    label: 'List',
    title: 'One list with no duplicate thinking.',
    body: 'Ingredients, pantry staples, quantities, repeats, and missing basics are handled together.',
    meta: '18 items handled',
    items: ['Protein', 'Produce', 'Pantry'],
  },
  {
    key: 'shop',
    label: 'Shop',
    title: 'Checkout-ready before you open the store.',
    body: 'Your cart is prepared with the total visible, ready for approval instead of another rebuild.',
    meta: 'Ready to approve',
    items: ['Review total', 'Approve swaps', 'Send to cart'],
  },
  {
    key: 'cook',
    label: 'Cook',
    title: 'The routine gets easier every week.',
    body: 'Reasi remembers what worked, what expired, what you skipped, and what should come back.',
    meta: 'Learns your rhythm',
    items: ['Remember favourites', 'Track pantry', 'Bring back wins'],
  },
]

const featureRows = [
  {
    title: 'Adapts to your real life',
    body: 'Dietary preferences, budget, time, family size, and chaotic weeks are treated as inputs, not edge cases.',
  },
  {
    title: 'Keeps you in control',
    body: 'Approve checkout, edit swaps, set budget, and override anything before the shop is handled.',
  },
  {
    title: 'Gets smarter',
    body: 'The agent learns what you buy, what you waste, what you cook, and what you never want again.',
  },
]

const proofStats = [
  ['40 min', 'saved on weekly planning'],
  ['18 items', 'handled before checkout'],
  ['1 flow', 'from plan to cart'],
]

const appScreens = [
  {
    label: 'Plan',
    alt: 'Reasi meal plan screen',
    image: '/reasi-app/meal-plan.png',
    scroll: true,
  },
  {
    label: 'List',
    alt: 'Reasi shopping list screen',
    image: '/reasi-app/shopping-list.png',
    scroll: true,
  },
  {
    label: 'Shop',
    alt: 'Reasi shopping mode screen',
    image: '/reasi-app/shopping-mode.png',
  },
  {
    label: 'Route',
    alt: 'Reasi in-store route screen',
    image: '/reasi-app/in-store-route.png',
  },
]

function focusEmail(ref) {
  ref.current?.focus()
  ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function NativePhone({ screen, compact = false }) {
  return (
    <div className={`native-phone ${compact ? 'native-phone--compact' : ''}`}>
      <div className="native-phone__shell">
        <div className="native-phone__bezel" />
        <img
          className={`native-screen-shot ${screen.scroll ? 'native-screen-shot--scroll' : ''}`}
          src={screen.image}
          alt={screen.alt}
          loading="lazy"
        />
      </div>
    </div>
  )
}

export default function App() {
  const wlEmailRef = useRef(null)
  const [activeStage, setActiveStage] = useState(lifecycleStages[0].key)
  const [rowCount, setRowCount] = useState(DEFAULT_WAITLIST_COUNT)
  const [extraAfterSuccess, setExtraAfterSuccess] = useState(0)
  const [wlEmail, setWlEmail] = useState('')
  const [wlSupermarket, setWlSupermarket] = useState('')
  const [wlSuburb, setWlSuburb] = useState('')
  const [wlSuccess, setWlSuccess] = useState(false)
  const [wlError, setWlError] = useState('')
  const [wlSubmitting, setWlSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadCount() {
      if (!supabase) {
        setRowCount(DEFAULT_WAITLIST_COUNT)
        return
      }

      const { data, error } = await supabase.rpc('get_waitlist_signup_count')

      if (cancelled) {
        return
      }

      if (error) {
        console.warn('Waitlist count query failed:', error.message)
        setRowCount(DEFAULT_WAITLIST_COUNT)
        return
      }

      const n = typeof data === 'string' ? parseInt(data, 10) : data
      setRowCount(Number.isFinite(n) ? DEFAULT_WAITLIST_COUNT + n : DEFAULT_WAITLIST_COUNT)
    }

    loadCount()

    return () => {
      cancelled = true
    }
  }, [])

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

  const countStrong = formatFlooredPlus(rowCount + extraAfterSuccess)
  const activeStageData =
    lifecycleStages.find((stage) => stage.key === activeStage) ?? lifecycleStages[0]

  async function insertWaitlistSignup(trimmedEmail, weeklySupermarket, weeklySuburb) {
    try {
      const { error: insertError } = await supabase.from('waitlist_signups').insert({
        email: trimmedEmail.toLowerCase(),
        weekly_supermarket: weeklySupermarket,
        weekly_suburb: weeklySuburb,
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

  const onWlSubmit = async (e) => {
    e.preventDefault()

    const validation = validateWaitlistSignup({
      email: wlEmail,
      weeklySupermarket: wlSupermarket,
      weeklySuburb: wlSuburb,
    })

    if (!validation.ok) {
      setWlError(validation.error)
      return
    }

    setWlError('')
    if (!supabase) {
      setWlError(MSG_SUPABASE_MISSING)
      return
    }

    const { email, weeklySupermarket, weeklySuburb } = validation.value
    setWlSubmitting(true)
    const result = await insertWaitlistSignup(email, weeklySupermarket, weeklySuburb)
    setWlSubmitting(false)

    if (result.ok) {
      setWlSuccess(true)
      setWlEmail('')
      setWlSupermarket('')
      setWlSuburb('')
      setExtraAfterSuccess((n) => n + 1)
      return
    }

    setWlError(result.reason === 'duplicate' ? MSG_ALREADY_ON_LIST : MSG_SUBMIT_FAILED)
  }

  return (
    <>
      <nav className="nav-reveal">
        <a className="nav-logo" href="#" aria-label="Reasi home">
          <img src="/logos/Logo.png" alt="Reasi" />
        </a>
        <div className="nav-links">
          <a href="#lifecycle">Product</a>
          <a href="#waitlist">Waitlist</a>
        </div>
        <div className="nav-right">
          <button type="button" className="nav-login">
            Log in
          </button>
          <button type="button" className="nav-cta" onClick={() => focusEmail(wlEmailRef)}>
            Join waitlist
          </button>
        </div>
      </nav>

      <section className="hero">
        <img className="brand-watermark brand-watermark--hero" src="/logos/Logo.png" alt="" aria-hidden="true" />
        <div className="hero-left">
          <p className="hero-eyebrow">Your grocery AI agent</p>
          <h1>Groceries handled by an agent you trust.</h1>
          <p className="hero-desc">
            Reasi turns weekly grocery chaos into a calm flow: plan meals, build the list,
            find smarter swaps, and get your shop ready for approval.
          </p>
          <p className="hero-desc-short">
            Meals, list, swaps, and checkout-ready shopping in one calm flow.
          </p>

          <div className="hero-actions">
            <button type="button" className="hero-btn" onClick={() => focusEmail(wlEmailRef)}>
              Join waitlist
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <a className="hero-secondary" href="#lifecycle">
              Product
            </a>
          </div>

          <div className="trust-strip" aria-label="Who Reasi is built for">
            <span>Busy families</span>
            <span>Meal preppers</span>
            <span>Budget-aware shoppers</span>
          </div>
        </div>

        <div className="hero-right hero-preview">
          <div className="canvas-topline">
            <span>Reasi beta</span>
            <strong>Your shop is handled</strong>
          </div>
          <NativePhone screen={appScreens[2]} compact />
          <div className="preview-stack" aria-hidden="true">
            <div className="preview-card preview-card--plan">
              <span>This week</span>
              <strong>$68.40</strong>
              <p>Thai Green Curry, Salmon with Greens, Shakshuka</p>
            </div>
            <div className="preview-card preview-card--cart">
              <span>Checkout</span>
              <strong>18 items ready</strong>
              <p>3 swaps found. Total visible before approval.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="app-motion-section" aria-label="Native mobile app preview">
        <div className="motion-copy reveal" data-reveal-ratio="0.45">
          <p>Native app preview</p>
          <h2>It feels like an app, not another grocery spreadsheet.</h2>
        </div>
        <div className="motion-stage reveal" data-reveal-ratio="0.4">
          <div className="motion-track" aria-hidden="true">
            {[...appScreens, ...appScreens].map((screen, index) => (
              <NativePhone key={`${screen.label}-${index}`} screen={screen} />
            ))}
          </div>
        </div>
      </section>

      <section className="lifecycle-section" id="lifecycle">
        <div className="lifecycle-motion" aria-hidden="true">
          <div className="lifecycle-motion__rail lifecycle-motion__rail--top">
            {[...appScreens, ...appScreens].map((screen, index) => (
              <NativePhone key={`life-top-${screen.label}-${index}`} screen={screen} />
            ))}
          </div>
          <div className="lifecycle-motion__rail lifecycle-motion__rail--bottom">
            {[...appScreens].reverse().concat(appScreens).map((screen, index) => (
              <NativePhone key={`life-bottom-${screen.label}-${index}`} screen={screen} />
            ))}
          </div>
        </div>
        <div className="section-heading reveal" data-reveal-ratio="0.45">
          <p>Full grocery lifecycle</p>
          <h2>Agents that automate your full grocery lifecycle.</h2>
        </div>

        <div className="lifecycle-grid">
          <div className="stage-selector reveal" data-reveal-ratio="0.55">
            {lifecycleStages.map((stage) => (
              <button
                key={stage.key}
                type="button"
                className={`stage-pill ${stage.key === activeStage ? 'is-active' : ''}`}
                onClick={() => setActiveStage(stage.key)}
              >
                <span>{stage.label}</span>
                <small>{stage.title}</small>
              </button>
            ))}
          </div>

          <div className="stage-visual reveal" data-reveal-ratio="0.55">
            <div className="stage-card" key={activeStageData.key}>
              <span>{activeStageData.label}</span>
              <h3>{activeStageData.title}</h3>
              <p>{activeStageData.body}</p>
              <strong>{activeStageData.meta}</strong>
              <div className="stage-list">
                {activeStageData.items.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="how">
        <div className="feature-editorial">
          <div className="feature-heading reveal" data-reveal-ratio="0.5">
            <p>Built for real households</p>
            <h2>Not a template. A grocery agent that learns the household.</h2>
          </div>

          <div className="feature-signal reveal" aria-hidden="true" data-reveal-ratio="0.45">
            <span>Real</span>
            <span>Life</span>
            <div className="signal-wheel">
              <i>Budget</i>
              <i>Time</i>
              <i>Diet</i>
              <i>Pantry</i>
              <i>Store</i>
              <i>Family</i>
            </div>
          </div>
        </div>

        <div className="feature-rows">
          {featureRows.map((feature, index) => (
            <div
              key={feature.title}
              className="feature-row reveal"
              data-reveal-ratio="0.7"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="proof-section">
        <div className="proof-grid reveal" data-reveal-ratio="0.5">
          {proofStats.map(([value, label]) => (
            <div key={value} className="proof-stat">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
          <blockquote>
            “The promise is simple: stop rebuilding the same grocery routine every week.”
          </blockquote>
        </div>
      </section>

      <section className="waitlist-bar reveal reveal--waitlist" id="waitlist" data-reveal-ratio="0.8">
        <img className="brand-watermark brand-watermark--waitlist" src="/logos/Logo.png" alt="" aria-hidden="true" />
        <div className="final-copy">
          <p className="wl-count">
            Join <strong id="count-num">{countStrong}</strong> others on the waitlist.
          </p>
          <span>Get early access before everyone else starts shopping this way.</span>
        </div>
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
            <div className="form-primary-row">
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="shop-location-fields" aria-label="Weekly grocery shop location">
              <input
                className="shop-location-input"
                type="text"
                name="weekly_supermarket"
                placeholder="Supermarket"
                autoComplete="organization"
                value={wlSupermarket}
                disabled={wlSubmitting}
                onChange={(e) => {
                  setWlSupermarket(e.target.value)
                  if (wlError) setWlError('')
                }}
              />
              <input
                className="shop-location-input"
                type="text"
                name="weekly_suburb"
                placeholder="Suburb"
                autoComplete="address-level2"
                value={wlSuburb}
                disabled={wlSubmitting}
                onChange={(e) => {
                  setWlSuburb(e.target.value)
                  if (wlError) setWlError('')
                }}
              />
            </div>
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
          <p>We&apos;ll be in touch when your grocery agent is ready.</p>
        </div>
        <p className="wl-fine">No spam. Unsubscribe any time.</p>
      </section>

      <footer>
        <img className="footer-logo" src="/logos/Logo.png" alt="Reasi" />
        <span className="footer-copy">© 2025 Reasi AI · Australia</span>
      </footer>
    </>
  )
}
