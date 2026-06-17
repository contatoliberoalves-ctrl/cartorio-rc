import { useState, useRef, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import { Button } from '../components.jsx';
import { supabase } from '../lib/supabase.js';

const SUGESTOES = [
  'Quais documentos para habilitação de casamento?',
  'Prazo legal para registrar um nascimento?',
  'Como fazer averbação de divórcio na certidão de casamento?',
  'Quem pode solicitar 2ª via de certidão de óbito?',
  'Quando o registro de nascimento é gratuito?',
  'Procedimento de retificação de erro de grafia no nome?',
];

export default function IAView() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (texto) => {
    const pergunta = (texto ?? input).trim();
    if (!pergunta || loading) return;
    const novas = [...messages, { role: 'user', content: pergunta }];
    setMessages(novas);
    setInput('');
    setError(null);
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('legal-assistant', {
        body: { messages: novas },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setMessages(m => [...m, { role: 'assistant', content: data.text }]);
    } catch (e) {
      setError(e.message || 'Erro ao consultar o assistente.');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

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
            <button key={i} className="ia-chip" onClick={() => send(s)} disabled={loading}>{s}</button>
          ))}
        </div>
        <div className="ia-disclaimer">
          <Icon name="alert" size={14} />
          <span>Orientação de apoio. Confirme sempre na corregedoria e na norma vigente antes de praticar o ato.</span>
        </div>
      </div>

      <div className="ia-chat">
        <div className="ia-msgs">
          {messages.length === 0 && (
            <div className="ia-welcome">
              <span className="ia-spark big"><Icon name="sparkles" size={28} /></span>
              <h3>Assistente jurídico</h3>
              <p>Tire dúvidas sobre registros civis, prazos e procedimentos. Use uma das perguntas frequentes ao lado ou digite sua pergunta abaixo.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`ia-msg ${m.role}`}>{m.content}</div>
          ))}
          {loading && <div className="ia-msg assistant ia-typing">Consultando…</div>}
          {error && <div className="ia-msg error">{error}</div>}
          <div ref={endRef} />
        </div>
        <div className="ia-input">
          <textarea rows="1" value={input} placeholder="Digite sua pergunta…"
            onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} disabled={loading} />
          <Button icon="send" onClick={() => send()} disabled={loading || !input.trim()}>Enviar</Button>
        </div>
      </div>
    </div>
  );
}
