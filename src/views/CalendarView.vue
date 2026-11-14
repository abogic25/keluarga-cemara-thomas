<script setup>
import { ref, computed } from 'vue'
import { useCalendarStore } from '@/stores/calendarStore'

const store = useCalendarStore()
const currentDate = ref(new Date())
const newEventTitle = ref('')
const newEventDate = ref('')
const newEventTime = ref('')

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate())
const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay())

const calendarDays = computed(() => {
  const days = []
  for (let i = 0; i < firstDayOfMonth.value; i++) days.push(null)
  for (let d = 1; d <= daysInMonth.value; d++) days.push(d)
  return days
})

function formatDate(day) {
  if (!day) return ''
  const m = String(currentMonth.value + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${currentYear.value}-${m}-${d}`
}

function prevMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

function addEvent() {
  if (!newEventTitle.value.trim() || !newEventDate.value) return
  store.addEvent({
    title: newEventTitle.value,
    date: newEventDate.value,
    time: newEventTime.value || 'All day',
    color: '#16a34a',
    memberId: null
  })
  newEventTitle.value = ''
  newEventDate.value = ''
  newEventTime.value = ''
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center gap-3">
      <span class="text-4xl">📅</span>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Family Calendar</h1>
        <p class="text-gray-500">Jadwal dan acara keluarga kita.</p>
      </div>
    </div>

    <!-- Calendar -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <button @click="prevMonth" class="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-600">←</button>
        <h2 class="font-semibold text-lg text-gray-800">{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
        <button @click="nextMonth" class="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-600">→</button>
      </div>

      <div class="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
        <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <div v-for="(day, idx) in calendarDays" :key="idx"
             class="min-h-[60px] p-1 rounded-lg text-sm"
             :class="day ? 'bg-gray-50 hover:bg-emerald-50' : ''">
          <div v-if="day" class="font-medium text-gray-700 mb-1">{{ day }}</div>
          <div v-if="day && store.eventsByDate[formatDate(day)]"
               class="space-y-0.5">
            <div v-for="event in store.eventsByDate[formatDate(day)].slice(0, 2)" :key="event.id"
                 class="text-[10px] truncate px-1 py-0.5 rounded text-white"
                 :style="{ backgroundColor: event.color }">
              {{ event.title }}
            </div>
            <div v-if="store.eventsByDate[formatDate(day)].length > 2" class="text-[10px] text-gray-400">
              +{{ store.eventsByDate[formatDate(day)].length - 2 }} lagi
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Event & List -->
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-semibold text-lg text-gray-800 mb-4">Tambah Acara</h2>
        <div class="space-y-3">
          <input v-model="newEventTitle" placeholder="Nama acara..." class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
          <div class="flex gap-2">
            <input v-model="newEventDate" type="date" class="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
            <input v-model="newEventTime" type="time" class="w-32 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
          </div>
          <button @click="addEvent" class="w-full py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">Simpan Acara</button>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-semibold text-lg text-gray-800 mb-4">Acara Mendatang</h2>
        <ul class="space-y-2 max-h-64 overflow-y-auto">
          <li v-for="event in store.events" :key="event.id"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: event.color }"></span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-800 truncate">{{ event.title }}</div>
              <div class="text-xs text-gray-400">{{ event.date }} · {{ event.time }}</div>
            </div>
            <button @click="store.removeEvent(event.id)" class="text-gray-300 hover:text-red-500 text-sm flex-shrink-0">✕</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>