import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — Change this to your computer's local IP when testing on a real phone
// To find it:  Mac/Linux → run: ifconfig | grep "inet "
//              Windows   → run: ipconfig  (look for IPv4 Address)
//
// Example: export const API_URL = 'http://192.168.1.5:8000/api';
// ─────────────────────────────────────────────────────────────────────────────
export const API_URL = 'https://todolist-1-ebht.onrender.com';

const TOKEN_KEY = 'todowall_token';
const USER_KEY  = 'todowall_user';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  category: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};

// ─── Base fetch helper ────────────────────────────────────────────────────────
// Attaches the token automatically to every request

const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok && response.status !== 422) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Register a new user
 * Called by: app/signup.tsx — handleSignup()
 */
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: User }> => {
  try {
    const data = await apiFetch('/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: password,
      }),
    });

    if (data.success) {
      await saveToken(data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Login existing user
 * Called by: app/login.tsx — handleLogin()
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: User }> => {
  try {
    const data = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success) {
      await saveToken(data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Logout current user
 * Called by: app/(tabs)/index.tsx and explore.tsx
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await apiFetch('/logout', { method: 'POST' });
  } catch (_) {
    // Even if the API call fails, clear local storage
  } finally {
    await removeToken();
  }
};

/**
 * Get the currently logged-in user from local storage
 * Called by: app/index.tsx — splash screen check
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = await getToken();
    if (!token) return null;

    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── Todos ────────────────────────────────────────────────────────────────────

/**
 * Get all todos for the logged-in user
 * Called by: app/(tabs)/index.tsx — loadData()
 */
export const getTodos = async (): Promise<Todo[]> => {
  try {
    const data = await apiFetch('/todos');
    return data.todos ?? [];
  } catch {
    return [];
  }
};

/**
 * Add a new todo
 * Called by: app/(tabs)/index.tsx — handleAddTodo()
 */
export const addTodo = async (
  text: string,
  category: string,
  priority: 'high' | 'medium' | 'low'
): Promise<Todo | null> => {
  try {
    const data = await apiFetch('/todos', {
      method: 'POST',
      body: JSON.stringify({ text, category, priority }),
    });
    return data.todo ?? null;
  } catch {
    return null;
  }
};

/**
 * Toggle a todo done/undone
 * Called by: components/TodoCard.tsx — checkbox onPress
 */
export const toggleTodo = async (id: string): Promise<Todo | null> => {
  try {
    const data = await apiFetch(`/todos/${id}/toggle`, { method: 'PATCH' });
    return data.todo ?? null;
  } catch {
    return null;
  }
};

/**
 * Update todo text
 * Called by: components/TodoCard.tsx — handleSave() in edit mode
 */
export const updateTodo = async (
  id: string,
  text: string
): Promise<Todo | null> => {
  try {
    const data = await apiFetch(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    });
    return data.todo ?? null;
  } catch {
    return null;
  }
};

/**
 * Delete a todo
 * Called by: components/TodoCard.tsx — handleDelete() after Alert confirm
 */
export const deleteTodo = async (id: string): Promise<boolean> => {
  try {
    const data = await apiFetch(`/todos/${id}`, { method: 'DELETE' });
    return data.success ?? false;
  } catch {
    return false;
  }
};

/**
 * Get stats for the profile screen
 * Called by: app/(tabs)/explore.tsx — loadData()
 */
export const getStats = async (): Promise<any> => {
  try {
    const data = await apiFetch('/todos/stats');
    return data.stats ?? null;
  } catch {
    return null;
  }
};

