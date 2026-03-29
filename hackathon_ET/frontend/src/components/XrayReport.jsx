import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'

const card = { background: '#111', border: '1px solid #222', borderRadius: 16, padding: 24, marginBottom: 16 }
const tag = (color, bg, text) => (
  <span style={{ background: bg, color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{text}</span>
)

export default function XrayReport({ data }) {
  if (!data) return null
  const { funds, overlapping_pairs, total_invested, total_current_value, total_gain, total_expense_drag_20y, portfolio_xirr, benchmark_xirr, llm_analysis } = data
  const chartData = funds.map(f => ({
    name: f.scheme_name.split(' ')[0] + '…',
    full_name: f.scheme_name,
    xirr: f.xirr,
    benchmark: benchmark_xirr,
    alpha: f.alpha,
  }))

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total Invested', val: `₹${total_invested.toLocaleString('en-IN')}`, icon: '💵' },
          { label: 'Current Value', val: `₹${total_current_value.toLocaleString('en-IN')}`, icon: '📈', positive: true },
          { label: 'Portfolio XIRR', val: `${portfolio_xirr}%`, icon: '📊', positive: portfolio_xirr > benchmark_xirr },
          { label: '20Y Expense Drag', val: `₹${total_expense_drag_20y.toLocaleString('en-IN')}`, icon: '⚠️', negative: true },
        ].map(c => (
          <div key={c.label} style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 24 }}>{c.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.positive ? '#22cc88' : c.negative ? '#ff4444' : '#f1f1f1', marginTop: 4 }}>{c.val}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* XIRR Chart */}
      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>📊 XIRR vs Benchmark ({benchmark_xirr}%)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
            <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} angle={-25} textAnchor="end" />
            <YAxis tick={{ fill: '#888', fontSize: 11 }} unit="%" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: 12, fontSize: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, maxWidth: 200 }}>{d.full_name}</div>
                    <div>XIRR: <b style={{ color: d.xirr > benchmark_xirr ? '#22cc88' : '#ff4444' }}>{d.xirr}%</b></div>
                    <div>Benchmark: <b>{benchmark_xirr}%</b></div>
                    <div>Alpha: <b style={{ color: d.alpha >= 0 ? '#22cc88' : '#ff4444' }}>{d.alpha > 0 ? '+' : ''}{d.alpha}%</b></div>
                  </div>
                )
              }}
            />
            <ReferenceLine y={benchmark_xirr} stroke="#ff6b00" strokeDasharray="4 4" label={{ value: 'Benchmark', fill: '#ff6b00', fontSize: 11 }} />
            <Bar dataKey="xirr" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.xirr >= benchmark_xirr ? '#22cc88' : '#ff4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Fund Table */}
      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>🗂️ Fund-by-Fund Breakdown</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                {['Fund', 'Category', 'XIRR', 'Alpha', 'Expense Ratio', '20Y Drag', 'Flags'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {funds.map((f, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '10px 12px', maxWidth: 200 }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{f.scheme_name.replace(' - Direct Growth', '').replace(' - Regular Growth', '')}</div>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#aaa', fontSize: 12 }}>{f.category}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: f.xirr >= benchmark_xirr ? '#22cc88' : '#ff4444' }}>{f.xirr}%</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: f.alpha >= 0 ? '#22cc88' : '#ff4444' }}>{f.alpha > 0 ? '+' : ''}{f.alpha}%</td>
                  <td style={{ padding: '10px 12px', color: f.is_high_expense ? '#ff4444' : '#aaa' }}>{f.expense_ratio}%</td>
                  <td style={{ padding: '10px 12px', color: f.expense_drag_20y > 0 ? '#ff8800' : '#aaa' }}>
                    {f.expense_drag_20y > 0 ? `₹${f.expense_drag_20y.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {f.is_regular_plan && tag('#ff4444', '#ff444422', 'Regular Plan')}
                      {f.is_high_expense && tag('#ff8800', '#ff880022', 'High ER')}
                      {f.alpha >= 2 && tag('#22cc88', '#22cc8822', '⭐ Outperformer')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overlap Alert */}
      {overlapping_pairs.length > 0 && (
        <div style={{ ...card, border: '1px solid #ff880044', background: '#1a1000' }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>⚠️ Fund Overlap Detected</div>
          {overlapping_pairs.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ flex: 1, fontSize: 13 }}>
                <b>{p.fund_a}</b> + <b>{p.fund_b}</b>
              </div>
              <div style={{ color: '#ff8800', fontWeight: 700 }}>{p.overlap_pct}% overlap</div>
              <div style={{ color: '#888', fontSize: 12 }}>{p.category}</div>
            </div>
          ))}
          <div style={{ marginTop: 12, color: '#ff8800', fontSize: 13 }}>
            💡 Overlapping funds mean you're paying multiple expense ratios for the same underlying stocks.
          </div>
        </div>
      )}

      {/* AI Insights */}
      {llm_analysis?.key_findings && (
        <div style={{ ...card, border: '1px solid #ff6b0044' }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>🤖 AI Analysis</div>
          <div style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{llm_analysis.summary}</div>
          {llm_analysis.key_findings.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: '#ff6b00', fontWeight: 800 }}>→</span>
              <span style={{ color: '#ccc' }}>{f}</span>
            </div>
          ))}
          {llm_analysis.top_recommendation && (
            <div style={{ background: '#ff6b0022', border: '1px solid #ff6b0044', borderRadius: 8, padding: 12, marginTop: 12, fontSize: 13, color: '#ff8800' }}>
              ⭐ Top Recommendation: {llm_analysis.top_recommendation}
            </div>
          )}
        </div>
      )}
    </div>
  )
}