import { useState } from 'react';
import { Icon } from '../icons.jsx';
import { Button, Badge, SectionTitle, Empty } from '../components.jsx';
import { fmtData, hoje, proximoVencimento, diasRestantes, periodoKey, urgenciaTag } from '../utils.js';
import { COMUNICACOES } from '../data.js';

export default function ComunicacoesView({ store }) {
  const [novaTarefa, setNovaTarefa] = useState('');
  const now = new Date();

  const itens = COMUNICACOES.map(c => {
    const venc = proximoVencimento(c, now);
    const dias = diasRestantes(venc, now);
    const key  = c.freq === 'evento' ? null : periodoKey(c, now);
    const feito = key ? !!store.state.comunicacoes[key] : false;
    return { ...c, venc, dias, key, feito };
  });

  const ordena = (a, b) => {
    if (a.freq === 'evento') return 1;
    if (b.freq === 'evento') return -1;
    if (a.feito !== b.feito) return a.feito ? 1 : -1;
    return (a.dias ?? 999) - (b.dias ?? 999);
  };

  const alerta = (it) => {
    if (it.feito || it.freq === 'evento') return 'neutral';
    if (it.dias < 0) return 'danger';
    if (it.dias <= 3) return 'danger';
    if (it.dias <= 7) return 'warn';
    return 'ok';
  };

  const prazoTxt = (it) => {
    if (it.freq === 'evento') return 'Conforme o fato gerador';
    if (it.feito) return 'Concluído neste período';
    if (it.dias < 0) return `Atrasado há ${Math.abs(it.dias)} dia(s)`;
    if (it.dias === 0) return 'Vence hoje';
    return `Vence em ${it.dias} dia(s)`;
  };

  const tarefas = store.state.tarefas || [];
  const adicionarTarefa = () => {
    if (novaTarefa.trim()) { store.addTarefa(novaTarefa.trim()); setNovaTarefa(''); }
  };

  return (
    <div>
      <div className="info-bar">
        <Icon name="bell" size={16} />
        <span>Prazos calculados a partir de hoje ({fmtData(hoje())}). Marque ao enviar — reinicia a cada período.</span>
      </div>

      <div className="comm-grid">
        {[...itens].sort(ordena).map(it => (
          <div key={it.id} className={`comm-card tone-${alerta(it)}${it.feito ? ' done' : ''}`}>
            <div className="comm-head">
              <div>
                <div className="comm-name-row">
                  <div className="comm-name">{it.nome}</div>
                  {!it.feito && it.freq !== 'evento' && (() => {
                    const tag = urgenciaTag(it.dias);
                    return tag && <Badge tone={tag.tone}>{tag.label}</Badge>;
                  })()}
                </div>
                <div className="comm-freq">{it.freq === 'evento' ? 'Por evento' : it.freq === 'trimestral' ? 'Trimestral' : 'Mensal'}</div>
              </div>
              {it.key && (
                <button className={`check-box${it.feito ? ' on' : ''}`} onClick={() => store.toggleComunic(it.key)}>
                  {it.feito && <Icon name="check" size={16} />}
                </button>
              )}
            </div>
            <div className="comm-obj">{it.objeto}</div>
            <div className="comm-meta"><span className="comm-meio">{it.meio}</span></div>
            <div className="comm-foot">
              <span className={`prazo prazo-${alerta(it)}`}>
                <Icon name={it.feito ? 'check' : it.dias !== null && it.dias < 0 ? 'alert' : 'clock'} size={14} />
                {prazoTxt(it)}
              </span>
              {it.venc && <span className="comm-date">{fmtData(it.venc.toISOString().slice(0, 10))}</span>}
            </div>
            <div className="comm-base">{it.base}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <SectionTitle>Outras tarefas e lembretes</SectionTitle>
        <div className="task-add">
          <input value={novaTarefa} onChange={e => setNovaTarefa(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') adicionarTarefa(); }}
            placeholder="Adicionar lembrete (Enter para salvar)…" />
          <Button icon="plus" size="sm" onClick={adicionarTarefa}>Adicionar</Button>
        </div>
        <div className="task-list">
          {tarefas.length === 0 && <Empty>Sem lembretes.</Empty>}
          {tarefas.map(t => (
            <div key={t.id} className={`task${t.feito ? ' done' : ''}`}>
              <button className={`check-box sm${t.feito ? ' on' : ''}`} onClick={() => store.toggleTarefa(t.id)}>
                {t.feito && <Icon name="check" size={14} />}
              </button>
              <span>{t.texto}</span>
              <button className="icon-btn danger" onClick={() => store.delTarefa(t.id)}><Icon name="trash" size={15} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
