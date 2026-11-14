<script setup>
import { ref } from 'vue'
import { useFamilyStore } from '@/stores/familyStore'

const store = useFamilyStore()
const newMemberName = ref('')
const newMemberRole = ref('Child')
const newRuleText = ref('')

function addMember() {
  if (!newMemberName.value.trim()) return
  store.addMember({
    name: newMemberName.value,
    role: newMemberRole.value,
    avatar: newMemberRole.value === 'Parent' ? '👤' : '🧒',
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  })
  newMemberName.value = ''
}

function addRule() {
  if (!newRuleText.value.trim()) return
  store.addRule({ text: newRuleText.value, icon: '📌' })
  newRuleText.value = ''
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center gap-3">
      <span class="text-4xl">👨‍👩‍👧‍👦</span>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Family Members & Rules</h1>
        <p class="text-gray-500">Kenali anggota keluarga dan aturan rumah kita.</p>
      </div>
    </div>

    <!-- Members -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 class="font-semibold text-lg text-gray-800 mb-4">Anggota Keluarga</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="member in store.members" :key="member.id"
             class="text-center p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-200 transition-colors">
          <div class="text-4xl mb-2">{{ member.avatar }}</div>
          <div class="font-semibold text-gray-800">{{ member.name }}</div>
          <div class="text-xs text-gray-400">{{ member.role }}</div>
        </div>
      </div>

      <!-- Add Member Form -->
      <div class="mt-4 flex flex-col sm:flex-row gap-2">
        <input v-model="newMemberName" placeholder="Nama anggota..." class="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
        <select v-model="newMemberRole" class="px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm">
          <option>Parent</option>
          <option>Child</option>
        </select>
        <button @click="addMember" class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">Tambah</button>
      </div>
    </div>

    <!-- Rules -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 class="font-semibold text-lg text-gray-800 mb-4">Aturan Rumah</h2>
      <ul class="space-y-2 mb-4">
        <li v-for="rule in store.rules" :key="rule.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <span class="text-xl">{{ rule.icon }}</span>
          <span class="flex-1 text-sm text-gray-700">{{ rule.text }}</span>
          <button @click="store.removeRule(rule.id)" class="text-gray-400 hover:text-red-500 text-sm">✕</button>
        </li>
      </ul>
      <div class="flex gap-2">
        <input v-model="newRuleText" placeholder="Tambah aturan baru..." class="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" @keyup.enter="addRule" />
        <button @click="addRule" class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">Tambah</button>
      </div>
    </div>
  </div>
</template>