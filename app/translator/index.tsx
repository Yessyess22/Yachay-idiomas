import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function TranslatorRedirectScreen() {
  const params = useLocalSearchParams<{ text?: string; lang?: string }>();
  return <Redirect href={{ pathname: '/(tabs)/translator', params }} />;
}
