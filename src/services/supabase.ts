import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pcjkblllqokyhomlwloo.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjamtibGxscW9reWhvbWx3bG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NzUzMDAsImV4cCI6MjAwMDAwMDAwMH0.tWqeNN_qQJ5fVuliCsWD_Xg3sdK9mZzwC3hMNI6KsgY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
