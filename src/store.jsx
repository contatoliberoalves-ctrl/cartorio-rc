import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './lib/supabase.js';

export function useStore() {
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [comunicacoes, setComunicacoes] = useState({});
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setAuthChecked(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    supabase.from('profiles').select('*').eq('id', session.user.id).single()
      .then(r => { if (!r.error) setProfile(r.data); });
  }, [session]);

  const fetchAll = useCallback(async () => {
    try {
      const [pedRes, venRes, comRes, tarRes] = await Promise.all([
        supabase.from('pedidos').select('*').order('created_at', { ascending: false }),
        supabase.from('vendas').select('*').order('created_at', { ascending: false }),
        supabase.from('comunicacoes_feitas').select('*'),
        supabase.from('tarefas').select('*').order('created_at', { ascending: true }),
      ]);
      if (pedRes.error) throw pedRes.error;
      setPedidos(pedRes.data || []);
      setVendas(venRes.data || []);
      const map = {};
      (comRes.data || []).forEach(r => { map[r.periodo_key] = true; });
      setComunicacoes(map);
      setTarefas(tarRes.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    setLoading(true);
    fetchAll();

    const ch = supabase.channel('cartorio-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () =>
        supabase.from('pedidos').select('*').order('created_at', { ascending: false })
          .then(r => { if (!r.error) setPedidos(r.data); })
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, () =>
        supabase.from('vendas').select('*').order('created_at', { ascending: false })
          .then(r => { if (!r.error) setVendas(r.data); })
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comunicacoes_feitas' }, () =>
        supabase.from('comunicacoes_feitas').select('*').then(r => {
          if (!r.error) {
            const m = {};
            (r.data || []).forEach(row => { m[row.periodo_key] = true; });
            setComunicacoes(m);
          }
        })
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas' }, () =>
        supabase.from('tarefas').select('*').order('created_at', { ascending: true })
          .then(r => { if (!r.error) setTarefas(r.data); })
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [session, fetchAll]);

  const api = useMemo(() => ({
    state: { pedidos, vendas, comunicacoes, tarefas },
    loading,
    error,
    session,
    authChecked,
    profile,

    signIn:  async (email, password) => await supabase.auth.signInWithPassword({ email, password }),
    signOut: async () => await supabase.auth.signOut(),

    addPedido: async (p) => {
      const r = await supabase.from('pedidos').insert(p).select();
      if (!r.error && r.data) setPedidos(prev => [r.data[0], ...prev]);
      return r;
    },
    updatePedido: async (id, patch) => {
      const r = await supabase.from('pedidos').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select();
      if (!r.error && r.data) setPedidos(prev => prev.map(x => x.id === id ? r.data[0] : x));
      return r;
    },
    delPedido: async (id) => {
      const r = await supabase.from('pedidos').delete().eq('id', id);
      if (!r.error) setPedidos(prev => prev.filter(x => x.id !== id));
      return r;
    },

    addVenda: async (v) => {
      const r = await supabase.from('vendas').insert(v).select();
      if (!r.error && r.data) setVendas(prev => [r.data[0], ...prev]);
      return r;
    },
    updateVenda: async (id, patch) => {
      const r = await supabase.from('vendas').update(patch).eq('id', id).select();
      if (!r.error && r.data) setVendas(prev => prev.map(x => x.id === id ? r.data[0] : x));
      return r;
    },
    delVenda: async (id) => {
      const r = await supabase.from('vendas').delete().eq('id', id);
      if (!r.error) setVendas(prev => prev.filter(x => x.id !== id));
      return r;
    },

    toggleComunic: async (key) => {
      if (comunicacoes[key]) {
        const r = await supabase.from('comunicacoes_feitas').delete().eq('periodo_key', key);
        if (!r.error) setComunicacoes(prev => { const next = { ...prev }; delete next[key]; return next; });
        return r;
      } else {
        const comId = key.split('-')[0];
        const r = await supabase.from('comunicacoes_feitas').insert({ periodo_key: key, comunicacao_id: comId });
        if (!r.error) setComunicacoes(prev => ({ ...prev, [key]: true }));
        return r;
      }
    },

    addTarefa: async (texto) => {
      const r = await supabase.from('tarefas').insert({ texto, feito: false }).select();
      if (!r.error && r.data) setTarefas(prev => [...prev, r.data[0]]);
      return r;
    },
    toggleTarefa: async (id) => {
      const t = tarefas.find(x => x.id === id);
      if (!t) return Promise.resolve({ error: null });
      const r = await supabase.from('tarefas').update({ feito: !t.feito }).eq('id', id).select();
      if (!r.error && r.data) setTarefas(prev => prev.map(x => x.id === id ? r.data[0] : x));
      return r;
    },
    delTarefa: async (id) => {
      const r = await supabase.from('tarefas').delete().eq('id', id);
      if (!r.error) setTarefas(prev => prev.filter(x => x.id !== id));
      return r;
    },

    uploadPedidoDoc: async (pedidoId, file) => {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${pedidoId}/${Date.now()}-${safe}`;
      const { error } = await supabase.storage.from('pedido-docs').upload(path, file);
      if (error) throw error;
      return { name: file.name, path, type: file.type, size: file.size };
    },
    getDocUrl: async (path) => {
      const { data } = await supabase.storage.from('pedido-docs').createSignedUrl(path, 3600);
      return data?.signedUrl || null;
    },
    deleteDoc: async (path) => {
      return supabase.storage.from('pedido-docs').remove([path]);
    },
  }), [pedidos, vendas, comunicacoes, tarefas, loading, error, session, authChecked, profile]);

  return api;
}
