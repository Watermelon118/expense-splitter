import "./App.css";

function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Shared expenses</p>
          <h1>Expense Splitter</h1>
        </div>
        <button className="primary-button" type="button">
          New activity
        </button>
      </header>

      <section className="workspace" aria-label="Expense splitter workspace">
        <aside className="activity-sidebar" aria-label="Activities">
          <div className="section-heading">
            <h2>Activities</h2>
            <span>2 saved</span>
          </div>

          <article className="activity-card activity-card-active">
            <h3>Queenstown Trip</h3>
            <p>4 people · 3 expenses · Total $1,000.00</p>
            <span>Updated today</span>
          </article>

          <article className="activity-card">
            <h3>Group Dinner</h3>
            <p>5 people · 4 expenses · Total $320.00</p>
            <span>Updated yesterday</span>
          </article>
        </aside>

        <section className="activity-detail" aria-label="Selected activity">
          <div className="detail-header">
            <div>
              <p className="eyebrow">Current activity</p>
              <h2>Queenstown Trip</h2>
            </div>
            <div className="total-box">
              <span>Total spent</span>
              <strong>$1,000.00</strong>
            </div>
          </div>

          <div className="detail-grid">
            <section className="panel">
              <div className="section-heading">
                <h3>People</h3>
                <span>4 members</span>
              </div>
              <ul className="people-list">
                <li>A</li>
                <li>B</li>
                <li>C</li>
                <li>D</li>
              </ul>
            </section>

            <section className="panel">
              <div className="section-heading">
                <h3>Expenses</h3>
                <span>3 items</span>
              </div>
              <ul className="expense-list">
                <li>
                  <span>Hotel</span>
                  <strong>A paid $300.00</strong>
                </li>
                <li>
                  <span>Fuel</span>
                  <strong>B paid $200.00</strong>
                </li>
                <li>
                  <span>Car Rental</span>
                  <strong>C paid $500.00</strong>
                </li>
              </ul>
            </section>

            <section className="panel">
              <div className="section-heading">
                <h3>Balances</h3>
                <span>Live summary</span>
              </div>
              <ul className="balance-list">
                <li>
                  <span>A</span>
                  <strong className="positive">is owed $50.00</strong>
                </li>
                <li>
                  <span>B</span>
                  <strong className="negative">owes $50.00</strong>
                </li>
                <li>
                  <span>C</span>
                  <strong className="positive">is owed $250.00</strong>
                </li>
                <li>
                  <span>D</span>
                  <strong className="negative">owes $250.00</strong>
                </li>
              </ul>
            </section>

            <section className="panel settlement-panel">
              <div className="section-heading">
                <h3>Settlement</h3>
                <span>2 transfers</span>
              </div>
              <ol className="settlement-list">
                <li>D pays C $250.00</li>
                <li>B pays A $50.00</li>
              </ol>
              <button className="secondary-button" type="button">
                Settle
              </button>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
