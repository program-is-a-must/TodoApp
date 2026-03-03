import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getCurrentUser } from '../hooks/useStorage';
import { Colors } from '../constants/Colors';

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        // User is logged in, go to main app
        router.replace('/(tabs)');
      } else {
        // No user, go to login
        router.replace('/login');
      }
    } catch (error) {
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={[Colors.greenDark, Colors.green]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.logo}>📋</Text>
        <Text style={styles.title}>TodoWall</Text>
        <ActivityIndicator size="large" color={Colors.white} style={styles.loader} />
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.greenDark,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1,
  },
  loader: {
    marginTop: 40,
  },
});

