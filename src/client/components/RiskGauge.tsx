import { RiskAssessment, WeatherSignal } from '../../domain/types.ts';

interface RiskGaugeProps {
  assessment: RiskAssessment | null;
  weather: WeatherSignal | null;
}

export function RiskGauge({ assessment, weather }: RiskGaugeProps) {
  if (!assessment || !weather) {
    return (
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#94a3b8' }}>
        Submit your safety profile to analyze local risks.
      </div>
    );
  }

  const score = assessment.score;
  const level = assessment.level.toUpperCase();

  // Color mapping based on risk level
  const getLevelColor = (levelStr: string) => {
    switch (levelStr) {
      case 'SAFE': return '#10b981';
      case 'WATCH': return '#eab308';
      case 'WARNING': return '#f97316';
      case 'EMERGENCY': return '#ef4444';
      default: return '#10b981';
    }
  };

  const activeColor = getLevelColor(level);

  // SVG Circular Gauge calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
        Risk Assessment Report
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', justifyItems: 'center' }}>
        {/* SVG Circular Progress */}
        <div className="risk-gauge-container gauge-pulse" style={{ margin: 0 }}>
          <svg className="gauge-svg" viewBox="0 0 150 150">
            <circle className="gauge-bg" cx="75" cy="75" r={radius} />
            <circle
              className="gauge-fill"
              cx="75"
              cy="75"
              r={radius}
              stroke={activeColor}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
            <text className="gauge-value" x="75" y="82" fill="#f8fafc">
              {score}
            </text>
            <text x="75" y="102" fill="#94a3b8" fontSize="0.75rem" textAnchor="middle">
              HAZARD SCORE
            </text>
          </svg>
        </div>

        {/* Level Banner */}
        <div style={{
          backgroundColor: `${activeColor}15`,
          border: `1px solid ${activeColor}`,
          color: activeColor,
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          textAlign: 'center',
          width: '100%',
          letterSpacing: '1px'
        }}>
          STATUS: {level}
        </div>
      </div>

      {/* Weather stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>Local Weather Drivers</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Today's Rain</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#38bdf8' }}>{weather.rainfall24h_mm} mm</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>72h Forecast</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#38bdf8' }}>{weather.rainfallForecast72h_mm} mm</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Max Wind</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#38bdf8' }}>{weather.windSpeed_kmph} km/h</div>
          </div>
        </div>

        {/* IMD Alert Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>IMD Alert Classification:</span>
          <span style={{
            textTransform: 'uppercase',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            backgroundColor: weather.imdAlert === 'none' ? 'rgba(255,255,255,0.1)' : getLevelColor(weather.imdAlert.toUpperCase()) + '20',
            color: weather.imdAlert === 'none' ? '#94a3b8' : getLevelColor(weather.imdAlert.toUpperCase()),
            border: `1px solid ${weather.imdAlert === 'none' ? 'rgba(255,255,255,0.2)' : getLevelColor(weather.imdAlert.toUpperCase())}`
          }}>
            {weather.imdAlert}
          </span>
        </div>

        {/* Active Danger Signals */}
        {assessment.drivers.length > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Active Risk Factors:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {assessment.drivers.map(driver => (
                <span key={driver} style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem',
                  backgroundColor: '#ef444415',
                  color: '#fca5a5',
                  border: '1px solid #ef444440'
                }}>
                  ⚠️ {driver.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default RiskGauge;
