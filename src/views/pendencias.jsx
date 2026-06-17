import { useState } from 'react';
import { Icon } from '../icons.jsx';
import { Button, Field, Modal, Empty, Badge, StatCard } from '../components.jsx';
import { fmtData } from '../utils.js';

const RESPONSAVEIS = ['Líbero', 'Angélica'];

const emptyPendencia = () => ({
  texto: '', prazo: '', responsavel: 'Líbero', status: 'pendente', obs: '',
});

function diasPrazo(prazo) {
  if (!prazo) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(prazo + 'T00:00:00');
  return Math.round((d - now) / 86400000);
}

function PrazoInfo({ prazo }) {
  const dias = diasPrazo(prazo);
  if (dias === null) return <span className="cell-sub">Sem prazo</span>;
  const color = dias < 0 ? 'var(--danger)' : dias <= 3 ? 'var(--danger)' : dias <= 7 ? 'var(--warn)' : 'var(--ok)';
  const label = dias < 0 ? `${Math.abs(dias)}d atrasado` : dias === 0 ? 'Hoje!' : dias === 1 ? 'Amanhã' : `${dias} dias`;
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color }}>{label}</div>
      <div className="cell-sub">{fmtData(prazo)}</div>
    </div>
  );
}

function StatusBadgePend({ status }) {
  const map = { pendente: ['warn', 'Pendente'], andamento: ['info', 'Em andamento'], concluido: ['ok', 'Concluído'] };
  const [tone, label] = map[status] || ['neutral', status];
  return <Badge tone={tone}>{label}</Badge>;
}

