import { SectionCard } from '../../../components/ui/SectionCard'
import {
  apiFoundations,
  architectureTokens,
  roadmapItems,
  setupChecklist,
  stackSections,
} from '../data/phaseOneData'

export function HomePage() {
  return (
    <main className="dashboard">
      <section className="hero" id="overview">
        <div className="hero__panel">
          <p className="hero__eyebrow">Production-minded setup</p>
          <h2 className="hero__title">Build the vault before the knowledge.</h2>
          <p className="hero__description">
            Phase 1 establishes the application boundary for MindVault: a React
            frontend with routing and query providers, plus an Express backend
            scaffold with Prisma, environment configuration, and structured API
            layers.
          </p>

          <div className="hero__actions">
            <a className="button button--primary" href="#architecture">
              Review architecture
            </a>
            <a className="button button--secondary" href="#roadmap">
              See next phases
            </a>
          </div>

          <div className="hero__meta">
            <span>React Router ready</span>
            <span>TanStack Query wired</span>
            <span>Express + Prisma scaffolded</span>
          </div>
        </div>

        <aside className="status-panel" aria-label="Setup progress">
          <div className="status-panel__badge">
            <span className="status-panel__dot" />
            Phase 1 complete
          </div>
          <div>
            <h2>Foundation summary</h2>
            <p>
              The project now has a clear split between UI composition, API
              bootstrap, and future domain modules.
            </p>
          </div>
          <ul className="status-panel__list">
            <li>Central app providers and route composition are in place.</li>
            <li>Server middleware handles not-found and error serialization.</li>
            <li>Prisma is configured for Supabase PostgreSQL connectivity.</li>
          </ul>
        </aside>
      </section>

      <section className="dashboard-grid" id="architecture">
        <div className="dashboard-grid__half">
          <SectionCard
            badge="Frontend"
            description="The client is organized around app, components, features, and shared utilities."
            eyebrow="Frontend architecture"
            title="What ships on the React side"
          >
            <ul className="setup-list">
              {setupChecklist.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <div className="dashboard-grid__half">
          <SectionCard
            badge="Backend"
            description="The API shell is versioned and intentionally thin so later phases can stay modular."
            eyebrow="Server architecture"
            title="What ships on the Express side"
          >
            <ul className="bulleted-list">
              <li>`server/src/app.js` composes middleware and API routes.</li>
              <li>`server/src/modules` holds controllers, services, and routes.</li>
              <li>`server/src/lib` centralizes Prisma access and shared helpers.</li>
              <li>`server/src/config` validates environment variables once.</li>
            </ul>
          </SectionCard>
        </div>

        <div className="dashboard-grid__third">
          <SectionCard
            badge="Stack"
            description="Every layer already matches the long-term roadmap from the request."
            eyebrow="Platform choices"
            title="Core technology map"
          >
            <div className="stack-grid">
              {stackSections.map((item) => (
                <article className="stack-card" key={item.label}>
                  <span className="stack-card__value">{item.value}</span>
                  <h3 className="stack-card__title">{item.label}</h3>
                  <p className="stack-card__description">{item.description}</p>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="dashboard-grid__third" id="api">
          <SectionCard
            badge="API"
            description="Phase 1 avoids business features but still exposes operational endpoints for local verification."
            eyebrow="Initial endpoints"
            title="Backend API design"
          >
            <div className="api-grid">
              {apiFoundations.map((item) => (
                <article className="api-card" key={item.title}>
                  <span className="api-card__method">{item.method}</span>
                  <h3 className="api-card__title">{item.title}</h3>
                  <p className="api-card__description">{item.description}</p>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="dashboard-grid__third">
          <SectionCard
            badge="Principles"
            description="The scaffold keeps implementation details behind stable seams so future features stay manageable."
            eyebrow="Design constraints"
            title="Architecture tokens"
          >
            <ul className="token-list">
              {architectureTokens.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <div className="dashboard-grid__half" id="roadmap">
          <SectionCard
            badge="Next"
            description="This phase deliberately stops at infrastructure so authentication can land on stable ground."
            eyebrow="Approval checkpoint"
            title="What Phase 2 plugs into"
          >
            <ol className="roadmap-list">
              {roadmapItems.map((item) => (
                <li key={item.title}>
                  <div className="roadmap-list__content">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>

        <div className="dashboard-grid__half">
          <SectionCard
            badge="Database"
            description="Business tables are intentionally deferred, but the datasource and Prisma client lifecycle are ready."
            eyebrow="Phase 1 database state"
            title="Prisma and Supabase setup"
          >
            <ul className="bulleted-list">
              <li>The Prisma datasource targets PostgreSQL for Supabase.</li>
              <li>The initial schema contains a generator and datasource only.</li>
              <li>User, note, collection, and search models can be added in Phase 2 onward.</li>
              <li>A shared Prisma client module prevents duplicate client creation.</li>
            </ul>
          </SectionCard>
        </div>
      </section>
    </main>
  )
}
