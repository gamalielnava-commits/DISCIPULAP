import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { trpc } from '@/lib/trpc';

export default function TRPCExample() {
  const [name, setName] = useState<string>('');
  
  const hiMutation = trpc.example.hi.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success!', `Hello ${data.hello}! Date: ${data.date}`);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSubmit = () => {
    if (name.trim()) {
      hiMutation.mutate({ name: name.trim() });
    } else {
      Alert.alert('Error', 'Please enter a name');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>tRPC Test</Text>
      <Text style={styles.subtitle}>Test the backend connection</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        testID="name-input"
      />
      
      <TouchableOpacity
        style={[styles.button, hiMutation.isPending && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={hiMutation.isPending}
        testID="submit-button"
      >
        <Text style={styles.buttonText}>
          {hiMutation.isPending ? 'Sending...' : 'Say Hi!'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2B6CB0',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2B6CB0',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});