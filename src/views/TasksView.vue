<script setup>
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useFamilyStore } from '@/stores/familyStore'

const taskStore = useTaskStore()
const familyStore = useFamilyStore()

const newTitle = ref('')
const newAssignee = ref(1)
const newPoints = ref(10)

function addTask() {
  if (!newTitle.value.trim()) return
  taskStore.addTask({
    title: newTitle.value,
    assignedTo: Number(newAssignee.value),
    completed: false,
    dueDate: new Date().toISOString().split('T')[0],
    points: Number(newPoints.value)
  })
  newTitle.value = ''
}

function getMemberName(id) {
  return familyStore.members.find(m => m.id === id)?.name || 'Unassigned'
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center gap-3">
      <span class="text-4xl">✅</span>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Tasks & Chores</h1>
        <p class="text-gray-500">Siapa mengerjakan apa hari ini?</p>
      </div>
    </div>

    <!-- Add Task -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div class="flex flex-col sm:flex-row gap-2">
        <input v-model="newTitle" placeholder="Nama tugas..." class="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" @keyup.enter="addTask" />
        <select v-model="newAssignee" class="px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm">
          <option v-for="m in familyStore.members" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
        <input v-model="newPoints" type="number" min="1" class="w-20 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
        <button @click="addTask" class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">Tambah</button>
      </div>
    </div>

    <!-- Task Lists -->
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-semibold text-lg text-gray-800 mb-4">⏳ Pending ({{ taskStore.pendingTasks.length }})</h2>
        <div v-if="taskStore.pendingTasks.length === 0" class="text-gray-400 text-sm text-center py-8">Semua tugas selesai! 🎉</div>
        <ul v-else class="space-y-2">
          <li v-for="task in taskStore.pendingTasks" :key="task.id"
              class="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
            <input type="checkbox" @change="taskStore.toggleTask(task.id)" class="w-4 h-4 accent-emerald-500" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-800">{{ task.title }}</div>
              <div class="text-xs text-gray-400">{{ getMemberName(task.assignedTo) }} · {{ task.points }} pts</div>
            </div>
            <button @click="taskStore.removeTask(task.id)" class="text-gray-300 hover:text-red-500 text-sm">✕</button>
          </li>
        </ul>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-semibold text-lg text-gray-800 mb-4">✅ Selesai ({{ taskStore.completedTasks.length }})</h2>
        <div v-if="taskStore.completedTasks.length === 0" class="text-gray-400 text-sm text-center py-8">Belum ada yang selesai.</div>
        <ul v-else class="space-y-2">
          <li v-for="task in taskStore.completedTasks" :key="task.id"
              class="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100 opacity-70">
            <input type="checkbox" checked @change="taskStore.toggleTask(task.id)" class="w-4 h-4 accent-emerald-500" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-500 line-through">{{ task.title }}</div>
              <div class="text-xs text-gray-400">{{ getMemberName(task.assignedTo) }} · {{ task.points }} pts</div>
            </div>
            <button @click="taskStore.removeTask(task.id)" class="text-gray-300 hover:text-red-500 text-sm">✕</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>