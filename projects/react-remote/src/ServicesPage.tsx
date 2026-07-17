import { useId, useMemo, useState } from 'react'

type Service = {
  id: string
  title: string
  description: string
  category: string
}

const SERVICES = [
  {
    id: 'onboarding',
    title: 'Customer Onboarding',
    description: 'Onboard a new customer and help them open an account.',
    category: 'Customer care',
  },
  {
    id: 'customer-360',
    title: 'Customer 360°',
    description: 'View customer profiles, accounts, and transaction details in one place.',
    category: 'Customer care',
  },
  {
    id: 'swift',
    title: 'SWIFT',
    description: 'Support secure international and non-member transaction workflows.',
    category: 'Payments',
  },
  {
    id: 'teller',
    title: 'Teller Services',
    description: 'Find information to help customers complete branch transactions.',
    category: 'Branch operations',
  },
  {
    id: 'branch-services',
    title: 'Branch Services',
    description: 'Access tools for customers who need assistance while visiting a branch.',
    category: 'Branch operations',
  },
  {
    id: 'customer-requests',
    title: 'Customer service requests',
    description: 'Review and support customer enquiries and service requests.',
    category: 'Customer care',
  },
  {
    id: 'merchant-portal',
    title: 'Merchant Portal',
    description: 'Configure and expose Equity APIs and services to merchants.',
    category: 'Merchant services',
  },
  {
    id: 'bank-insights',
    title: 'Bank Insights',
    description: 'Search transactions, confirm payments, and access partner insights.',
    category: 'Insights',
  },
  {
    id: 'cards',
    title: 'Cards',
    description: 'Access card operations, inventory, and customer card support.',
    category: 'Cards',
  },
] as const satisfies readonly Service[]

export function ServicesPage() {
  const searchInputId = useId()
  const searchHintId = useId()
  const [draftQuery, setDraftQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')

  const filteredServices = useMemo(() => {
    const query = submittedQuery.trim().toLocaleLowerCase()

    if (!query) {
      return SERVICES
    }

    return SERVICES.filter((service) =>
      `${service.title} ${service.description} ${service.category}`
        .toLocaleLowerCase()
        .includes(query),
    )
  }, [submittedQuery])

  const clearSearch = () => {
    setDraftQuery('')
    setSubmittedQuery('')
  }

  const trimmedQuery = submittedQuery.trim()
  const resultLabel = trimmedQuery
    ? `${filteredServices.length} ${filteredServices.length === 1 ? 'service' : 'services'} found for “${trimmedQuery}”.`
    : `${filteredServices.length} services available.`

  return (
    <main className="services-page">
      <header className="services-header">
        <p className="services-eyebrow">Branch Service Hub</p>
        <h1>Find the right service</h1>
        <p className="services-intro">
          Search branch, customer, payment, and merchant tools from one focused workspace.
        </p>
      </header>

      <section className="services-search-panel" aria-labelledby="services-search-heading">
        <h2 id="services-search-heading">Search services</h2>
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            setSubmittedQuery(draftQuery.trim())
          }}
        >
          <label htmlFor={searchInputId}>Service name or task</label>
          <div className="services-search-row">
            <input
              id={searchInputId}
              type="search"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  clearSearch()
                }
              }}
              placeholder="Try “customer”, “cards”, or “payments”"
              aria-describedby={searchHintId}
            />
            {draftQuery && (
              <button className="services-clear-button" type="button" onClick={clearSearch}>
                Clear
              </button>
            )}
            <button className="services-search-button" type="submit">
              Search
            </button>
          </div>
          <p id={searchHintId} className="services-search-hint">
            Search matches service names, descriptions, and categories.
          </p>
        </form>
      </section>

      <section className="services-results" aria-labelledby="services-results-heading">
        <div className="services-results-heading">
          <h2 id="services-results-heading">Available services</h2>
          <p role="status" aria-live="polite" aria-atomic="true">
            {resultLabel}
          </p>
        </div>

        {filteredServices.length > 0 ? (
          <ul className="services-grid">
            {filteredServices.map((service) => (
              <li key={service.id}>
                <article className="service-card">
                  <p className="service-category">{service.category}</p>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="services-empty-state">
            <h3>No services found</h3>
            <p>Try a broader term or clear the search to browse every service.</p>
            <button type="button" onClick={clearSearch}>
              View all services
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
