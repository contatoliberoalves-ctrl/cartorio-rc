import { useState } from 'react';
import { Icon } from '../icons.jsx';
import { SectionTitle } from '../components.jsx';
import { BRL } from '../utils.js';
import { TABELA_H, TABELA_D, FAIXAS_FINANCEIRO } from '../data.js';

export default function TabelaView() {
  const [tab, setTab] = useState('H');
  const [q, setQ] = useState('');
  const [valor, setValor] = useState('');

  const filtra = (rows) => rows.filter(r => !q.trim() || r.ato.toLowerCase().includes(q.toLowerCase()));
  const rows = tab === 'H' ? TABELA_H : TABELA_D;

  const calcFaixa = () => {
    const v = parseFloat(String(valor).replace(/\./g, '').replace(',', '.')) || 0;
    if (!v) return null;
    const f = FAIXAS_FINANCEIRO.faixas.find(([min, max]) => v >= min && v <= max);
    return f ? f[2] : FAIXAS_FINANCEIRO.maximo;
  };
  const faixaRes = calcFaixa();

  return (
    <div>
      <div className="info-bar">
        <Icon name="alert" size={16} />
        <span>Valores vigentes em 2026 (Ato nº 1556/2025 — TJPE). Sobre os emolumentos ainda incide a <b>TSNR</b> (taxa de fiscalização).</span>
      </div>
      <div className="seg">
        <button className={tab === 'H' ? 'active' : ''} onClick={() => setTab('H')}>Tabela H — Registro Civil</button>
        <button className={tab === 'D' ? 'active' : ''} onClick={() => setTab('D')}>Tabela D — Atos Notariais</button>
      </div>
      <div className="search search-block">
        <Icon name="search" size={17} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar ato…" />
      </div>
      <div className="panel">
        <table className="data-table emol">
          <thead><tr><th>Ato</th><th className="ta-r">Emolumento</th></tr></thead>
          <tbody>
            {filtra(rows).map((r, i) => (
              <tr key={i}>
                <td>{r.ato}</td>
                <td className="ta-r mono"><b className={r.valor === 'Gratuito' ? 'green-text' : ''}>{r.valor}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tab === 'D' && (
        <div className="panel calc">
          <SectionTitle>Calculadora — escritura com conteúdo financeiro</SectionTitle>
          <p className="muted">Informe o valor do ato/avaliação para obter o emolumento da faixa (mín. {BRL(237.84)} · máx. {BRL(7084.10)}).</p>
          <div className="calc-row">
            <div className="search" style={{ maxWidth: 240 }}>
              <span className="prefix">R$</span>
              <input value={valor} onChange={e => setValor(e.target.value)} placeholder="50.000,00" />
            </div>
            {faixaRes != null && <div className="calc-out">Emolumento: <b>{BRL(faixaRes)}</b></div>}
          </div>
        </div>
      )}
    </div>
  );
}
