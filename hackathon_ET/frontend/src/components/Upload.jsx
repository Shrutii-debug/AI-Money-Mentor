import { useState, useRef } from 'react'

export default function Upload({ onAnalyze }) {
  const [file, setFile] = useState(null)
  const [age, setAge] = useState(32)
  const [income, setIncome] = useState(120000)
  const [expense, setExpense] = useState(65000)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  function handleFile(f) {
    if (f && f.type === 'application/pdf') setFile(f)
    else alert('Please upload a PDF file (CAMS statement)')
  }

  const inputStyle = {
    background: '#1a1a1a', border: '1px solid #333', borderRadius: 8,
    padding: '10px 14px', color: '#f1f1f1', fontSize: 15, width: '100%',
    outline: 'none'
  }
  const labelStyle = { fontSize: 12, color: '#888', marginBottom: 4, display: 'block', fontWeight: 600 }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🤖</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          AI <span style={{ color: '#ff6b00' }}>Money Mentor</span>
        </h1>
        <p style={{ color: '#888', fontSize: 16 }}>
          Upload your CAMS statement and get your Portfolio X-Ray, FIRE number, and Money Health Score in 30 seconds.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        style={{
          border: `2px dashed ${dragging ? '#ff6b00' : file ? '#22cc88' : '#333'}`,
          borderRadius: 16, padding: '32px 24px', textAlign: 'center',
          cursor: 'pointer', marginBottom: 24,
          background: dragging ? '#1a0a0033' : '#111',
          transition: 'all 0.2s'
        }}
      >
        <input ref={fileRef} type="file" accept=".pdf" hidden onChange={e => handleFile(e.target.files[0])} />
        <div style={{ fontSize: 40, marginBottom: 8 }}>{file ? '✅' : '📄'}</div>
        {file
          ? <div style={{ color: '#22cc88', fontWeight: 700 }}>{file.name}</div>
          : <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Drop your CAMS PDF here</div>
            <div style={{ color: '#666', fontSize: 13 }}>Download from MFCentral / Zerodha Coin / Groww → "Statement"</div>
          </div>
        }
      </div>

      {/* User Inputs */}
      <div style={{ background: '#111', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>📊 Your Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Age</label>
            <input type="number" value={age} onChange={e => setAge(+e.target.value)} style={inputStyle} min={20} max={65} />
          </div>
          <div>
            <label style={labelStyle}>Monthly Income (₹)</label>
            <input type="number" value={income} onChange={e => setIncome(+e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Monthly Expense (₹)</label>
            <input type="number" value={expense} onChange={e => setExpense(+e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => onAnalyze({ file, age, monthly_income: income, monthly_expense: expense, use_demo: false })}
          style={{
            flex: 1, background: '#ff6b00', border: 'none', color: '#fff',
            padding: '14px 24px', borderRadius: 12, cursor: 'pointer',
            fontWeight: 800, fontSize: 16, opacity: file ? 1 : 0.5
          }}
          disabled={!file}
        >
          🔬 Analyse My Portfolio
        </button>
        <button
          onClick={() => onAnalyze({ file: null, age, monthly_income: income, monthly_expense: expense, use_demo: true })}
          style={{
            background: '#1a1a1a', border: '1px solid #333', color: '#aaa',
            padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
            fontWeight: 700, fontSize: 14
          }}
        >
          Try Demo
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16, color: '#555', fontSize: 12 }}>
        Your data is processed locally. No data is stored.
      </div>
    </div>
  )
}