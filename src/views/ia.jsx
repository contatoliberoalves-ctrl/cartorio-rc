import { Icon } from '../icons.jsx';
import { Button } from '../components.jsx';

const SUGESTOES = [
  'Quais documentos para habilitação de casamento?',
  'Prazo legal para registrar um nascimento?',
  'Como fazer averbação de divórcio na certidão de casamento?',
  'Quem pode solicitar 2ª via de certidão de óbito?',
  'Quando o registro de nascimento é gratuito?',
  'Procedimento de retificação de erro de grafia no nome?',
];

export default function IAView() {
  return (
    <div className="ia-wrap">
      <div className="ia-side">
        <div className="ia-side-head">
          <span className="ia-spark"><Icon name="sparkles" size={18} /></span>
          <div>
            <div className="ia-title">Consulta jurídica</div>
            <div className="ia-sub">Normas · Lei 6.015/73 · Jurisprudência</div>
          </div>
        </div>
        <div className="ia-sug-label">Perguntas frequentes</div>
        <div className="ia-sug">
          {SUGESTOES.map((s, i) => (
            <div key={i} className="ia-chip" style={{ cursor: 'default', opacity: 0.6 }}>{s}</div>
          ))}
        </div>
        <div className="ia-disclaimer">
          <Icon name="alert" size={14} />
          <span>Orientação de apoio. Confirme sempre na corregedoria e na norma vigente antes de praticar o ato.</span>
        </div>
      </div>

      <div className="ia-chat">
        <div className="ia-msgs">
          <div className="ia-welcome">
            <span className="ia-spark big"><Icon name="sparkles" size={28} /></span>
            <h3>Assistente em configuração</h3>
            <p>Para ativar o assistente jurídico, configure uma Edge Function no Supabase que chame a API da Anthropic com o prompt do cartório. Consulte o README do projeto para as instruções de integração.</p>
          </div>
        </div>
        <div className="ia-input" style={{ opacity: 0.5, pointerEvents: 'none' }}>
          <textarea rows="1" placeholder="Assistente indisponível — configure a API no backend…" disabled />
          <Button icon="send" disabled>Enviar</Button>
        </div>
      </div>
    </div>
  );
}
