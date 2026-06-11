import { useState } from 'react';
import { Icon } from '../icons.jsx';
import { Button, Field, Toggle, Modal, Empty, StatusBadge, PagamentoBadge } from '../components.jsx';
import { BRL, fmtData, hoje, tipoInfo } from '../utils.js';
import { TIPOS } from '../data.js';

const CATS = {
  enviado:  { label: 'Pedidos que fizemos (CRC)',        sub: 'Solicitados por nós a outros cartórios via CRC', icon: 'send' },
  recebido: { label: 'Pedidos que recebemos (CRC)',       sub: 'Outros cartórios pediram a nós via CRC',         icon: 'inbox' },
  proprio:  { label: 'Solicitações do próprio cartório',  sub: 'Registro pertence a esta serventia',              icon: 'building' },
};

const emptyPedido = (categoria) => ({
  categoria, nome: '', cpf: '', tipo: '2via_casamento', protocolo: '', cartorio: '',
  data: hoje(), livro: '', matricula: '', folha: '',
  gratuito: false, pago: false, valor: 55.62, status: 'pendente', funcionaria: '', obs: '',
});

function PedidoForm({ value, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  const onTipo = (id) => {
    const info = tipoInfo(id);
    onChange({ ...value, tipo: id, gratuito: info.gratuito, valor: info.gratuito ? 0 : info.valor });
  };
  const cartLabel = value.categoria === 'enviado' ? 'Cartório de destino'
    : value.categoria === 'recebido' ? 'Cartório solicitante' : 'Serventia';
  return (
    <div className="form-grid">
      <Field label="Nome do requerente / registrado" wide>
        <input value={value.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome completo" />
      </Field>
      <Field label="CPF">
        <input value={value.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" />
      </Field>
      <Field label="Tipo de pedido">
        <select value={value.tipo} onChange={e => onTipo(e.target.value)}>
          {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </Field>
      <Field label={cartLabel}>
        <input value={value.cartorio} onChange={e => set('cartorio', e.target.value)} placeholder="Nome / cidade do cartório" />
      </Field>
      <Field label="Protocolo CRC">
        <input value={value.protocolo} onChange={e => set('protocolo', e.target.value)} placeholder="CRC-2026-…" />
      </Field>
      <Field label="Data">
        <input type="date" value={value.data} onChange={e => set('data', e.target.value)} />
      </Field>
      <Field label="Funcionária responsável">
        <input value={value.funcionaria} onChange={e => set('funcionaria', e.target.value)} placeholder="Quem lançou" />
      </Field>
      <Field label="Livro">
        <input value={value.livro} onChange={e => set('livro', e.target.value)} placeholder="Ex.: B-12" />
      </Field>
      <Field label="Folha">
        <input value={value.folha} onChange={e => set('folha', e.target.value)} placeholder="Ex.: 045v" />
      </Field>
      <Field label="Matrícula" wide>
        <input value={value.matricula} onChange={e => set('matricula', e.target.value)} placeholder="Matrícula (32 dígitos)" />
      </Field>
      <Field label="Situação do pedido">
        <select value={value.status} onChange={e => set('status', e.target.value)}>
          <option value="pendente">Pendente</option>
          <option value="andamento">Em andamento</option>
          <option value="concluido">Concluído</option>
        </select>
      </Field>
      <Field label="Cobrança">
        <Toggle checked={value.gratuito} onChange={v => set('gratuito', v)} labelOn="Gratuito" labelOff="Pago" />
      </Field>
      {!value.gratuito && (
        <>
          <Field label="Valor (R$)">
            <input type="number" step="0.01" value={value.valor} onChange={e => set('valor', parseFloat(e.target.value) || 0)} />
          </Field>
          <Field label="Pagamento">
            <Toggle checked={value.pago} onChange={v => set('pago', v)} labelOn="Já pagou" labelOff="A pagar" />
          </Field>
        </>
      )}
      <Field label="Observações" wide>
        <textarea rows="2" value={value.obs} onChange={e => set('obs', e.target.value)} placeholder="Anotações internas" />
      </Field>
    </div>
  );
}

export default function PedidosView({ store }) {
  const [cat, setCat] = useState('enviado');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);

  const lista = store.state.pedidos
    .filter(p => p.categoria === cat)
    .filter(p => {
      if (!q.trim()) return true;
      const s = (p.nome + ' ' + p.cpf + ' ' + p.protocolo + ' ' + p.cartorio + ' ' + tipoInfo(p.tipo).label).toLowerCase();
      return s.includes(q.toLowerCase());
    });

  const aReceber = lista.filter(p => !p.gratuito && !p.pago).reduce((a, p) => a + Number(p.valor), 0);
  const recebido = lista.filter(p => !p.gratuito && p.pago).reduce((a, p) => a + Number(p.valor), 0);

  const openNew  = () => setModal({ mode: 'new',  data: emptyPedido(cat) });
  const openEdit = (p) => setModal({ mode: 'edit', data: { ...p } });
  const save = () => {
    if (modal.mode === 'new') store.addPedido(modal.data);
    else store.updatePedido(modal.data.id, modal.data);
    setModal(null);
  };

  return (
    <div>
      <div className="cat-tabs">
        {Object.entries(CATS).map(([k, v]) => {
          const n = store.state.pedidos.filter(p => p.categoria === k).length;
          return (
            <button key={k} className={`cat-tab${cat === k ? ' active' : ''}`} onClick={() => setCat(k)}>
              <Icon name={v.icon} size={20} />
              <span className="cat-tab-main">{v.label}</span>
              <span className="cat-tab-sub">{v.sub}</span>
              <span className="cat-tab-count">{n}</span>
            </button>
          );
        })}
      </div>

      <div className="toolbar">
        <div className="search">
          <Icon name="search" size={17} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nome, CPF, protocolo, cartório…" />
        </div>
        <div className="toolbar-stats">
          <span className="mini-stat"><b className="warn-text">{BRL(aReceber)}</b> a receber</span>
          <span className="mini-stat"><b className="ok-text">{BRL(recebido)}</b> recebido</span>
        </div>
        <Button icon="plus" onClick={openNew}>Novo pedido</Button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Requerente</th><th>Tipo</th><th>Cartório</th><th>Protocolo</th>
              <th>Livro / Fl.</th><th>Data</th><th>Situação</th><th>Cobrança</th><th>Valor</th><th></th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr><td colSpan="10"><Empty>Nenhum pedido. Clique em "Novo pedido" para adicionar.</Empty></td></tr>
            )}
            {lista.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="cell-name">{p.nome || '—'}</div>
                  {p.cpf && <div className="cell-sub">{p.cpf}</div>}
                </td>
                <td>{tipoInfo(p.tipo).label}</td>
                <td className="cell-sub">{p.cartorio || '—'}</td>
                <td className="mono">{p.protocolo || '—'}</td>
                <td className="cell-sub">{p.livro || '—'}{p.folha ? ` / ${p.folha}` : ''}</td>
                <td className="cell-sub">{fmtData(p.data)}</td>
                <td><StatusBadge status={p.status} /></td>
                <td><PagamentoBadge gratuito={p.gratuito} pago={p.pago} /></td>
                <td className="mono">{p.gratuito ? '—' : BRL(Number(p.valor))}</td>
                <td>
                  <div className="row-actions">
                    {!p.gratuito && !p.pago && (
                      <button className="icon-btn ok" title="Marcar como pago"
                        onClick={() => store.updatePedido(p.id, { pago: true })}>
                        <Icon name="money" size={16} />
                      </button>
                    )}
                    <button className="icon-btn" title="Editar" onClick={() => openEdit(p)}><Icon name="edit" size={16} /></button>
                    <button className="icon-btn danger" title="Excluir"
                      onClick={() => { if (window.confirm('Excluir este pedido?')) store.delPedido(p.id); }}>
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} wide
        title={modal?.mode === 'new' ? `Novo pedido — ${CATS[cat]?.label}` : 'Editar pedido'}
        footer={<>
          <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
          <Button icon="check" onClick={save}>Salvar</Button>
        </>}>
        {modal && <PedidoForm value={modal.data} onChange={data => setModal({ ...modal, data })} />}
      </Modal>
    </div>
  );
}
