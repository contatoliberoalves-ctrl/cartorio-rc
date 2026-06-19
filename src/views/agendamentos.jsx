import { useState } from 'react';
import { Icon } from '../icons.jsx';
import { Button, Field, Modal, Badge } from '../components.jsx';
import { hoje } from '../utils.js';

const MOTIVOS = [
  'Retirada de certidão',
  'Registro de nascimento',
  'Registro de óbito',
  'Registro de casamento',
  'Reconhecimento de firma',
  'Autenticação de documento',
  'Outro',
];

const STATUS_MAP = {
  agendado:       ['info',    'Agendado'],
  atendido:       ['ok',      'Atendido'],
  nao_compareceu: ['danger',  'Não compareceu'],
  cancelado:      ['neutral', 'Cancelado'],
};

const DIA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getWeekDays(ref) {
  const d = new Date(ref); d.setHours(0,0,0,0);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1)); // back to Monday
  return Array.from({ length: 6 }, (_, i) => {
    const dt = new Date(d); dt.setDate(d.getDate() + i); return dt;
  });
}

const emptyAg = (data = hoje()) => ({
  nome: '', telefone: '', data, horario: '', motivo: 'Retirada de certidão',
  status: 'agendado', obs: '',
});

function AgForm({ value, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <div className="form-grid">
      <Field label="Nome do solicitante" wide>
        <input value={value.nome} onChange={e => set('nome', e.target.value)}
          placeholder="Nome completo" autoFocus />
      </Field>
      <Field label="Telefone">
        <input value={value.telefone} onChange={e => set('telefone', e.target.value)}
          placeholder="(00) 00000-0000" />
      </Field>
      <Field label="Data">
        <input type="date" value={value.data} onChange={e => set('data', e.target.value)} />
      </Field>
      <Field label="Horário">
        <input type="time" value={value.horario} onChange={e => set('horario', e.target.value)} />
      </Field>
      <Field label="Motivo / serviço" wide>
        <select value={value.motivo} onChange={e => set('motivo', e.target.value)}>
          {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Situação">
        <select value={value.status} onChange={e => set('status', e.target.value)}>
          <option value="agendado">Agendado</option>
          <option value="atendido">Atendido</option>
          <option value="nao_compareceu">Não compareceu</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </Field>
      <Field label="Observações" wide>
        <textarea rows="2" value={value.obs} onChange={e => set('obs', e.target.value)}
          placeholder="Anotações internas" />
      </Field>
    </div>
  );
}

export default function AgendamentosView({ store }) {
  const [weekRef, setWeekRef] = useState(new Date());
  const [modal, setModal] = useState(null);

  const days = getWeekDays(weekRef);
  const todos = store.state.agendamentos || [];
  const todayStr = hoje();

  const prevWeek = () => { const d = new Date(weekRef); d.setDate(d.getDate()-7); setWeekRef(d); };
  const nextWeek = () => { const d = new Date(weekRef); d.setDate(d.getDate()+7); setWeekRef(d); };

  const openNew  = (data) => setModal({ mode: 'new',  data: emptyAg(data) });
  const openEdit = (a)    => setModal({ mode: 'edit', data: { ...a } });
  const save = () => {
    if (!modal.data.nome.trim()) return;
    if (modal.mode === 'new') store.addAgendamento(modal.data);
    else store.updateAgendamento(modal.data.id, modal.data);
    setModal(null);
  };

  const weekStart = days[0]; const weekEnd = days[5];
  const fmtDay = (d) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
  const totalSemana = todos.filter(a => a.data >= toDateStr(weekStart) && a.data <= toDateStr(weekEnd)).length;

  return (
    <div>
      <div className="agenda-nav">
        <div className="agenda-nav-left">
          <button className="btn btn-ghost btn-sm" onClick={prevWeek}>
            <Icon name="chevron" size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <span className="agenda-range">
            {fmtDay(weekStart)} — {fmtDay(weekEnd)}/{weekEnd.getFullYear()}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={nextWeek}>
            <Icon name="chevron" size={16} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekRef(new Date())}>Hoje</button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ color:'var(--muted)', fontSize:13 }}>
            {totalSemana} agendamento{totalSemana !== 1 ? 's' : ''} nesta semana
          </span>
          <Button icon="plus" onClick={() => openNew(todayStr)}>Novo agendamento</Button>
        </div>
      </div>

      <div className="agenda-grid">
        {days.map(day => {
          const dateStr = toDateStr(day);
          const isToday = dateStr === todayStr;
          const appts = todos
            .filter(a => a.data === dateStr)
            .sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));

          return (
            <div key={dateStr} className={`agenda-col${isToday ? ' agenda-today' : ''}`}>
              <div className="agenda-col-head">
                <div className="agenda-dia-abrev">{DIA[day.getDay()]}</div>
                <div className={`agenda-date-num${isToday ? ' today' : ''}`}>{day.getDate()}</div>
              </div>

              <div className="agenda-col-body">
                {appts.map(a => (
                  <div key={a.id} className={`agenda-card ag-${a.status}`}>
                    {a.horario && <div className="ag-time">{a.horario.slice(0,5)}</div>}
                    <div className="ag-nome">{a.nome}</div>
                    <div className="ag-motivo">{a.motivo}</div>
                    {a.telefone && <div className="ag-tel">{a.telefone}</div>}
                    {a.status !== 'agendado' && (
                      <div style={{ marginTop: 3 }}>
                        <Badge tone={STATUS_MAP[a.status][0]}>{STATUS_MAP[a.status][1]}</Badge>
                      </div>
                    )}
                    <div className="ag-actions">
                      {a.status === 'agendado' && (
                        <button className="icon-btn ok" title="Marcar como atendido"
                          onClick={() => store.updateAgendamento(a.id, { status: 'atendido' })}>
                          <Icon name="check" size={13} />
                        </button>
                      )}
                      <button className="icon-btn" title="Editar" onClick={() => openEdit(a)}>
                        <Icon name="edit" size={13} />
                      </button>
                      <button className="icon-btn danger" title="Excluir"
                        onClick={() => { if (window.confirm('Excluir agendamento?')) store.delAgendamento(a.id); }}>
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                <button className="ag-add-btn" onClick={() => openNew(dateStr)}>
                  <Icon name="plus" size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} wide
        title={modal?.mode === 'new' ? 'Novo agendamento' : 'Editar agendamento'}
        footer={<>
          <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
          <Button icon="check" onClick={save}>Salvar</Button>
        </>}>
        {modal && <AgForm value={modal.data} onChange={data => setModal(m => ({ ...m, data }))} />}
      </Modal>
    </div>
  );
}
