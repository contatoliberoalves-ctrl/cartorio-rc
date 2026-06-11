import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './lib/supabase.js';

export function useStore() {
  const [pedidos, setPedidos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [comunicacoes, setComunicacoes] = useState({});
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [fetchAll]);

  const api = useMemo(() => ({
    state: { pedidos, vendas, comunicacoes, tarefas },
    loading,
    error,

    addPedido:    async (p)        => { return await supabase.from('pedidos').insert(p); },
    updatePedido: async (id, patch) => { return await supabase.from('pedidos').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id); },
    delPedido:    async (id)       => { return await supabase.from('pedidos').delete().eq('id', id); },

    addVenda:    async (v)        => { return await supabase.from('vendas').insert(v); },
    updateVenda: async (id, patch) => { return await supabase.from('vendas').update(patch).eq('id', id); },
    delVenda:    async (id)       => { return await supabase.from('vendas').delete().eq('id', id); },

    toggleComunic: async (key) => {
      if (comunicacoes[key]) {
        return await supabase.from('comunicacoes_feitas').delete().eq('periodo_key', key);
      } else {
        const comId = key.split('-')[0];
        return await supabase.from('comunicacoes_feitas').insert({ periodo_key: key, comunicacao_id: comId });
      }
    },

    addTarefa:    async (texto) => { return await supabase.from('tarefas').insert({ texto, feito: false }); },
    toggleTarefa: async (id) => {
      const t = tarefas.find(x => x.id === id);
      return t ? await supabase.from('tarefas').update({ feito: !t.feito }).eq('id', id) : Promise.resolve();
    },
    delTarefa: async (id) => { return await supabase.from('tarefas').delete().eq('id', id); },
  }), [pedidos, vendas, comunicacoes, tarefas, loading, error]);

  return api;
}
