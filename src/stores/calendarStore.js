import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref([
    { id: 1, title: 'Family Dinner', date: '2026-11-15', time: '18:00', color: '#16a34a', memberId: null },
    { id: 2, title: 'Kakak Piano Lesson', date: '2026-11-16', time: '15:00', color: '#8b5cf6', memberId: 3 },
    { id: 3, title: 'Adik Soccer Practice', date: '2026-11-17', time: '16:30', color: '#f59e0b', memberId: 4 },
    { id: 4, title: 'Parents Meeting', date: '2026-11-18', time: '19:00', color: '#0ea5e9', memberId: 1 },
  ])

  const eventsByDate = computed(() => {
    const map = {}
    events.value.forEach(event => {
      if (!map[event.date]) map[event.date] = []
      map[event.date].push(event)
    })
    return map
  })

  function addEvent(event) {
    events.value.push({ ...event, id: Date.now() })
  }

  function removeEvent(id) {
    events.value = events.value.filter(e => e.id !== id)
  }

  return { events, eventsByDate, addEvent, removeEvent }
})