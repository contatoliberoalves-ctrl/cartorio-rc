import { useEffect } from 'react';
import { Icon } from './icons.jsx';

export { Icon };

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Button({ children, variant = 'primary', onClick, type = 'button', icon, size, style, disabled }) {
  return (
    <button type={type} onClick={onClick} style={style} disabled={disabled}
      className={`btn btn-${variant}${size === 'sm' ? ' btn-sm' : ''}`}>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
      {children}
    </button>
  );
}

export function Field({ label, children, hint, wide }) {
  return (
    <label className={`field${wide ? ' field-wide' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, labelOn = 'Sim', labelOff = 'Não' }) {
  return (
    <button type="button" className={`toggle${checked ? ' on' : ''}`} onClick={() => onChange(!checked)}>
      <span className="toggle-knob" />
      <span className="toggle-txt">{checked ? labelOn : labelOff}</span>
    </button>
  );
}

export function Modal({ open, onClose, title, children, footer, wide }) {
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`modal${wide ? ' modal-wide' : ''}`} onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function StatCard({ label, value, sub, tone = 'neutral', icon }) {
  return (
    <div className={`stat stat-${tone}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-icon"><Icon name={icon} size={18} /></span>}
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {action}
    </div>
  );
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

export function StatusBadge({ status }) {
  const map = { pendente: ['warn', 'Pendente'], andamento: ['info', 'Em andamento'], concluido: ['ok', 'Concluído'] };
  const [tone, label] = map[status] || ['neutral', status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function PagamentoBadge({ gratuito, pago }) {
  if (gratuito) return <Badge tone="green">Gratuito</Badge>;
  return pago ? <Badge tone="ok">Pago</Badge> : <Badge tone="warn">A pagar</Badge>;
}
