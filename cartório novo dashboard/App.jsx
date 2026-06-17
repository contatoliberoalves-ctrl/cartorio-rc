import { useState } from 'react';
import { useStore } from './store.jsx';
import { Icon } from './icons.jsx';
import { COMUNICACOES } from './data.js';
import { hoje, fmtData, proximoVencimento, diasRestantes, periodoKey } from './utils.js';
import Login             from './Login.jsx';
import OverviewView     from './views/overview.jsx';
import PedidosView      from './views/pedidos.jsx';
import ComunicacoesView from './views/comunicacoes.jsx';
import TabelaView       from './views/tabela.jsx';
import PapelariaView    from './views/papelaria.jsx';
import IAView           from './views/ia.jsx';

const NAV = [
  { id: 'overview',     label: 'Visão geral',         icon: 'home' },
  { id: 'pedidos',      label: 'Pedidos CRC',          icon: 'send' },
  { id: 'comunicacoes', label: 'Comunicações',         icon: 'bell' },
  { id: 'tabela',       label: 'Emolumentos PE',       icon: 'table' },
  { id: 'papelaria',    label: 'Papelaria',            icon: 'print' },
  { id: 'ia',           label: 'Assistente IA',        icon: 'sparkles' },
];

const TITULOS = {
  overview:     ['Visão geral',                'Resumo financeiro e prazos do cartório'],
  pedidos:      ['Pedidos CRC',                'Solicitações enviadas, recebidas e do próprio cartório'],
  comunicacoes: ['Comunicações obrigatórias',  'Prazos legais e envios periódicos'],
  tabela:       ['Tabela de Emolumentos — PE', 'Valores vigentes do Estado de Pernambuco (2026)'],
  papelaria:    ['Papelaria e serviços',        'Lançamentos e controle de caixa'],
  ia:           ['Assistente jurídico',         'Dúvidas com base nas normas e na legislação'],
};

export default function App() {
  const store = useStore();
  const [view, setView] = useState('overview');

  const badgeCom = (() => {
    if (store.loading) return 0;
    const now = new Date();
    return COMUNICACOES.filter(c => c.freq !== 'evento').filter(c => {
      const venc = proximoVencimento(c, now);
      const dias = diasRestantes(venc, now);
      const key  = periodoKey(c, now);
      return !store.state.comunicacoes[key] && dias !== null && dias <= 7;
    }).length;
  })();

  if (!store.authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7670', fontSize: 14 }}>
        Carregando…
      </div>
    );
  }

  if (!store.session) {
    return <Login store={store} />;
  }

  if (store.error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, color: '#b3261e', padding: 32, textAlign: 'center' }}>
        <Icon name="alert" size={32} />
        <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Erro ao conectar ao banco de dados.</p>
        <p style={{ margin: 0, fontSize: 13, color: '#6b7670' }}>{store.error}</p>
        <p style={{ margin: 0, fontSize: 12, color: '#6b7670' }}>
          Verifique o arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
        </p>
      </div>
    );
  }

  const [title, subtitle] = TITULOS[view] || ['', ''];
  const isFuncionaria = store.profile?.role === 'funcionaria';
  const userLabel = store.profile?.nome || store.session.user.email;
  const roleLabel = store.profile?.role === 'admin' ? 'Administrador(a)' : 'Funcionária';

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">RC</div>
          <div className="brand-txt">
            <div className="brand-name">Registro Civil</div>
            <div className="brand-sub">Curral Queimado</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map(n => (
            <button key={n.id} className={`nav-item${view === n.id ? ' active' : ''}`} onClick={() => setView(n.id)}>
              <Icon name={n.icon} size={19} />
              <span>{n.label}</span>
              {n.id === 'comunicacoes' && badgeCom > 0 && <span className="nav-badge">{badgeCom}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user-row">
            <div className="user-info">
              <div className="resp">{userLabel}</div>
              <div className="resp-sub">{roleLabel}</div>
            </div>
            <button className="logout-btn" title="Sair" onClick={() => store.signOut()}>
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="topbar-right">
            <div className="date-chip"><Icon name="clock" size={15} /> {fmtData(hoje())}</div>
          </div>
        </header>
        <div className="content">
          {store.loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#6b7670', fontSize: 14 }}>
              Carregando dados do banco…
            </div>
          ) : (
            <>
              {view === 'overview'     && <OverviewView store={store} go={setView} hideValores={isFuncionaria} />}
              {view === 'pedidos'      && <PedidosView store={store} hideValores={isFuncionaria} />}
              {view === 'comunicacoes' && <ComunicacoesView store={store} />}
              {view === 'tabela'       && <TabelaView />}
              {view === 'papelaria'    && <PapelariaView store={store} hideValores={isFuncionaria} />}
              {view === 'ia'           && <IAView />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
