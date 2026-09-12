import { supabase } from './supabase';
import { ShopItem } from '../types';

export const shopService = {
  async fetchShopItems(): Promise<{ data: ShopItem[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase.from('shop_items').select('*').order('id');
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al cargar ítems de la tienda' };
    }
  },

  async buyItem(
    userId: string,
    item: ShopItem,
    currentGems: number
  ): Promise<{ success: boolean; error: string | null; newGems?: number }> {
    try {
      if (currentGems < item.price_gems) {
        return { success: false, error: 'No tienes suficientes gemas 💎' };
      }

      const newGems = currentGems - item.price_gems;

      // Actualizar gemas en profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ gems: newGems })
        .eq('firebase_uid', userId);

      if (profileError) return { success: false, error: profileError.message };

      if (item.item_type === 'refill_lives') {
        await supabase.from('profiles').update({ lives: 5 }).eq('firebase_uid', userId);
      } else if (item.item_type === 'streak_freeze') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('streak_freeze_count')
          .eq('firebase_uid', userId)
          .single();
        const currentFreeze = profile?.streak_freeze_count || 0;
        await supabase
          .from('profiles')
          .update({ streak_freeze_count: currentFreeze + 1 })
          .eq('firebase_uid', userId);
      }

      return { success: true, error: null, newGems };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error en la compra' };
    }
  },
};
