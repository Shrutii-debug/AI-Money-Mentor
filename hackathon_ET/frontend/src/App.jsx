import { useState } from 'react'
import Upload from './components/Upload.jsx'
import XrayReport from './components/XrayReport.jsx'
import FirePlanner from './components/FirePlanner.jsx'
import HealthScore from './components/HealthScore.jsx'

const API = 'https://ai-money-mentor-1kt4.onrender.com'

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('xray')

  async function handleAnalyze({ file, age, monthly_income, monthly_expense, use_demo }) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const fd = new FormData()
      if (file) fd.append('file', file)
      fd.append('age', age)
      fd.append('monthly_income', monthly_income)
      fd.append('monthly_expense', monthly_expense)
      fd.append('use_demo', use_demo ? 'true' : 'false')

      const res = await fetch(`${API}/analyze`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setResult(data)
      setActiveTab('xray')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'xray', label: '🔬 Portfolio X-Ray' },
    { id: 'fire', label: '🔥 FIRE Planner' },
    { id: 'health', label: '💯 Health Score' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #111 100%)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, #0a0a0a, #1a0a00)',
        borderBottom: '1px solid #ff6b0033',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <div style={{ fontSize: 28 }}>💰</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#ff6b00', letterSpacing: -0.5 }}>AI Money Mentor</div>
          <div style={{ fontSize: 12, color: '#888' }}>ET AI Hackathon 2026 · PS9</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#555', maxWidth: 300, textAlign: 'right' }}>
          ⚠️ Educational purposes only. Not SEBI-registered financial advice.
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        {!result && !loading && (
          <Upload onAnalyze={handleAnalyze} />
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#ff6b00', marginBottom: 8 }}>Analysing your portfolio...</div>
            <div style={{ color: '#888', fontSize: 14 }}>Running 3 AI agents: X-Ray → FIRE Planner → Health Score</div>
            <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
              {['Parsing CAMS data...', 'Computing XIRR...', 'Detecting overlap...', 'Projecting FIRE timeline...'].map((m, i) => (
                <div key={i} style={{
                  background: '#1a1a1a', border: '1px solid #333', borderRadius: 20,
                  padding: '4px 12px', fontSize: 12, color: '#ff6b00',
                  animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`
                }}>{m}</div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#1a0000', border: '1px solid #ff000044', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>❌</div>
            <div style={{ color: '#ff4444', fontWeight: 600 }}>{error}</div>
            <button onClick={() => setError(null)} style={{
              marginTop: 16, background: '#ff6b00', border: 'none', color: '#fff',
              padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600
            }}>Try Again</button>
          </div>
        )}

        {result && (
          <div>
            {/* Investor Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1a0a00, #2a1500)',
              border: '1px solid #ff6b0044',
              borderRadius: 16, padding: '20px 28px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 24, flexWrap: 'wrap', gap: 16
            }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{result.investor?.name}</div>
                <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
                  Age {result.investor?.age} · ₹{(result.investor?.monthly_income || 0).toLocaleString('en-IN')}/mo income
                  {result.data_source === 'demo' && <span style={{ background: '#ff6b0033', color: '#ff6b00', borderRadius: 10, padding: '2px 8px', fontSize: 11, marginLeft: 10 }}>DEMO MODE</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                {[
                  ['Total Invested', `₹${(result.xray?.total_invested || 0).toLocaleString('en-IN')}`],
                  ['Current Value', `₹${(result.xray?.total_current_value || 0).toLocaleString('en-IN')}`],
                  ['Health Score', `${result.health?.total_score || 0}/100`],
                ].map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#ff6b00' }}>{val}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setResult(null)} style={{
                background: '#1a1a1a', border: '1px solid #333', color: '#aaa',
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13
              }}>← New Analysis</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#111', borderRadius: 12, padding: 4 }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  flex: 1, padding: '10px 16px', borderRadius: 9, border: 'none',
                  background: activeTab === t.id ? '#ff6b00' : 'transparent',
                  color: activeTab === t.id ? '#fff' : '#888',
                  cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'all 0.2s'
                }}>{t.label}</button>
              ))}
            </div>

            {activeTab === 'xray' && <XrayReport data={result.xray} />}
            {activeTab === 'fire' && <FirePlanner data={result.fire} />}
            {activeTab === 'health' && <HealthScore data={result.health} />}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>
    </div>
  )
}