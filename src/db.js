import { supabase } from './supabase';

// ── CITAS ──────────────────────────────────────────
export const getCitas = async () => {
  const { data, error } = await supabase.from('citas').select('*').order('date').order('time');
  if (error) console.error(error);
  return data || [];
};

export const addCita = async (cita) => {
  const { data, error } = await supabase.from('citas').insert([cita]).select();
  if (error) console.error(error);
  return data?.[0];
};

export const updateCita = async (id, cambios) => {
  const { error } = await supabase.from('citas').update(cambios).eq('id', id);
  if (error) console.error(error);
};

export const deleteCita = async (id) => {
  const { error } = await supabase.from('citas').delete().eq('id', id);
  if (error) console.error(error);
};

// ── CLIENTES ───────────────────────────────────────
export const getClientes = async () => {
  const { data, error } = await supabase.from('clientes').select('*').order('name');
  if (error) console.error(error);
  return data || [];
};

export const addCliente = async (cliente) => {
  const { data, error } = await supabase.from('clientes').insert([cliente]).select();
  if (error) console.error(error);
  return data?.[0];
};
// NUEVA FUNCIÓN: actualizar puntos, visitas y última visita
export const updateCliente = async (id, cambios) => {

  const { data, error } = await supabase
    .from('clientes')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando cliente:', error);
    return null;
  }

  return data;
};

// ── INVENTARIO ─────────────────────────────────────
export const getInventario = async () => {
  const { data, error } = await supabase.from('inventario').select('*').order('name');
  if (error) console.error(error);
  return data || [];
};

export const updateInventario = async (id, cambios) => {
  const { error } = await supabase.from('inventario').update(cambios).eq('id', id);
  if (error) console.error(error);
};

export const addInventario = async (item) => {
  const { data, error } = await supabase.from('inventario').insert([item]).select();
  if (error) console.error(error);
  return data?.[0];
};

// ── VENTAS ─────────────────────────────────────────
export const getVentas = async () => {
  const { data, error } = await supabase.from('ventas').select('*').order('created_at', { ascending: false });
  if (error) console.error(error);
  return data || [];
};

export const addVenta = async (venta) => {
  const { data, error } = await supabase.from('ventas').insert([venta]).select();
  if (error) console.error(error);
  return data?.[0];
};

// ── PERSONAL ───────────────────────────────────────
export const getPersonal = async () => {
  const { data, error } = await supabase.from('personal').select('*').order('name');
  if (error) console.error(error);
  return data || [];
};

export const addPersonal = async (empleado) => {
  const { data, error } = await supabase.from('personal').insert([empleado]).select();
  if (error) console.error(error);
  return data?.[0];
};

export const getCitasByDate = async (date) => {
  const { data, error } = await supabase
    .from('citas')
    .select('time, barber_id')
    .eq('date', date)
    .neq('status', 'cancelled');
  if (error) console.error(error);
  return data || [];
};