import { Icon } from '../icons.jsx';
import { StatCard, SectionTitle, Empty, StatusBadge, PagamentoBadge, Badge } from '../components.jsx';
import { BRL, fmtData, tipoInfo, proximoVencimento, diasRestantes, periodoKey, urgenciaTag } from '../utils.js';
import { COMUNICACOES } from '../data.js';

export default function OverviewView({ store, go, hideValores }) {
  const now = new Date();
  const { pedidos, vendas } = store.state;

  const recPed  = pedidos.filter(p => !p.gratuito && p.pago).reduce((a, p) => a + Number(p.valor), 0);
  const recVen  = vendas.filter(v => v.pago).reduce((a, v) => a + Number(v.valor) * v.qtd, 0);
  const aRecPed = pedidos.filter(p => !p.gratuito && !p.pago).reduce((a, p) => a + Number(p.valor), 0);
  const aRecVen = vendas.filter(v => !v.pago).reduce((a, v) => a + Number(v.valor) * v.qtd, 0);
  const pendentes = pedidos.filter(p => p.status !== 'concluido').length;
  const gratuitos = pedidos.filter(p => p.gratuito).length;

  const comAlertas = COMUNICACOES
    .filter(c => c.freq !== 'evento')
    .map(c => {
      const venc = proximoVencimento(c, now);
      const dias = diasRestantes(venc, now);
      const key  = periodoKey(c, now);
      return { ...c, venc, dias, feito: !!store.state.comunicacoes[key] };
    })
    .filter(c => !c.feito)
    .sort((a, b) => a.dias - b.dias);
  const urgentes = comAlertas.filter(c => c.dias !== null && c.dias <= 7);

  const recentes = [...pedidos].sort((a, b) => (b.data || '').localeCompare(a.data || '')).slice(0, 5);
  const porCat = ['enviado', 'recebido', 'proprio'].map(k => ({
    k, n: pedidos.filter(p => p.categoria === k).length,
    label: { enviado: 'Enviados (CRC)', recebido: 'Recebidos (CRC)', proprio: 'Próprio cartório' }[k],
  }));

  return (
    <div>
      <div className="stat-row four">
        <StatCard label="A receber"             value={hideValores ? '•••••' : BRL(aRecPed + aRecVen)} sub="Pedidos + papelaria"      tone="warn"                             icon={hideValores ? 'lock' : 'clock'}  />
        <StatCard label="Recebido"              value={hideValores ? '•••••' : BRL(recPed  + recVen)}  sub="Pagamentos confirmados"    tone="green"                            icon={hideValores ? 'lock' : 'money'}  />
        <StatCard label="Pedidos em aberto"     value={pendentes}               sub={`${pedidos.length} no total`}                                      icon="file"   />
        <StatCard label="Comunicações a vencer" value={urgentes.length}         sub="Nos próximos 7 dias"       tone={urgentes.length ? 'danger' : 'ok'} icon="bell"  />
      </div>

      <div className="two-col">
        <div className="panel">
          <SectionTitle action={<button className="link-btn" onClick={() => go('comunicacoes')}>Ver todas <Icon name="chevron" size={14} /></button>}>Prazos de comunicações</SectionTitle>
          <div className="alert-list">
            {comAlertas.length === 0 && <Empty>Tudo em dia neste período. 🌿</Empty>}
            {comAlertas.slice(0, 5).map(c => {
              const tone = c.dias < 0 ? 'danger' : c.dias <= 3 ? 'danger' : c.dias <= 7 ? 'warn' : 'ok';
              const tag = urgenciaTag(c.dias);
              return (
                <div key={c.id} className={`alert-row tone-${tone}`}>
                  <span className="alert-dot" />
                  <div className="alert-main">
                    <div className="alert-name-row">
                      <div className="alert-name">{c.nome}</div>
                      {tag && <Badge tone={tag.tone}>{tag.label}</Badge>}
                    </div>
                    <div className="alert-obj">{c.objeto}</div>
                  </div>
                  <div className="alert-right">
                    <div className="alert-when">{c.dias < 0 ? `Atrasado ${Math.abs(c.dias)}d` : c.dias === 0 ? 'Hoje' : `${c.dias} dias`}</div>
                    <div className="alert-date">{fmtData(c.venc.toISOString().slice(0, 10))}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <SectionTitle>Pedidos por origem</SectionTitle>
          <div className="cat-summary">
            {porCat.map(c => (
              <button key={c.k} className="cat-sum-item" onClick={() => go('pedidos')}>
                <span className="cat-sum-n">{c.n}</span>
                <span className="cat-sum-l">{c.label}</span>
              </button>
            ))}
          </div>
          <div className="mini-row">
            <div className="mini-box"><span className="mini-n green-text">{gratuitos}</span><span>Atos gratuitos (FERC)</span></div>
            <div className="mini-box"><span className="mini-n">{vendas.length}</span><span>Vendas de papelaria</span></div>
          </div>
        </div>
      </div>

      <div className="panel">
        <SectionTitle action={<button className="link-btn" onClick={() => go('pedidos')}>Ver pedidos <Icon name="chevron" size={14} /></button>}>Atividade recente</SectionTitle>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Requerente</th><th>Tipo</th><th>Origem</th><th>Data</th><th>Situação</th><th>Cobrança</th></tr></thead>
            <tbody>
              {recentes.length === 0 && <tr><td colSpan="6"><Empty>Nenhum pedido registrado ainda.</Empty></td></tr>}
              {recentes.map(p => (
                <tr key={p.id}>
                  <td className="cell-name">{p.nome || '—'}</td>
                  <td>{tipoInfo(p.tipo).label}</td>
                  <td className="cell-sub">{{ enviado: 'Enviado CRC', recebido: 'Recebido CRC', proprio: 'Próprio' }[p.categoria]}</td>
                  <td className="cell-sub">{fmtData(p.data)}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><PagamentoBadge gratuito={p.gratuito} pago={p.pago} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
