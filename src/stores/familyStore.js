import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFamilyStore = defineStore('family', () => {
  const members = ref([
    { id: 1, name: 'Ayah', role: 'Parent', avatar: '👨', color: '#3b82f6' },
    { id: 2, name: 'Ibu', role: 'Parent', avatar: '👩', color: '#ec4899' },
    { id: 3, name: 'Kakak', role: 'Child', avatar: '👧', color: '#8b5cf6' },
    { id: 4, name: 'Adik', role: 'Child', avatar: '👦', color: '#f59e0b' },
  ])

  const rules = ref([
    { id: 1, text: 'No screen time after 8 PM', icon: '📵' },
    { id: 2, text: 'Homework before play', icon: '📚' },
    { id: 3, text: 'Help with dishes after dinner', icon: '🍽️' },
    { id: 4, text: 'Family meeting every Sunday', icon: '👨‍👩‍👧‍👦' },
  ])

  const memberCount = computed(() => members.value.length)

  function addMember(member) {
    members.value.push({ ...member, id: Date.now() })
  }

  function addRule(rule) {
    rules.value.push({ ...rule, id: Date.now() })
  }

  function removeRule(id) {
    rules.value = rules.value.filter(r => r.id !== id)
  }

  return { members, rules, memberCount, addMember, addRule, removeRule }
})