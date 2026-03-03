import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { getCurrentUser, getStats, logoutUser, User } from '../hooks/useStorage';
import { Colors, CATEGORY_COLORS, Category } from '../constants/Colors';

interface Stats {
  total: number;
  done: number;
  pending: number;
  high_priority: number;
  completion_rate: number;
  by_category: Array<{
    category: string;
    total: number;
    done: number;
  }>;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    setUser(currentUser);

    const statsData = await getStats();
    setStats(statsData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDark} />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.greenDark, Colors.green]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.green}
            colors={[Colors.green]}
          />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats?.total || 0}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={[styles.statNum, styles.statNumWhite]}>{stats?.done || 0}</Text>
            <Text style={[styles.statLabel, styles.statLabelWhite]}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.yellowDark }]}>{stats?.pending || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, styles.statCardRed]}>
            <Text style={styles.statNum}>{stats?.high_priority || 0}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
        </View>

        {/* Completion Rate */}
        <View style={styles.completionCard}>
          <Text style={styles.completionTitle}>Completion Rate</Text>
          <View style={styles.completionProgress}>
            <View 
              style={[
                styles.completionFill, 
                { width: `${stats?.completion_rate || 0}%` }
              ]} 
            />
          </View>
          <Text style={styles.completionPercent}>
            {stats?.completion_rate || 0}% Complete
          </Text>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {stats?.by_category?.map((cat) => (
            <View key={cat.category} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <View 
                  style={[
                    styles.categoryDot, 
                    { backgroundColor: CATEGORY_COLORS[cat.category as Category] || Colors.gray }
                  ]} 
                />
                <Text style={styles.categoryName}>{cat.category}</Text>
              </View>
              <View style={styles.categoryStats}>
                <Text style={styles.categoryCount}>
                  {cat.done}/{cat.total}
                </Text>
                <View style={styles.categoryBar}>
                  <View 
                    style={[
                      styles.categoryFill,
                      { 
                        width: cat.total > 0 ? `${(cat.done / cat.total) * 100}%` : '0%',
                        backgroundColor: CATEGORY_COLORS[cat.category as Category] || Colors.gray
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.dark,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.greenLight,
  },
  logoutBtn: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  logoutText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardGreen: {
    backgroundColor: Colors.green,
  },
  statCardRed: {
    backgroundColor: Colors.priorityHigh,
  },
  statNum: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.dark,
    marginBottom: 4,
  },
  statNumWhite: {
    color: Colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
  },
  statLabelWhite: {
    color: 'rgba(255,255,255,0.8)',
  },
  completionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 16,
  },
  completionProgress: {
    height: 12,
    backgroundColor: Colors.offWhite,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  completionFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 6,
  },
  completionPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.green,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray,
    minWidth: 35,
  },
  categoryBar: {
    width: 60,
    height: 6,
    backgroundColor: Colors.offWhite,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryFill: {
    height: '100%',
    borderRadius: 3,
  },
});

