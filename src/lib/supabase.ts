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

// LocalStorage fallback functions
const localStorageKey = 'julia-presents';

const localStorageService = {
  getAll(): Present[] {
    try {
      const data = localStorage.getItem(localStorageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  save(presents: Present[]): void {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(presents));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  create(present: Omit<Present, 'id' | 'created_at' | 'updated_at'>): Present {
    const presents = this.getAll();
    const newPresent: Present = {
      ...present,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    presents.unshift(newPresent);
    this.save(presents);
    return newPresent;
  },

  update(id: string, updates: Partial<Present>): Present | null {
    const presents = this.getAll();
    const index = presents.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    presents[index] = {
      ...presents[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save(presents);
    return presents[index];
  },

  delete(id: string): boolean {
    const presents = this.getAll();
    const filtered = presents.filter(p => p.id !== id);
    if (filtered.length === presents.length) return false;
    this.save(filtered);
    return true;
  }
};

export const presentsService = {
  async getAll(): Promise<Present[]> {
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured. Using localStorage fallback.');
      return localStorageService.getAll();
    }

    try {
      const { data, error } = await supabase
        .from('presents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching presents:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      return localStorageService.getAll();
    }
  },

  async create(present: Omit<Present, 'id' | 'created_at' | 'updated_at'>): Promise<Present> {
    if (!isSupabaseConfigured) {
      return localStorageService.create(present);
    }

    try {
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
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      return localStorageService.create(present);
    }
  },

  async update(id: string, updates: Partial<Present>): Promise<Present> {
    if (!isSupabaseConfigured) {
      const result = localStorageService.update(id, updates);
      if (!result) throw new Error('Present not found');
      return result;
    }

    try {
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
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      const result = localStorageService.update(id, updates);
      if (!result) throw new Error('Present not found');
      return result;
    }
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const success = localStorageService.delete(id);
      if (!success) throw new Error('Present not found');
      return;
    }

    try {
      const { error } = await supabase
        .from('presents')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting present:', error);
        throw error;
      }
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      const success = localStorageService.delete(id);
      if (!success) throw new Error('Present not found');
    }
  }
};

// Export configuration status for components to use
export { isSupabaseConfigured };