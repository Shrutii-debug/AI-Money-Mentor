import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const card = { background: '#111', border: '1px solid #222', borderRadius: 16, padding: 24, marginBottom: 16 }
const fmt = n => n >= 10000000 ? `₹${(n / 10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`

export default function FirePlanner({ data }) {
  if (!data) return null
  const { current_age, fire_number, current_corpus, monthly_savings, current_sip, projected_fire_age, sip_needed_to_retire_at_55, timeline, llm_analysis } = data

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'FIRE Number (25x)', val: fmt(fire_number), icon: '🎯', color: '#ff6b00' },
          { label: 'Current Corpus', val: fmt(current_corpus), icon: '💰', color: '#22cc88' },
          { label: 'FIRE Age (current SIP)', val: `Age ${projected_fire_age}`, icon: '🔥', color: '#ff6b00' },
        ].map(c => (
          <div key={c.label} style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 32 }}>{c.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: c.color, marginTop: 8 }}>{c.val}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* SIP Comparison */}
      <div style={{ ...card, border: '1px solid #ff6b0044' }}>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>📊 SIP Analysis</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 20 }}>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>Current Monthly SIP</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#22cc88' }}>₹{current_sip.toLocaleString('en-IN')}</div>
            <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>→ FIRE at age {projected_fire_age}</div>
          </div>
          <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 20 }}>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>SIP needed for retirement at 55</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#ff6b00' }}>₹{sip_needed_to_retire_at_55.toLocaleString('en-IN')}</div>
            <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>additional ₹{Math.max(0, sip_needed_to_retire_at_55 - current_sip).toLocaleString('en-IN')}/mo needed</div>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>📈 Corpus Growth Timeline</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={timeline} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <XAxis dataKey="age" tick={{ fill: '#888', fontSize: 11 }} label={{ value: 'Age', position: 'bottom', fill: '#888', fontSize: 11 }} />
            <YAxis tick={{ fill: '#888', fontSize: 10 }} tickFormatter={fmt} />
            <Tooltip
              formatter={(val) => [fmt(val)]}
              labelFormatter={v => `Age ${v}`}
              contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
            />
            <ReferenceLine y={fire_number} stroke="#ff6b00" strokeDasharray="6 3"
              label={{ value: `FIRE: ${fmt(fire_number)}`, fill: '#ff6b00', fontSize: 11, position: 'right' }} />
            <Line type="monotone" dataKey="corpus" stroke="#22cc88" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      {llm_analysis?.insights && (
        <div style={{ ...card, border: '1px solid #ff6b0044' }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>🤖 FIRE Coach</div>
          {llm_analysis.key_metric && (
            <div style={{ background: '#ff6b0022', border: '1px solid #ff6b0044', borderRadius: 8, padding: 12, marginBottom: 12, fontWeight: 700, color: '#ff8800', fontSize: 15 }}>
              🔥 {llm_analysis.key_metric}
            </div>
          )}
          <div style={{ color: '#ccc', fontSize: 14, marginBottom: 12 }}>{llm_analysis.summary}</div>
          {llm_analysis.insights.map((ins, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: '#ff6b00', fontWeight: 800 }}>→</span>
              <span style={{ color: '#ccc' }}>{ins}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}