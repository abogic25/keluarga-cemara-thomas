<script setup>
import { useFamilyStore } from '@/stores/familyStore'
import { useTaskStore } from '@/stores/taskStore'
import { useShoppingStore } from '@/stores/shoppingStore'
import { useCalendarStore } from '@/stores/calendarStore'

const familyStore = useFamilyStore()
const taskStore = useTaskStore()
const shoppingStore = useShoppingStore()
const calendarStore = useCalendarStore()

const today = new Date().toISOString().split('T')[0]
const todayEvents = calendarStore.events.filter(e => e.date === today)
</script>

<template>
  <div class="space-y-8">
    <!-- Hero -->
    <div class="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 md:p-8 text-white shadow-lg">
      <h1 class="text-2xl md:text-3xl font-bold mb-2">Selamat datang di Keluarga Cemara! 🌳</h1>
      <p class="text-emerald-100">Mari kelola keluarga kita dengan lebih menyenangkan.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="text-3xl mb-1">👨‍👩‍👧‍👦</div>
        <div class="text-2xl font-bold text-gray-800">{{ familyStore.memberCount }}</div>
        <div class="text-sm text-gray-500">Anggota</div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="text-3xl mb-1">✅</div>
        <div class="text-2xl font-bold text-gray-800">{{ taskStore.pendingTasks.length }}</div>
        <div class="text-sm text-gray-500">Tugas Pending</div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="text-3xl mb-1">🛒</div>
        <div class="text-2xl font-bold text-gray-800">{{ shoppingStore.pendingItems.length }}</div>
        <div class="text-sm text-gray-500">Belanja</div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="text-3xl mb-1">📅</div>
        <div class="text-2xl font-bold text-gray-800">{{ todayEvents.length }}</div>
        <div class="text-sm text-gray-500">Acara Hari Ini</div>
      </div>
    </div>

    <!-- Quick Preview -->
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-semibold text-lg text-gray-800 mb-4">📋 Tugas Mendatang</h2>
        <div v-if="taskStore.pendingTasks.length === 0" class="text-gray-400 text-sm">Semua tugas selesai! 🎉</div>
        <ul v-else class="space-y-2">
          <li v-for="task in taskStore.pendingTasks.slice(0, 4)" :key="task.id"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span class="text-sm text-gray-700 flex-1">{{ task.title }}</span>
            <span class="text-xs text-gray-400">{{ task.points }} pts</span>
          </li>
        </ul>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-semibold text-lg text-gray-800 mb-4">🛒 Perlu Dibeli</h2>
        <div v-if="shoppingStore.pendingItems.length === 0" class="text-gray-400 text-sm">Semua sudah dibeli! 👍</div>
        <ul v-else class="space-y-2">
          <li v-for="item in shoppingStore.pendingItems.slice(0, 4)" :key="item.id"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <span class="w-2 h-2 rounded-full bg-sky-400"></span>
            <span class="text-sm text-gray-700 flex-1">{{ item.name }}</span>
            <span class="text-xs text-gray-400">{{ item.quantity }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>