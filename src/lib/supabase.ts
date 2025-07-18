import { createClient } from '@supabase/supabase-js';

// Configurações diretas do Supabase
const supabaseUrl = 'https://busipvpnosnuozkixclx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1c2lwdnBub3NudW96a2l4Y2x4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU0MDA2MywiZXhwIjoyMDY4MTE2MDYzfQ.6VIwDf__pwNGd-ppsjZXMKaN60x1EdFagzoiIMFTv20';

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Present {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  store_link?: string;
  observation?: string;
  received: boolean;
  priority: 'sonho' | 'querido' | 'desejo';
  created_at: string;
  updated_at: string;
}

export const presentsService = {
  async getAll(): Promise<Present[]> {
    console.log('🔍 Buscando presentes do Supabase...');
    
    const { data, error } = await supabase
      .from('presents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar presentes:', error);
      throw error;
    }
    
    console.log('✅ Presentes carregados do Supabase:', data?.length || 0);
    return data || [];
  },

  async create(present: Omit<Present, 'id' | 'created_at' | 'updated_at'>): Promise<Present> {
    console.log('➕ Criando presente no Supabase:', present.name);
    
    const { data, error } = await supabase
      .from('presents')
      .insert([present])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar presente no Supabase:', error);
      throw error;
    }
    
    console.log('✅ Presente criado no Supabase:', data.name);
    return data;
  },

  async update(id: string, updates: Partial<Present>): Promise<Present> {
    console.log('✏️ Atualizando presente no Supabase:', id);
    
    const { data, error } = await supabase
      .from('presents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao atualizar presente no Supabase:', error);
      throw error;
    }
    
    console.log('✅ Presente atualizado no Supabase:', data.name);
    return data;
  },

  async delete(id: string): Promise<void> {
    console.log('🗑️ Deletando presente no Supabase:', id);
    
    const { error } = await supabase
      .from('presents')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao deletar presente no Supabase:', error);
      throw error;
    }
    
    console.log('✅ Presente deletado do Supabase com sucesso');
  }
};