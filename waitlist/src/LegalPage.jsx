import { useEffect } from 'react'
import './LegalPage.css'

const EFFECTIVE_DATE = '31 August 2026'
const CONTACT_EMAIL = 'luke.nguyen@reasiai.com'

function LegalLayout({ title, summary, children, showDate = true }) {
  useEffect(() => {
    document.title = `${title} | Reasi`
    window.scrollTo(0, 0)
  }, [title])

  return (
    <div className="legal-page">
      <header className="legal-header">
        <a className="legal-brand" href="/" aria-label="Reasi home">
          <img src="/logos/Logo.png" alt="Reasi" />
        </a>
        <a className="legal-back" href="/">
          Back to Reasi
        </a>
      </header>

      <main className="legal-main">
        <p className="legal-kicker">Reasi legal</p>
        <h1>{title}</h1>
        <p className="legal-summary">{summary}</p>
        {showDate && <p className="legal-date">Effective and last updated: {EFFECTIVE_DATE}</p>}

        <div className="legal-rule" />
        <article className="legal-content">{children}</article>
      </main>

      <footer className="legal-footer">
        <span>Reasi AI, Australia</span>
        <nav aria-label="Legal pages">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/support">Support</a>
          <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
        </nav>
      </footer>
    </div>
  )
}

function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      summary="How Reasi collects, uses, stores, and deletes information when you plan meals and shop."
    >
      <section>
        <h2>1. About this policy</h2>
        <p>
          This policy explains how Reasi AI ("Reasi", "we", "us") handles personal information
          through the Reasi iOS app, website, and related services. Reasi is based in Australia.
          Questions or privacy requests can be sent to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <ul>
          <li><strong>Account information:</strong> your email address, user ID, sign-in provider, display name, and authentication status.</li>
          <li><strong>Preferences:</strong> household size, grocery goals, food styles, dietary choices, selected store, and onboarding answers.</li>
          <li><strong>Planning and shopping data:</strong> generated meal plans, recipes, shopping lists, checked items, imported products, captured prices, and store-route information.</li>
          <li><strong>Photos and scans:</strong> product photos, barcode scans, and handwritten-list photos you choose to submit for processing.</li>
          <li><strong>Assistant content:</strong> messages you send to the shopping assistant and the context needed to answer about your current list and products.</li>
          <li><strong>Subscription information:</strong> product, entitlement, renewal, expiry, and restore status. Reasi does not receive your full payment-card details.</li>
          <li><strong>Technical and usage data:</strong> app version, device and network state, reliability information, and events such as onboarding completion, plan generation, store selection, and feature use.</li>
        </ul>
      </section>

      <section>
        <h2>3. How we use information</h2>
        <p>We use information to:</p>
        <ul>
          <li>create and sync your account, preferences, plans, lists, and shopping progress;</li>
          <li>generate meal plans and organize lists for your selected store;</li>
          <li>identify products, extract photographed lists, compare products, and answer shopping questions;</li>
          <li>provide subscription access, restore purchases, and protect the one-plan free preview;</li>
          <li>measure reliability, weekly return, and feature usefulness without intentionally sending raw grocery lists, photos, full chat messages, or email addresses to product analytics;</li>
          <li>prevent abuse, investigate errors, secure accounts, and comply with legal obligations.</li>
        </ul>
      </section>

      <section>
        <h2>4. AI processing and product information</h2>
        <p>
          Reasi sends the minimum relevant request data to server-side AI services for meal generation,
          product and image understanding, handwritten-list extraction, comparisons, and assistant replies.
          The app does not call OpenAI directly and does not contain an OpenAI secret key.
        </p>
        <p>
          AI output can be incomplete or wrong. Prices, availability, product details, ingredients,
          allergens, nutrition, and aisle locations may change. Reasi shows source, freshness, and
          uncertainty where available, but you should verify important details with the retailer and product label.
        </p>
      </section>

      <section>
        <h2>5. Service providers</h2>
        <p>We use providers that process information for Reasi, including:</p>
        <ul>
          <li><strong>Supabase</strong> for authentication, database storage, private uploads, and server functions;</li>
          <li><strong>OpenAI</strong> for server-side AI, language, image, and structured-output processing;</li>
          <li><strong>PostHog</strong> for product analytics and reliability measurement;</li>
          <li><strong>RevenueCat and Apple</strong> for subscriptions, entitlement status, trials, renewal, and purchase restore;</li>
          <li><strong>Apple and Google</strong> when you choose their sign-in methods;</li>
          <li><strong>retailers, product sources, and image providers</strong> for product, price, freshness, source, and meal-image information;</li>
          <li><strong>Vercel</strong> for hosting the Reasi website.</li>
        </ul>
        <p>
          These providers may process information in Australia or other countries under their own
          security and privacy terms. We do not sell personal information or use it for third-party targeted advertising.
        </p>
      </section>

      <section>
        <h2>6. Storage, retention, and security</h2>
        <p>
          Reasi uses access controls, encrypted network transport, private upload paths, Keychain-backed
          sessions, and database row-level security. No online system is completely secure.
        </p>
        <p>
          We keep account and shopping information while your account is active and as needed to provide
          the service, resolve disputes, prevent abuse, meet legal obligations, and maintain limited backups.
          Product source snapshots may be retained to explain where a displayed fact came from. We delete
          or de-identify information when it is no longer needed.
        </p>
      </section>

      <section>
        <h2>7. Your choices and account deletion</h2>
        <p>
          You can change preferences, sign out, manage photo permission in iOS Settings, and request account
          deletion from Profile in the app. Account deletion removes or de-identifies Reasi-owned profile,
          preference, plan, list, assistant, import, and upload data, and requests deletion of the linked
          RevenueCat customer record where supported.
        </p>
        <p>
          Deleting a Reasi account does not cancel an App Store subscription. Manage or cancel subscriptions
          in your Apple ID subscription settings. You can also contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to
          request access, correction, or deletion, subject to applicable law.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p>
          Reasi is not directed to children under 13, and we do not knowingly collect their personal
          information. Contact us if you believe a child has provided information to Reasi.
        </p>
      </section>

      <section>
        <h2>9. Changes</h2>
        <p>
          We may update this policy as Reasi changes. We will update the date above and provide additional
          notice in the app when a change materially affects how information is handled.
        </p>
      </section>
    </LegalLayout>
  )
}

