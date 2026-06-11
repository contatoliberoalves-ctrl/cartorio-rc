import { useState } from 'react';
import { Icon } from '../icons.jsx';
import { Button, Field, Toggle, Modal, StatCard, SectionTitle, Empty } from '../components.jsx';
import { BRL, fmtData, hoje, servInfo } from '../utils.js';
import { PAPELARIA } from '../data.js';

export default function PapelariaView({ store }) {
  const [modal, setModal] = useState(null);
  const vendas = store.state.vendas;

  const totalDia   = vendas.filter(v => v.data === hoje()).reduce((a, v) => a + Number(v.valor) * v.qtd, 0);
  const aReceber   = vendas.filter(v => !v.pago).reduce((a, v) => a + Number(v.valor) * v.qtd, 0);
  const totalGeral = vendas.reduce((a, v) => a + Number(v.valor) * v.qtd, 0);

  const emptyVenda = () => ({ servico: 'xerox_pb', custom: '', qtd: 1, valor: 0.50, data: hoje(), pago: true });
  const openNew = () => setModal(emptyVenda());
  const onServ  = (id) => setModal(m => ({ ...m, servico: id, valor: id === 'outro' ? 0 : servInfo(id).valor }));
  const save    = () => {
    const servico = modal.servico === 'outro' ? (modal.custom || '').trim() : modal.servico;
    if (!servico) return;
    const { custom, ...venda } = modal;
    store.addVenda({ ...venda, servico });
    setModal(null);
  };

  return (
    <div>
      <div className="stat-row">
        <StatCard label="Recebido hoje"        value={BRL(totalDia)}   tone="green" icon="money" />
        <StatCard label="A receber (pendente)" value={BRL(aReceber)}   tone="warn"  icon="clock" />
        <StatCard label="Total lançado"        value={BRL(totalGeral)} sub={`${vendas.length} lançamentos`} icon="print" />
      </div>

      <div className="two-col">
        <div className="panel">
          <SectionTitle action={<Button icon="plus" size="sm" onClick={openNew}>Lançar venda</Button>}>Lançamentos</SectionTitle>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Serviço</th><th>Qtd</th><th>Unit.</th><th>Total</th><th>Data</th><th>Pago</th><th></th></tr></thead>
              <tbody>
                {vendas.length === 0 && <tr><td colSpan="7"><Empty>Nenhuma venda lançada.</Empty></td></tr>}
                {vendas.map(v => (
                  <tr key={v.id}>
                    <td>{servInfo(v.servico).label}</td>
                    <td className="mono">{v.qtd}</td>
                    <td className="mono">{BRL(Number(v.valor))}</td>
                    <td className="mono"><b>{BRL(Number(v.valor) * v.qtd)}</b></td>
                    <td className="cell-sub">{fmtData(v.data)}</td>
                    <td>
                      <button className={`pill-toggle${v.pago ? ' on' : ''}`}
                        onClick={() => store.updateVenda(v.id, { pago: !v.pago })}>
                        {v.pago ? 'Pago' : 'A pagar'}
                      </button>
                    </td>
                    <td>
                      <button className="icon-btn danger" onClick={() => store.delVenda(v.id)}>
                        <Icon name="trash" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <SectionTitle>Tabela de preços</SectionTitle>
          <div className="price-list">
            {PAPELARIA.map(p => (
              <div className="price-item" key={p.id}>
                <span>{p.label}</span>
                <b className="mono">{BRL(p.valor)}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title="Lançar venda"
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button><Button icon="check" onClick={save}>Salvar</Button></>}>
        {modal && (
          <div className="form-grid">
            <Field label="Serviço" wide>
              <select value={modal.servico} onChange={e => onServ(e.target.value)}>
                {PAPELARIA.map(p => <option key={p.id} value={p.id}>{p.label} — {BRL(p.valor)}</option>)}
                <option value="outro">Outro (digitar item)</option>
              </select>
            </Field>
            {modal.servico === 'outro' && (
              <Field label="Nome do item/serviço" wide>
                <input value={modal.custom} onChange={e => setModal(m => ({ ...m, custom: e.target.value }))}
                  placeholder="Ex.: Plastificação A4" />
              </Field>
            )}
            <Field label="Quantidade">
              <input type="number" min="1" value={modal.qtd}
                onChange={e => setModal(m => ({ ...m, qtd: parseInt(e.target.value) || 1 }))} />
            </Field>
            <Field label="Valor unitário (R$)">
              <input type="number" step="0.01" value={modal.valor}
                onChange={e => setModal(m => ({ ...m, valor: parseFloat(e.target.value) || 0 }))} />
            </Field>
            <Field label="Data">
              <input type="date" value={modal.data}
                onChange={e => setModal(m => ({ ...m, data: e.target.value }))} />
            </Field>
            <Field label="Pagamento">
              <Toggle checked={modal.pago} onChange={v => setModal(m => ({ ...m, pago: v }))} labelOn="Pago" labelOff="A pagar" />
            </Field>
            <div className="form-total">Total: <b>{BRL((modal.valor || 0) * (modal.qtd || 0))}</b></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
