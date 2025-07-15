import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if environment variables are not set
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'https://your-project.supabase.co' || 
      supabaseAnonKey === 'your-anon-key-here') {
    console.warn('Supabase not configured. Using localStorage fallback.');
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

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
      // Fallback to localStorage
      const savedPresents = localStorage.getItem('julia-presents');
      return savedPresents ? JSON.parse(savedPresents) : [];
    }
    
    const { data, error } = await supabase
      .from('presents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching presents:', error);
      throw error;
    }
    
    return data || [];
  },

  async create(present: Omit<Present, 'id' | 'created_at' | 'updated_at'>): Promise<Present> {
    if (!supabase) {
      // Fallback to localStorage
      const newPresent: Present = {
        ...present,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const savedPresents = localStorage.getItem('julia-presents');
      const presents = savedPresents ? JSON.parse(savedPresents) : [];
      const updatedPresents = [newPresent, ...presents];
      localStorage.setItem('julia-presents', JSON.stringify(updatedPresents));
      return newPresent;
    }
    
    const { data, error } = await supabase
      .from('presents')
      .insert([present])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating present:', error);
      throw error;
    }
    
    return data;
  },

  async update(id: string, updates: Partial<Present>): Promise<Present> {
    if (!supabase) {
      // Fallback to localStorage
      const savedPresents = localStorage.getItem('julia-presents');
      const presents = savedPresents ? JSON.parse(savedPresents) : [];
      const updatedPresents = presents.map((present: Present) => 
        present.id === id ? { ...present, ...updates, updated_at: new Date().toISOString() } : present
      );
      localStorage.setItem('julia-presents', JSON.stringify(updatedPresents));
      return updatedPresents.find((p: Present) => p.id === id);
    }
    
    const { data, error } = await supabase
      .from('presents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating present:', error);
      throw error;
    }
    
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase) {
      // Fallback to localStorage
      const savedPresents = localStorage.getItem('julia-presents');
      const presents = savedPresents ? JSON.parse(savedPresents) : [];
      const updatedPresents = presents.filter((present: Present) => present.id !== id);
      localStorage.setItem('julia-presents', JSON.stringify(updatedPresents));
      return;
    }
    
    const { error } = await supabase
      .from('presents')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting present:', error);
      throw error;
    }
  }
};