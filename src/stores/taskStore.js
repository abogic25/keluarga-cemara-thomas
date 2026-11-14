import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([
    { id: 1, title: 'Clean living room', assignedTo: 3, completed: false, dueDate: '2026-11-15', points: 10 },
    { id: 2, title: 'Wash dishes', assignedTo: 4, completed: false, dueDate: '2026-11-15', points: 5 },
    { id: 3, title: 'Grocery shopping', assignedTo: 1, completed: true, dueDate: '2026-11-14', points: 15 },
    { id: 4, title: 'Water plants', assignedTo: 2, completed: false, dueDate: '2026-11-16', points: 5 },
  ])

  const pendingTasks = computed(() => tasks.value.filter(t => !t.completed))
  const completedTasks = computed(() => tasks.value.filter(t => t.completed))

  function addTask(task) {
    tasks.value.push({ ...task, id: Date.now() })
  }

  function toggleTask(id) {
    const task = tasks.value.find(t => t.id === id)
    if (task) task.completed = !task.completed
  }

  function removeTask(id) {
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  return { tasks, pendingTasks, completedTasks, addTask, toggleTask, removeTask }
})