function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      summary="The practical rules for using Reasi, its AI shopping tools, and Reasi Pro."
    >
      <section>
        <h2>1. Agreement</h2>
        <p>
          These terms apply when you use the Reasi iOS app, website, and related services. By creating an
          account or using Reasi, you agree to these terms and the <a href="/privacy">Privacy Policy</a>.
          If you do not agree, do not use the service.
        </p>
      </section>

      <section>
        <h2>2. Accounts</h2>
        <p>
          You must provide accurate account information, protect access to your device and account, and tell
          us promptly about suspected unauthorized use. You are responsible for activity through your account.
          Reasi is not intended for children under 13.
        </p>
      </section>

      <section>
        <h2>3. What Reasi provides</h2>
        <p>
          Reasi can generate meal plans and recipes, organize shopping lists by supported store, preserve
          shopping progress, retrieve and compare product information, process photos and barcodes, and answer
          shopping questions. Features, supported stores, product coverage, and availability may change.
        </p>
      </section>

      <section>
        <h2>4. AI, recipes, prices, and store guidance</h2>
        <p>
          Reasi uses automated systems and third-party data. Output may be inaccurate, incomplete, delayed,
          or unsuitable for you. Reasi is not medical, dietary, allergy, financial, or professional advice.
          Check ingredients, allergens, food safety, nutrition, package labels, prices, availability, and store
          signs before relying on a result.
        </p>
        <p>
          Price and aisle information is presented with source and freshness where possible. A captured price
          is not a guaranteed checkout price, and an uncertain location will not be represented as exact.
        </p>
      </section>

      <section>
        <h2>5. Free preview and Reasi Pro</h2>
        <p>
          An eligible account may receive one complete free-preview plan. Its existing recipes, list, manual
          edits, check-off, store regrouping, assistant, scans, imports, and comparisons remain usable as shown
          in the app. Generating additional plans and some smart tools may require Reasi Pro.
        </p>
        <p>
          Reasi Pro may be offered as monthly and annual auto-renewing subscriptions. Current localized price,
          billing period, trial eligibility, and renewal terms appear on the Apple purchase sheet before you buy.
          If an introductory trial is offered, it converts to the displayed paid subscription unless cancelled
          before the trial ends. Apple charges your Apple ID and handles billing, renewal, cancellation, refunds,
          and payment methods under its terms.
        </p>
        <p>
          Manage or cancel Reasi Pro in your Apple ID subscription settings. Deleting your Reasi account or the
          app does not cancel the subscription. Restore Purchases can reconnect an eligible App Store purchase.
        </p>
      </section>

      <section>
        <h2>6. Acceptable use</h2>
        <p>You must not:</p>
        <ul>
          <li>use Reasi unlawfully, deceptively, or to harm another person;</li>
          <li>attempt to bypass account, free-preview, subscription, rate, or security controls;</li>
          <li>probe, scrape, reverse engineer, disrupt, or overload the service except where law expressly allows;</li>
          <li>upload content you do not have the right to use, or content that is malicious or infringes another person's rights;</li>
          <li>use automated output as a substitute for checking safety-critical food, allergy, health, or pricing information.</li>
        </ul>
      </section>

      <section>
        <h2>7. Your content and Reasi rights</h2>
        <p>
          You keep ownership of content you submit. You give Reasi a limited licence to host, process, reproduce,
          and transform that content only as needed to operate, secure, and improve the service. Reasi and its
          licensors retain rights in the app, brand, software, design, and service content. Third-party product,
          retailer, image, and source content remains subject to its owner's terms.
        </p>
      </section>

      <section>
        <h2>8. Availability and changes</h2>
        <p>
          We aim to keep Reasi reliable but do not promise uninterrupted or error-free availability. We may
          change, suspend, or discontinue features, stores, data sources, or beta access. We will take reasonable
          steps to avoid unnecessary loss of saved user data.
        </p>
      </section>

      <section>
        <h2>9. Suspension and deletion</h2>
        <p>
          You may delete your account from Profile. We may restrict or suspend access when reasonably necessary
          to protect users, providers, Reasi, or the law, including for serious misuse or security risk. Provisions
          that by their nature should continue after deletion or termination will continue.
        </p>
      </section>

      <section>
        <h2>10. Consumer rights and liability</h2>
        <p>
          Nothing in these terms excludes rights or guarantees that cannot be excluded under the Australian
          Consumer Law or other applicable law. To the maximum extent permitted by law, Reasi is not liable for
          indirect or consequential loss arising from unavailable services, third-party data, or reliance on AI,
          price, stock, nutrition, allergy, recipe, or aisle information that you did not independently verify.
        </p>
      </section>

      <section>
        <h2>11. Governing law and contact</h2>
        <p>
          These terms are governed by the laws of New South Wales, Australia, subject to any mandatory law that
          applies to you. Questions can be sent to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section>
        <h2>12. Changes to these terms</h2>
        <p>
          We may update these terms as Reasi changes. We will update the date above and provide additional notice
          when a material change requires it. Continued use after an update takes effect means you accept the
          updated terms, unless applicable law requires a different form of consent.
        </p>
      </section>
    </LegalLayout>
  )
}

