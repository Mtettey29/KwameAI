import { useState, useEffect } from 'react'
import { TrendingUp, History, User, CheckCircle, HelpCircle } from 'lucide-react'
import './App.css'

interface Vendor {
  id: number;
  name: string;
  business_type: string;
  momo_number: string;
}

interface TrustScore {
  trust_score: number;
  rationale: string;
  suggested_loan_limit: number;
}

interface Transaction {
  id: number;
  amount: number;
  transaction_type: string;
  description: string;
  timestamp: string;
}

function App() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [score, setScore] = useState<TrustScore | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "https://beyond-the-wallet-backend-j5l6473pwa-uc.a.run.app";
  const VENDOR_ID = 4; // Abeiku's ID from our seeding

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vendorRes = await fetch(`${API_BASE}/vendors`);
        const vendors = await vendorRes.json();
        const currentVendor = vendors.find((v: any) => v.id === VENDOR_ID);
        setVendor(currentVendor);

        const scoreRes = await fetch(`${API_BASE}/vendors/${VENDOR_ID}/trust-score`);
        setScore(await scoreRes.json());

        const transRes = await fetch(`${API_BASE}/vendors/${VENDOR_ID}/transactions`);
        setTransactions(await transRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Kwame is analyzing your digital footprint...</div>;

  return (
    <div className="dashboard">
      <header>
        <div className="kwame-header">
          <h1>Beyond the Wallet</h1>
          <p>Financial Growth Partner for West Africa</p>
        </div>
        <div className="user-profile">
          <User size={32} color="var(--primary-brown)" />
          <span>{vendor?.name}</span>
        </div>
      </header>

      <div className="main-content">
        <section className="score-card">
          <div className="trust-dial">
            <svg width="150" height="150">
              <circle cx="75" cy="75" r="65" fill="none" stroke="#eee" strokeWidth="15" />
              <circle 
                cx="75" cy="75" r="65" fill="none" 
                stroke="var(--primary-green)" 
                strokeWidth="15" 
                strokeDasharray={`${(score?.trust_score || 0) * 4.08} 408`}
                strokeLinecap="round"
              />
            </svg>
            <div className="score-text">{score?.trust_score}</div>
          </div>
          <div className="rationale-panel">
            <h3>Kwame's Trust Insight</h3>
            <div className="kwame-speech">
              "{score?.rationale}"
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-item">
            <label>Avg. Monthly Volume</label>
            <span>GH₵ {(transactions.reduce((acc, t) => acc + (t.transaction_type === 'incoming' ? t.amount : 0), 0) / 2).toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <label>Consistency Rating</label>
            <span>High <CheckCircle size={16} color="var(--primary-green)" /></span>
          </div>
          <div className="stat-item">
            <label>Business Stability</label>
            <span>98%</span>
          </div>
        </section>

        <section className="transactions-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <History size={24} color="var(--primary-brown)" />
            <h2 style={{ margin: 0 }}>Recent MoMo Activity</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.timestamp).toLocaleDateString()}</td>
                  <td>{t.description}</td>
                  <td className={`type-${t.transaction_type}`}>{t.transaction_type.toUpperCase()}</td>
                  <td>GH₵ {(t.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <aside className="sidebar">
        <div className="kwame-avatar">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame&backgroundColor=fbc02d" alt="Kwame" />
          <h3>Kwame</h3>
          <p>"Helping you grow your business, one transaction at a time."</p>
        </div>

        <div className="loan-offer">
          <TrendingUp size={48} />
          <p>Recommended Loan Limit</p>
          <h2>GH₵ {(score?.suggested_loan_limit || 0).toFixed(2)}</h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '1rem' }}>Based on your high consistency.</p>
          <button className="btn-apply">Unlock My Loan</button>
        </div>

        <div className="stat-item" style={{ background: 'var(--white)', cursor: 'pointer' }}>
          <HelpCircle size={24} color="var(--primary-brown)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ margin: 0 }}>Need advice on improving your score?</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--primary-green)', fontWeight: 600 }}>Ask Kwame</p>
        </div>
      </aside>
    </div>
  )
}

export default App