function PendenciaForm({ value, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  const isOutro = !RESPONSAVEIS.includes(value.responsavel);

  return (
    <div className="form-grid">
      <Field label="O que precisa ser feito" wide>
        <input value={value.texto} onChange={e => set('texto', e.target.value)}
          placeholder="Descreva a pendência…" autoFocus />
      </Field>
      <Field label="Prazo">
        <input type="date" value={value.prazo} onChange={e => set('prazo', e.target.value)} />
      </Field>
      <Field label="Situação">
        <select value={value.status} onChange={e => set('status', e.target.value)}>
          <option value="pendente">Pendente</option>
          <option value="andamento">Em andamento</option>
          <option value="concluido">Concluído</option>
        </select>
      </Field>
      <Field label="Responsável" wide>
        <div className="resp-picker">
          {RESPONSAVEIS.map(r => (
            <button key={r} type="button"
              className={`resp-chip${value.responsavel === r ? ' active' : ''}`}
              onClick={() => set('responsavel', r)}>
              {r}
            </button>
          ))}
          <button type="button"
            className={`resp-chip${isOutro ? ' active' : ''}`}
            onClick={() => set('responsavel', '')}>
            Adicionar outro…
          </button>
        </div>
        {isOutro && (
          <input value={value.responsavel} onChange={e => set('responsavel', e.target.value)}
            placeholder="Nome do responsável" style={{ marginTop: 8 }} />
        )}
      </Field>
      <Field label="Observações" wide>
        <textarea rows="2" value={value.obs} onChange={e => set('obs', e.target.value)}
          placeholder="Detalhes adicionais" />
      </Field>
    </div>
  );
}

export default function PendenciasView({ store }) {
  const [modal, setModal] = useState(null);
  const [filtro, setFiltro] = useState('ativas');
  const [filtroResp, setFiltroResp] = useState('todos');

  const todas = store.state.pendencias || [];
  const abertas = todas.filter(p => p.status !== 'concluido').length;
  const atrasadas = todas.filter(p =>
    p.status !== 'concluido' && diasPrazo(p.prazo) !== null && diasPrazo(p.prazo) < 0
  ).length;

  const lista = todas
    .filter(p => filtro === 'todas' ? true : p.status !== 'concluido')
    .filter(p => filtroResp === 'todos' ? true : p.responsavel === filtroResp)
    .sort((a, b) => {
      if (a.status === 'concluido' && b.status !== 'concluido') return 1;
      if (a.status !== 'concluido' && b.status === 'concluido') return -1;
      const da = diasPrazo(a.prazo) ?? 9999;
      const db = diasPrazo(b.prazo) ?? 9999;
      return da - db;
    });

  const openNew  = () => setModal({ mode: 'new',  data: emptyPendencia() });
  const openEdit = (p) => setModal({ mode: 'edit', data: { ...p } });
  const save = () => {
    if (!modal.data.texto.trim()) return;
    if (modal.mode === 'new') store.addPendencia(modal.data);
    else store.updatePendencia(modal.data.id, modal.data);
    setModal(null);
  };

  const respOptions = ['todos', ...RESPONSAVEIS,
    ...todas.map(p => p.responsavel).filter(r => r && !RESPONSAVEIS.includes(r) && r !== '')
      .filter((v, i, a) => a.indexOf(v) === i)
  ];

  return (
    <div>
      <div className="stat-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <StatCard label="Em aberto" value={abertas} sub={`${todas.length} no total`} icon="list" />
        <StatCard label="Atrasadas" value={atrasadas} tone={atrasadas ? 'danger' : 'ok'}
          sub={atrasadas ? 'Com prazo vencido' : 'Tudo dentro do prazo'} icon="alert" />
      </div>

      <div className="toolbar">
        <div className="seg-ctrl">
          <button className={filtro === 'ativas' ? 'active' : ''} onClick={() => setFiltro('ativas')}>Em aberto</button>
          <button className={filtro === 'todas'  ? 'active' : ''} onClick={() => setFiltro('todas')}>Todas</button>
        </div>
        <div className="seg-ctrl">
          {respOptions.map(r => (
            <button key={r} className={filtroResp === r ? 'active' : ''} onClick={() => setFiltroResp(r)}>
              {r === 'todos' ? 'Todos' : r}
            </button>
          ))}
        </div>
        <Button icon="plus" onClick={openNew}>Nova pendência</Button>
      </div>

      {lista.length === 0 && (
        <Empty>
          {filtro === 'ativas' ? 'Nenhuma pendência em aberto.' : 'Nenhuma pendência cadastrada.'}
        </Empty>
      )}

      <div className="pend-list">
        {lista.map(p => {
          const dias = diasPrazo(p.prazo);
          const atrasado = dias !== null && dias < 0;
          return (
            <div key={p.id} className={`pend-card${p.status === 'concluido' ? ' concluido' : atrasado ? ' urgente' : ''}`}>
              <div className="pend-main">
                <div className="pend-texto">{p.texto}</div>
                {p.obs && <div className="pend-obs">{p.obs}</div>}
                <div className="pend-meta">
                  <StatusBadgePend status={p.status} />
                  {p.responsavel && <span className="resp-tag"><Icon name="check" size={11} />{p.responsavel}</span>}
                </div>
              </div>
              <div className="pend-right">
                <PrazoInfo prazo={p.prazo} />
                <div className="row-actions" style={{ marginTop: 10, justifyContent: 'flex-end' }}>
                  {p.status !== 'concluido' && (
                    <button className="icon-btn ok" title="Marcar como concluído"
                      onClick={() => store.updatePendencia(p.id, { status: 'concluido' })}>
                      <Icon name="check" size={15} />
                    </button>
                  )}
                  <button className="icon-btn" title="Editar" onClick={() => openEdit(p)}>
                    <Icon name="edit" size={15} />
                  </button>
                  <button className="icon-btn danger" title="Excluir"
                    onClick={() => { if (window.confirm('Excluir esta pendência?')) store.delPendencia(p.id); }}>
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal?.mode === 'new' ? 'Nova pendência' : 'Editar pendência'}
        footer={<>
          <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
          <Button icon="check" onClick={save}>Salvar</Button>
        </>}>
        {modal && <PendenciaForm value={modal.data} onChange={data => setModal(m => ({ ...m, data }))} />}
      </Modal>
    </div>
  );
}
