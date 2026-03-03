import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';

import TodoCard from '../../components/TodoCard';
import {
  getTodos,
  addTodo,
  toggleTodo,
  updateTodo,
  deleteTodo,
  getCurrentUser,
  logoutUser,
  Todo,
} from '../../hooks/useStorage';
import { Colors, CATEGORIES, Category } from '../../constants/Colors';

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  All: '📋',
  Work: '💼',
  Personal: '👤',
  Shopping: '🛒',
  Health: '💚',
};

const FILTER_TABS = ['All', ...CATEGORIES];

const PRIORITY_OPTIONS = [
  { value: 'high', label: '🔴 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' },
] as const;

export default function TodoWall() {
  const router = useRouter();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [userName, setUserName] = useState('');
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Personal');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setUserName(user.name);

    const data = await getTodos();
    setTodos(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddTodo = async () => {
    if (!newText.trim()) return;

    const todo = await addTodo(newText.trim(), newCategory, newPriority);
    if (todo) setTodos(prev => [todo, ...prev]);

    setNewText('');
    setNewCategory('Personal');
    setNewPriority('medium');
    setShowModal(false);
  };

  const handleToggle = async (id: string) => {
    const updated = await toggleTodo(id);
    if (updated) setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
  };

  const handleUpdate = async (id: string, text: string) => {
    const updated = await updateTodo(id, text);
    if (updated) setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteTodo(id);
    if (ok) setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  const filteredTodos = filter === 'All' ? todos : todos.filter(t => t.category === filter);
  const doneCount = filteredTodos.filter(t => t.done).length;
  const progress = filteredTodos.length > 0 ? doneCount / filteredTodos.length : 0;
  const incomplete = filteredTodos.filter(t => !t.done);
  const completed = filteredTodos.filter(t => t.done);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '☀️ Good morning';
    if (h < 17) return '🌤️ Good afternoon';
    return '🌙 Good evening';
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

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
        <View style={styles.headerCircle} />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetLabel}>{greeting()},</Text>
            <Text style={styles.greetName}>{userName}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.taskBadge}>
              <Text style={styles.taskBadgeNum}>{todos.length}</Text>
              <Text style={styles.taskBadgeLabel}>tasks</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>Today's Progress</Text>
            <Text style={styles.progressFraction}>
              <Text style={styles.progressDone}>{doneCount}</Text>
              <Text style={styles.progressTotal}>/{filteredTodos.length} done</Text>
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressSub}>
            {filteredTodos.length - doneCount === 0 && filteredTodos.length > 0
              ? '🎉 All tasks complete!'
              : `${filteredTodos.length - doneCount} task${filteredTodos.length - doneCount !== 1 ? 's' : ''} remaining`}
          </Text>
        </View>
      </LinearGradient>

      {/* Category filters - compact icon-based tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TABS.map(tab => {
            const isActive = filter === tab;
            const icon = CATEGORY_ICONS[tab] || '📋';
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setFilter(tab)}
                style={[
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                ]}
                activeOpacity={0.75}
              >
                <Text style={styles.filterIcon}>{icon}</Text>
                <Text style={[
                  styles.filterPillText, 
                  isActive && styles.filterPillTextActive
                ]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {filter === 'All' ? 'All Tasks' : filter} ({filteredTodos.length})
        </Text>
        <Text style={styles.sectionSub}>
          {doneCount > 0 ? `${doneCount} completed ✓` : 'None completed yet'}
        </Text>
      </View>

      {/* Todo list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
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
        {filteredTodos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyTitle}>Nothing here yet!</Text>
            <Text style={styles.emptySub}>Tap the yellow + button to add your first task</Text>
          </View>
        ) : (
          <>
            {incomplete.map(todo => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
            {completed.length > 0 && (
              <>
                <Text style={styles.doneLabel}>✓ Completed</Text>
                {completed.map(todo => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))}
              </>
            )}
          </>
        )}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.85}>
        <LinearGradient
          colors={[Colors.yellow, Colors.yellowDark]}
          style={styles.fabInner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowModal(false)}
            activeOpacity={1}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Task ✨</Text>

            <Text style={styles.modalLabel}>WHAT DO YOU NEED TO DO?</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Buy groceries, Call dentist..."
              placeholderTextColor={Colors.gray}
              value={newText}
              onChangeText={setNewText}
              autoFocus
              multiline
              maxLength={200}
            />

            <Text style={styles.modalLabel}>CATEGORY</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setNewCategory(c)}
                  style={[styles.chip, newCategory === c && styles.chipGreen]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, newCategory === c && styles.chipTextWhite]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>PRIORITY</Text>
            <View style={styles.chipRow}>
              {PRIORITY_OPTIONS.map(p => (
                <TouchableOpacity
                  key={p.value}
                  onPress={() => setNewPriority(p.value)}
                  style={[styles.chip, newPriority === p.value && styles.chipYellow]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, newPriority === p.value && styles.chipTextDark]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addBtnWrap} onPress={handleAddTodo} activeOpacity={0.85}>
                <LinearGradient
                  colors={[Colors.green, Colors.greenDark]}
                  style={styles.addBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.addBtnText}>Add Task →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  loadingScreen: { flex: 1, backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: Colors.gray, fontSize: 14 },

  header: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 22, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
  headerCircle: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: Colors.yellow, opacity: 0.15, top: -25, right: -20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greetLabel: { color: Colors.greenLight, fontSize: 13, marginBottom: 3 },
  greetName: { color: Colors.white, fontSize: 22, fontWeight: '900' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskBadge: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  taskBadgeNum: { color: Colors.yellow, fontSize: 18, fontWeight: '900', lineHeight: 22 },
  taskBadgeLabel: { color: Colors.greenLight, fontSize: 10, fontWeight: '600' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  logoutText: { color: Colors.white, fontWeight: '600', fontSize: 12 },

  progressCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 14 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  progressFraction: { fontSize: 14 },
  progressDone: { color: Colors.yellow, fontWeight: '900' },
  progressTotal: { color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  progressTrack: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 99, height: 9, overflow: 'hidden', marginBottom: 8 },
  progressFill: { backgroundColor: Colors.yellow, height: '100%', borderRadius: 99 },
  progressSub: { color: Colors.greenLight, fontSize: 12 },

  filterContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterRow: { paddingHorizontal: 14, gap: 8 },
  filterPill: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: Colors.offWhite, 
    borderWidth: 1, 
    borderColor: Colors.border,
    marginRight: 6,
    gap: 4,
  },
  filterIcon: { fontSize: 14 },
  filterPillActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  filterPillText: { fontSize: 12, fontWeight: '600', color: Colors.greenDark },
  filterPillTextActive: { color: Colors.white },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark },
  sectionSub: { fontSize: 12, color: Colors.gray },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 18 },
  doneLabel: { fontSize: 12, fontWeight: '700', color: Colors.gray, marginBottom: 8, marginTop: 4, letterSpacing: 0.5 },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.dark, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.gray, textAlign: 'center', paddingHorizontal: 40 },

  fab: { position: 'absolute', bottom: 90, right: 22, width: 60, height: 60, borderRadius: 30, shadowColor: Colors.yellowDark, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8, overflow: 'hidden' },
  fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 30, color: Colors.dark, fontWeight: '900', lineHeight: 34 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 28 },
  modalHandle: { width: 40, height: 5, borderRadius: 2.5, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: Colors.dark, marginBottom: 20 },
  modalLabel: { fontSize: 11, fontWeight: '700', color: Colors.gray, letterSpacing: 0.8, marginBottom: 8 },
  modalInput: { backgroundColor: Colors.offWhite, borderRadius: 14, borderWidth: 2, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.dark, marginBottom: 18, minHeight: 56, textAlignVertical: 'top' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: Colors.offWhite, borderWidth: 1.5, borderColor: Colors.border },
  chipGreen: { backgroundColor: Colors.green, borderColor: Colors.green },
  chipYellow: { backgroundColor: Colors.yellow, borderColor: Colors.yellowDark },
  chipText: { fontSize: 13, fontWeight: '700', color: Colors.greenDark },
  chipTextWhite: { color: Colors.white },
  chipTextDark: { color: Colors.dark },

  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, borderWidth: 2, borderColor: Colors.border, alignItems: 'center' },
  cancelBtnText: { color: Colors.gray, fontWeight: '700', fontSize: 15 },
  addBtnWrap: { flex: 2, borderRadius: 14, overflow: 'hidden' },
  addBtn: { paddingVertical: 15, alignItems: 'center', borderRadius: 14 },
  addBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
});

