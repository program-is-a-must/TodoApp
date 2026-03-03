import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { Todo, toggleTodo, updateTodo, deleteTodo } from '../hooks/useStorage';
import { Colors, CATEGORY_COLORS, Category, PRIORITY_COLORS } from '../constants/Colors';

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}

export default function TodoCard({ todo, onToggle, onDelete, onUpdate }: TodoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const categoryColor = CATEGORY_COLORS[todo.category as Category] || Colors.gray;
  const priorityColor = PRIORITY_COLORS[todo.priority] || Colors.gray;

  const handleToggle = () => {
    onToggle(todo.id);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(todo.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(todo.id) },
      ]
    );
  };

  return (
    <View style={[styles.card, todo.done && styles.cardDone]}>
      {/* Checkbox */}
      <TouchableOpacity
        style={[styles.checkbox, todo.done && styles.checkboxDone]}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        {todo.done && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {isEditing ? (
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            autoFocus
            multiline
            onBlur={handleSave}
            onSubmitEditing={handleSave}
          />
        ) : (
          <Text style={[styles.text, todo.done && styles.textDone]} numberOfLines={2}>
            {todo.text}
          </Text>
        )}

        {/* Meta info */}
        <View style={styles.meta}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{todo.category}</Text>
          </View>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={styles.priorityText}>{todo.priority}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!isEditing ? (
          <>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>💾</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>✖️</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardDone: {
    opacity: 0.7,
    backgroundColor: Colors.offWhite,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 15,
    color: Colors.dark,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: Colors.gray,
  },
  editInput: {
    fontSize: 15,
    color: Colors.dark,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.green,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
});

