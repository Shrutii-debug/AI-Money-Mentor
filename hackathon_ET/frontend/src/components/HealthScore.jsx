import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

const card = { background: '#111', border: '1px solid #222', borderRadius: 16, padding: 24, marginBottom: 16 }

export default function HealthScore({ data }) {
  if (!data) return null
  const { total_score, axes, llm_analysis } = data

  const grade = llm_analysis?.grade || (total_score >= 80 ? 'A' : total_score >= 65 ? 'B' : total_score >= 50 ? 'C' : total_score >= 35 ? 'D' : 'F')
  const gradeColor = { A: '#22cc88', B: '#88dd44', C: '#ffcc00', D: '#ff8800', F: '#ff4444' }[grade] || '#888'

  const radarData = Object.entries(axes).map(([k, v]) => ({ subject: k, value: v, fullMark: 10 }))

  const scoreColor = total_score >= 70 ? '#22cc88' : total_score >= 50 ? '#ffcc00' : '#ff4444'

  return (
    <div>
      {/* Score Hero */}
      <div style={{ ...card, border: `1px solid ${scoreColor}44`, textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <svg width={180} height={180}>
            <circle cx={90} cy={90} r={78} fill="none" stroke="#222" strokeWidth={14} />
            <circle cx={90} cy={90} r={78} fill="none" stroke={scoreColor} strokeWidth={14}
              strokeDasharray={`${(total_score / 100) * 490} 490`}
              strokeLinecap="round"
              transform="rotate(-90 90 90)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
            <text x={90} y={82} textAnchor="middle" fill="#f1f1f1" fontSize={42} fontWeight={800} fontFamily="Inter">{total_score}</text>
            <text x={90} y={104} textAnchor="middle" fill="#888" fontSize={13} fontFamily="Inter">/100</text>
          </svg>
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: gradeColor, marginTop: 8 }}>{grade}</div>
        <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Money Health Score</div>
      </div>

      {/* Radar Chart */}
      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>🕸️ 6-Dimension Health Map</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#222" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11 }} />
              <Radar name="Score" dataKey="value" stroke="#ff6b00" fill="#ff6b00" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div>
            {Object.entries(axes).map(([axis, score]) => {
              const color = score >= 7 ? '#22cc88' : score >= 4 ? '#ffcc00' : '#ff4444'
              return (
                <div key={axis} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ color: '#ccc' }}>{axis}</span>
                    <span style={{ fontWeight: 700, color }}>{score}/10</span>
                  </div>
                  <div style={{ background: '#1a1a1a', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${score * 10}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* AI Diagnosis */}
      {llm_analysis && (
        <div style={{ ...card, border: '1px solid #ff6b0044' }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>🤖 AI Diagnosis</div>
          <div style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{llm_analysis.diagnosis}</div>
          <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>Priority Actions</div>
          {(llm_analysis.priority_actions || []).map((action, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10,
              background: '#1a1a1a', borderRadius: 10, padding: '10px 14px'
            }}>
              <div style={{ background: '#ff6b00', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>{action}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}