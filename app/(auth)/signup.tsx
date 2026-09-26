import { useAuth } from '@/src/context/AuthContext';
import { Illustrations } from '@/constants/illustrations';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  async function handleSignup() {
    setError('');
    if (!username.trim()) {
      setError('Por favor ingresa un nombre de usuario');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, username.trim());
    setLoading(false);

    if (error) setError(error);
  }

  async function handleGoogleLogin() {
    setError('');
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);

    if (error) setError(error);
  }

  return (
    <View style={styles.container}>
      <Image source={Illustrations.appIconCircularMontana} style={styles.brandImage} contentFit="contain" />
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Empieza a aprender quechua en Yachay</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario (ej. yachachiq)"
        placeholderTextColor="#999"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña (mín. 6 caracteres)"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading || googleLoading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarme</Text>}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o bien</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleLogin}
        disabled={loading || googleLoading}
        activeOpacity={0.85}
      >
        {googleLoading ? (
          <ActivityIndicator color="#4285F4" size="small" />
        ) : (
          <View style={styles.googleBtnContent}>
            <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Registrarme con Google</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  brandImage: { width: 100, height: 100, alignSelf: 'center', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '900', color: '#000', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 2, borderColor: '#e5e5e5', borderRadius: 12,
    padding: 13, marginBottom: 10, fontSize: 15, color: '#000',
  },
  button: {
    backgroundColor: '#00C853', borderRadius: 14, padding: 15,
    alignItems: 'center', marginTop: 4,
    borderBottomWidth: 4, borderBottomColor: '#009624',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#D1D5DB',
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '700',
  },
  link: { color: '#1cb0f6', textAlign: 'center', marginTop: 18, fontSize: 14, fontWeight: '600' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 8 },
});