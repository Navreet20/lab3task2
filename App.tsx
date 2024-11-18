import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define an interface for the task structure
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function App() {
  const [task, setTask] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null); // Track the task being edited
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initialize fade animation

  // Load tasks from AsyncStorage when the app starts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error('Failed to load tasks from AsyncStorage:', error);
      }
    };

    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever the tasks list changes
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks to AsyncStorage:', error);
      }
    };

    saveTasks();
  }, [tasks]);

  const addTask = () => {
    if (task.trim()) {
      const newTask = { id: Date.now().toString(), text: task, completed: false };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setTask('');

      // Trigger the fade-in animation
      fadeAnim.setValue(0); // Reset animation value
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((item) => item.id !== taskId));
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Edit task function
  const editTask = (taskId: string, newText: string) => {
    setTasks(
      tasks.map((item) =>
        item.id === taskId ? { ...item, text: newText } : item
      )
    );
    setEditingTaskId(null); // Reset editing state after saving the changes
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text: string) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={({ item }: { item: Task }) => (
          <Animated.View style={[styles.taskContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => toggleTaskCompletion(item.id)}
            >
              <Text
                style={[
                  styles.taskText,
                  item.completed && styles.completedTaskText, // Conditional styling
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>

            {/* Edit button */}
            <TouchableOpacity onPress={() => setEditingTaskId(item.id)}>
              <Text style={styles.deleteButton}>Edit</Text>
            </TouchableOpacity>

            {/* Delete button */}
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButton}>X</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* UI for editing task */}
      {editingTaskId && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={task}
            onChangeText={(text: string) => setTask(text)}
            placeholder="Edit your task"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => editTask(editingTaskId, task)}
          >
            <Text style={styles.addButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTaskText: {
    textDecorationLine: 'line-through', // Strikethrough for completed tasks
    color: '#999', // Lighter color for completed tasks
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
