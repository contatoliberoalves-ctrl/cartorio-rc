import { TIPOS, PAPELARIA } from './data.js';

export const BRL = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const fmtData = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export const hoje = () => new Date().toISOString().slice(0, 10);

export const tipoInfo = (id) => TIPOS.find(t => t.id === id) || { label: id, gratuito: false, valor: 0 };
export const servInfo = (id) => PAPELARIA.find(p => p.id === id) || { label: id, valor: 0 };

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

function nthBusinessDay(year, month, n) {
  let count = 0, day = 1;
  while (day <= 31) {
    const dt = new Date(year, month, day);
    if (dt.getMonth() !== month) break;
    const wd = dt.getDay();
    if (wd !== 0 && wd !== 6) { count++; if (count === n) return dt; }
    day++;
  }
  return new Date(year, month, 28);
}

export function proximoVencimento(com, ref) {
  const now = ref || new Date();
  const y = now.getFullYear(), m = now.getMonth();
  if (com.freq === 'evento') return null;
  if (com.freq === 'trimestral') {
    const meses = [0, 3, 6, 9];
    for (const mm of meses) {
      const dt = new Date(y, mm, com.dia);
      if (dt >= startOfDay(now)) return dt;
    }
    return new Date(y + 1, 0, com.dia);
  }
  let dt = com.diaUtil ? nthBusinessDay(y, m, com.dia) : new Date(y, m, com.dia);
  if (dt < startOfDay(now)) {
    dt = com.diaUtil ? nthBusinessDay(y, m + 1, com.dia) : new Date(y, m + 1, com.dia);
  }
  return dt;
}

export function diasRestantes(dt, ref) {
  if (!dt) return null;
  const a = startOfDay(ref || new Date()), b = startOfDay(dt);
  return Math.round((b - a) / 86400000);
}

export function periodoKey(com, ref) {
  const now = ref || new Date();
  const y = now.getFullYear();
  if (com.freq === 'trimestral') return `${com.id}-${y}-T${Math.floor(now.getMonth() / 3) + 1}`;
  return `${com.id}-${y}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
