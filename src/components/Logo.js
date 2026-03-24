export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: { box: 24, font: 13, sub: 9 },
    md: { box: 28, font: 15, sub: 10 },
    lg: { box: 40, font: 22, sub: 12 },
  };
  const s = sizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: s.box, height: s.box,
        background: '#7c3aed',
        borderRadius: '6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width={s.box * 0.55} height={s.box * 0.55} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="2" rx="1" fill="white" opacity="0.9"/>
          <rect x="2" y="7" width="8" height="2" rx="1" fill="white" opacity="0.7"/>
          <rect x="2" y="11" width="10" height="2" rx="1" fill="white" opacity="0.8"/>
          <circle cx="5" cy="15" r="1.5" fill="white" opacity="0.9"/>
          <circle cx="11" cy="15" r="1.5" fill="white" opacity="0.9"/>
        </svg>
      </div>
      <div>
        <div style={{ lineHeight: 1 }}>
          <span style={{ color: '#f1f1f1', fontWeight: '700', fontSize: s.font }}>Tapa</span>
          <span style={{ color: '#7c3aed', fontWeight: '300', fontSize: s.font }}>Deli</span>
        </div>
        {size === 'lg' && (
          <p style={{ color: '#555', fontSize: s.sub, margin: '2px 0 0', letterSpacing: '0.12em' }}>
            TAPACHULA · DELIVERY
          </p>
        )}
      </div>
    </div>
  );
}