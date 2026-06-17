import { useState, useRef, useEffect } from 'react';
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
  id: crypto.randomUUID(),
  categoria, nome: '', cpf: '', tipo: '2via_casamento', protocolo: '', cartorio: '',
  data: hoje(), livro: '', matricula: '', folha: '',
  gratuito: false, pago: false, valor: 55.62, status: 'pendente', funcionaria: '', obs: '',
  documentos: [],
});

const fmtSize = (bytes) => !bytes ? '' : bytes < 1048576
  ? `${(bytes / 1024).toFixed(0)} KB`
  : `${(bytes / 1048576).toFixed(1)} MB`;

function DocSection({ saved, pending, onAddFiles, onRemoveSaved, onRemovePending }) {
  const inputRef = useRef(null);
  return (
    <div className="doc-section field-wide">
      <span className="field-label">Documentos e fotos</span>
      {saved.length === 0 && pending.length === 0 && (
        <div style={{ color: 'var(--muted)', fontSize: 12.5, marginBottom: 6 }}>Nenhum arquivo anexado.</div>
      )}
      {saved.map((doc, i) => (
        <div key={`s-${i}`} className="doc-item">
          <Icon name="file" size={16} />
          <div className="doc-info">
            <div className="doc-name">{doc.name}</div>
            <div className="doc-size">{fmtSize(doc.size)}</div>
          </div>
          <button type="button" className="icon-btn danger" title="Remover" onClick={() => onRemoveSaved(i)}>
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
      {pending.map((file, i) => (
        <div key={`p-${i}`} className="doc-item pending">
          <Icon name="file" size={16} />
          <div className="doc-info">
            <div className="doc-name">{file.name}</div>
            <div className="doc-size">{fmtSize(file.size)} · pendente</div>
          </div>
          <button type="button" className="icon-btn danger" title="Remover" onClick={() => onRemovePending(i)}>
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}
        onClick={() => inputRef.current?.click()}>
        <Icon name="plus" size={15} /> Adicionar arquivo ou foto
      </button>
      <input ref={inputRef} type="file" multiple accept="image/*,.pdf"
        style={{ display: 'none' }}
        onChange={e => { onAddFiles(Array.from(e.target.files)); e.target.value = ''; }} />
    </div>
  );
}

function PedidoForm({ value, onChange, pendingFiles, onAddFiles, onRemoveSaved, onRemovePending }) {
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
      <DocSection
        saved={value.documentos || []}
        pending={pendingFiles || []}
        onAddFiles={onAddFiles}
        onRemoveSaved={onRemoveSaved}
        onRemovePending={onRemovePending}
      />
    </div>
  );
}

function DocsModal({ pedido, onClose, store }) {
  const [urls, setUrls] = useState({});
  const [loadingUrls, setLoadingUrls] = useState(true);

  useEffect(() => {
    if (!pedido?.documentos?.length) { setLoadingUrls(false); return; }
    Promise.all(
      pedido.documentos.map(doc =>
        store.getDocUrl(doc.path).then(url => [doc.path, url])
      )
    ).then(pairs => {
      setUrls(Object.fromEntries(pairs));
      setLoadingUrls(false);
    });
  }, []);

  if (!pedido) return null;
  const docs = pedido.documentos || [];

  return (
    <Modal open title={`Documentos — ${pedido.nome || 'Pedido'}`} onClose={onClose}>
      {loadingUrls ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          Carregando…
        </div>
      ) : docs.length === 0 ? (
        <Empty>Nenhum documento anexado.</Empty>
      ) : (
        <div className="docs-view-list">
          {docs.map((doc, i) => {
            const url = urls[doc.path];
            const isImage = doc.type?.startsWith('image/');
            return (
              <div key={i} className="doc-view-item">
                {isImage && url
                  ? <img src={url} alt={doc.name} className="doc-thumb" />
                  : <span className="doc-view-icon"><Icon name="file" size={24} /></span>
                }
                <div className="doc-info">
                  <div className="doc-name">{doc.name}</div>
                  <div className="doc-size">{fmtSize(doc.size)}</div>
                </div>
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    Abrir
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

export default function PedidosView({ store, hideValores }) {
  const [cat, setCat] = useState('enviado');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);
  const [docsModal, setDocsModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const lista = store.state.pedidos
    .filter(p => p.categoria === cat)
    .filter(p => {
      if (!q.trim()) return true;
      const s = (p.nome + ' ' + p.cpf + ' ' + p.protocolo + ' ' + p.cartorio + ' ' + tipoInfo(p.tipo).label).toLowerCase();
      return s.includes(q.toLowerCase());
    });

  const aReceber = lista.filter(p => !p.gratuito && !p.pago).reduce((a, p) => a + Number(p.valor), 0);
  const recebido = lista.filter(p => !p.gratuito && p.pago).reduce((a, p) => a + Number(p.valor), 0);

  const openNew  = () => setModal({ mode: 'new', data: emptyPedido(cat), pendingFiles: [], removedDocs: [] });
  const openEdit = (p) => setModal({ mode: 'edit', data: { ...p, documentos: p.documentos || [] }, pendingFiles: [], removedDocs: [] });

  const save = async () => {
    setSaving(true);
    try {
      let documentos = [...(modal.data.documentos || [])];
      for (const file of (modal.pendingFiles || [])) {
        const doc = await store.uploadPedidoDoc(modal.data.id, file);
        documentos.push(doc);
      }
      for (const doc of (modal.removedDocs || [])) {
        await store.deleteDoc(doc.path).catch(() => {});
      }
      const pedidoData = { ...modal.data, documentos };
      if (modal.mode === 'new') await store.addPedido(pedidoData);
      else await store.updatePedido(pedidoData.id, pedidoData);
      setModal(null);
    } catch (e) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const addFiles = (files) =>
    setModal(m => ({ ...m, pendingFiles: [...(m.pendingFiles || []), ...files] }));

  const removePending = (idx) =>
    setModal(m => ({ ...m, pendingFiles: m.pendingFiles.filter((_, i) => i !== idx) }));

  const removeSaved = (idx) => {
    const doc = modal.data.documentos[idx];
    setModal(m => ({
      ...m,
      data: { ...m.data, documentos: m.data.documentos.filter((_, i) => i !== idx) },
      removedDocs: [...(m.removedDocs || []), doc],
    }));
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
        {!hideValores && (
          <div className="toolbar-stats">
            <span className="mini-stat"><b className="warn-text">{BRL(aReceber)}</b> a receber</span>
            <span className="mini-stat"><b className="ok-text">{BRL(recebido)}</b> recebido</span>
          </div>
        )}
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
                    {(p.documentos?.length > 0) && (
                      <button className="icon-btn doc-count-btn" title={`${p.documentos.length} documento(s)`}
                        onClick={() => setDocsModal(p)}>
                        <Icon name="file" size={14} />
                        <span>{p.documentos.length}</span>
                      </button>
                    )}
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
          <Button icon="check" onClick={save} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </>}>
        {modal && (
          <PedidoForm
            value={modal.data}
            onChange={data => setModal(m => ({ ...m, data }))}
            pendingFiles={modal.pendingFiles}
            onAddFiles={addFiles}
            onRemoveSaved={removeSaved}
            onRemovePending={removePending}
          />
        )}
      </Modal>

      <DocsModal pedido={docsModal} onClose={() => setDocsModal(null)} store={store} />
    </div>
  );
}