function SupportPage() {
  return (
    <LegalLayout
      title="Reasi Support"
      summary="Help with your account, meal plans, shopping lists, store routes, and photo tools."
      showDate={false}
    >
      <section>
        <h2>Contact Reasi</h2>
        <p>
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> for app issues, feedback,
          privacy requests, or account help. Reasi is based in Sydney, New South Wales, Australia.
        </p>
        <p>
          Please include the device model, iOS version, and a short description of what happened.
          Do not email passwords, sign-in codes, payment details, or sensitive photos.
        </p>
      </section>

      <section>
        <h2>Sign-in and verification</h2>
        <p>
          Reasi supports Sign in with Apple, Google, and email. If email sign-up is waiting for
          verification, open the latest verification message and then return to Reasi. Password
          reset is available from the email sign-in screen.
        </p>
      </section>

      <section>
        <h2>Meal plans and shopping lists</h2>
        <p>
          Plan generation needs an internet connection and can take a little time. If a request
          fails, keep your previous plan and try again. Shopping progress is saved to your account
          and restored after sign-in.
        </p>
      </section>

      <section>
        <h2>Store routes</h2>
        <p>Reasi currently supports these Sydney stores:</p>
        <ul>
          <li>Coles Top Ryde</li>
          <li>Coles East Village</li>
          <li>Coles Rhodes</li>
          <li>Coles Surry Hills</li>
          <li>Woolworths Rhodes</li>
        </ul>
        <p>
          Product availability, price, and aisle information can change. Reasi marks uncertain
          locations instead of presenting an unverified aisle as exact.
        </p>
      </section>

      <section>
        <h2>Camera and photos</h2>
        <p>
          Camera access is used only when you choose barcode scanning, product identification, or
          handwritten-list extraction. You can change camera and photo access in iOS Settings.
        </p>
      </section>

      <section>
        <h2>Delete your account</h2>
        <p>
          In Reasi, open Profile, choose Delete account, and confirm. This removes or de-identifies
          Reasi-owned account data as described in the <a href="/privacy">Privacy Policy</a>. You can
          also email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> for help with a deletion request.
        </p>
      </section>
    </LegalLayout>
  )
}

export default function LegalPage({ document }) {
  if (document === 'terms') return <TermsOfService />
  if (document === 'support') return <SupportPage />
  return <PrivacyPolicy />
}
