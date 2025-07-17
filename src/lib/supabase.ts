import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseUrl.includes('supabase.co')
);

if (!isSupabaseConfigured) {
  console.error('❌ Supabase não configurado! Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface Present {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  store_link?: string;
  received: boolean;
  priority: 'sonho' | 'querido' | 'desejo';
  created_at: string;
  updated_at: string;
}

export const presentsService = {
  async getAll(): Promise<Present[]> {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.');
    }

    const { data, error } = await supabase
      .from('presents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar presentes:', error);
      throw error;
    }
    
    return data || [];
  },

  async create(present: Omit<Present, 'id' | 'created_at' | 'updated_at'>): Promise<Present> {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.');
    }

    const { data, error } = await supabase
      .from('presents')
      .insert([present])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar presente:', error);
      throw error;
    }
    
    return data;
  },

  async update(id: string, updates: Partial<Present>): Promise<Present> {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.');
    }

    const { data, error } = await supabase
      .from('presents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao atualizar presente:', error);
      throw error;
    }
    
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.');
    }

    const { error } = await supabase
      .from('presents')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao deletar presente:', error);
      throw error;
    }
  }
};

// Export configuration status for components to use
export { isSupabaseConfigured };