// ─────────────────────────────────────────────────────────────────────────────
// Colors and Categories for TodoWall
// ─────────────────────────────────────────────────────────────────────────────

export const Colors = {
  // Primary brand colors
  green: '#10B981',
  greenDark: '#059669',
  greenLight: '#A7F3D0',
  
  // Secondary colors
  yellow: '#FBBF24',
  yellowDark: '#F59E0B',
  
  // Neutral colors
  white: '#FFFFFF',
  offWhite: '#F9FAFB',
  border: '#E5E7EB',
  gray: '#9CA3AF',
  dark: '#1F2937',
  
  // Priority colors
  priorityHigh: '#EF4444',
  priorityMedium: '#F59E0B',
  priorityLow: '#10B981',
  
  // Category colors (matching backend)
  categoryWork: '#3B82F6',
  categoryPersonal: '#8B5CF6',
  categoryShopping: '#F59E0B',
  categoryHealth: '#10B981',
};

export const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health'] as const;
export type Category = typeof CATEGORIES[number];

// Category colors mapping
export const CATEGORY_COLORS: Record<Category, string> = {
  Work: Colors.categoryWork,
  Personal: Colors.categoryPersonal,
  Shopping: Colors.categoryShopping,
  Health: Colors.categoryHealth,
};

// Priority colors mapping
export const PRIORITY_COLORS = {
  high: Colors.priorityHigh,
  medium: Colors.priorityMedium,
  low: Colors.priorityLow,
};

