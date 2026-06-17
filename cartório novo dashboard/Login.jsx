import { useState } from 'react';
import { Icon } from './icons.jsx';
import { Button, Field } from './components.jsx';

export default function Login({ store }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await store.signIn(email, senha);
    if (error) setError('E-mail ou senha incorretos.');
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="brand login-brand">
          <div className="brand-mark">RC</div>
          <div className="brand-txt">
            <div className="brand-name">Registro Civil</div>
            <div className="brand-sub">Curral Queimado</div>
          </div>
        </div>
        <h1 className="login-title">Entrar</h1>
        <p className="login-sub">Acesse o painel de gestão do cartório.</p>
        <Field label="E-mail" wide>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required autoFocus placeholder="seu@email.com" />
        </Field>
        <Field label="Senha" wide>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
            required placeholder="••••••••" />
        </Field>
        {error && <div className="login-error"><Icon name="alert" size={14} />{error}</div>}
        <Button type="submit" icon="check" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
}
