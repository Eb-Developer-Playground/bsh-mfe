export function CardsPage() {
  return (
    <main className="cards-page">
      <header className="cards-header">
        <p className="cards-eyebrow">Branch Service Hub</p>
        <h1>Cards</h1>
        <p>
          Access card operations, inventory, and customer card support from one workspace.
        </p>
      </header>

      <section className="cards-workspace" aria-labelledby="cards-workspace-heading">
        <p className="cards-route">React service component</p>
        <h2 id="cards-workspace-heading">Card operations</h2>
        <p>
          The shell matched <code>/react-remote/cards</code> and mounted the dedicated React
          cards component.
        </p>
      </section>
    </main>
  )
}
