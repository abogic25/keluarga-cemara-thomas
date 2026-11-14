<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useFamilyStore } from '@/stores/familyStore'

const authStore = useAuthStore()
const store = useFamilyStore()

const memberName = ref('')
const memberRole = ref('Child')
const editingMemberId = ref(null)
const ruleText = ref('')
const editingRuleId = ref(null)
const memberError = ref('')
const ruleError = ref('')
const isSavingMember = ref(false)
const isSavingRule = ref(false)

const canManageMembers = computed(() => authStore.canManageMembers)
const canManageRules = computed(() => authStore.canManageRules)

onMounted(() => {
  store.load().catch(() => {})
})

function errorMessage(error) {
  return error instanceof Error ? error.message : 'Something went wrong.'
}

function resetMemberForm() {
  memberName.value = ''
  memberRole.value = 'Child'
  editingMemberId.value = null
}

function editMember(member) {
  editingMemberId.value = member.id
  memberName.value = member.name
  memberRole.value = member.role
  memberError.value = ''
}

async function saveMember() {
  if (!canManageMembers.value) return
  const name = memberName.value.trim()
  if (!name) return

  isSavingMember.value = true
  memberError.value = ''

  try {
    if (editingMemberId.value) {
      await store.updateMember(editingMemberId.value, { name, role: memberRole.value })
    } else {
      await store.addMember({
        name,
        role: memberRole.value,
        avatar: memberRole.value === 'Parent' ? '👤' : '🧒',
        color: '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'),
      })
    }
    resetMemberForm()
  } catch (error) {
    memberError.value = errorMessage(error)
  } finally {
    isSavingMember.value = false
  }
}

async function deleteMember(member) {
  if (!canManageMembers.value) return
  if (!window.confirm(`Hapus ${member.name} dari anggota keluarga?`)) return

  memberError.value = ''
  try {
    await store.removeMember(member.id)
    if (editingMemberId.value === member.id) resetMemberForm()
  } catch (error) {
    memberError.value = errorMessage(error)
  }
}

function resetRuleForm() {
  ruleText.value = ''
  editingRuleId.value = null
}

function editRule(rule) {
  editingRuleId.value = rule.id
  ruleText.value = rule.text
  ruleError.value = ''
}

async function saveRule() {
  if (!canManageRules.value) return
  const text = ruleText.value.trim()
  if (!text) return

  isSavingRule.value = true
  ruleError.value = ''

  try {
    if (editingRuleId.value) {
      await store.updateRule(editingRuleId.value, { text })
    } else {
      await store.addRule({ text, icon: '📌' })
    }
    resetRuleForm()
  } catch (error) {
    ruleError.value = errorMessage(error)
  } finally {
    isSavingRule.value = false
  }
}

async function deleteRule(rule) {
  if (!canManageRules.value) return
  if (!window.confirm('Hapus aturan ini?')) return

  ruleError.value = ''
  try {
    await store.removeRule(rule.id)
    if (editingRuleId.value === rule.id) resetRuleForm()
  } catch (error) {
    ruleError.value = errorMessage(error)
  }
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

    <p v-if="store.error" role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {{ store.error }}
    </p>

    <!-- Members -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="font-semibold text-lg text-gray-800">Anggota Keluarga</h2>
        <span class="text-xs text-gray-400">Hanya admin yang dapat mengelola anggota</span>
      </div>

      <p v-if="store.isLoading && !store.isLoaded" class="text-sm text-gray-400">Memuat anggota…</p>
      <p v-else-if="store.members.length === 0" class="text-sm text-gray-400">Belum ada anggota keluarga.</p>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="member in store.members" :key="member.id"
             class="text-center p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-200 transition-colors">
          <div class="text-4xl mb-2">{{ member.avatar }}</div>
          <div class="font-semibold text-gray-800">{{ member.name }}</div>
          <div class="text-xs text-gray-400">{{ member.role }}</div>
          <div v-if="canManageMembers" class="mt-3 flex justify-center gap-2">
            <button type="button"
                    class="rounded px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                    @click="editMember(member)">Edit</button>
            <button type="button"
                    class="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    @click="deleteMember(member)">Hapus</button>
          </div>
        </div>
      </div>

      <p v-if="memberError" role="alert" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
        {{ memberError }}
      </p>

      <!-- Add / edit member form -->
      <div v-if="canManageMembers" class="mt-4 flex flex-col sm:flex-row gap-2">
        <input v-model="memberName" :placeholder="editingMemberId ? 'Nama anggota...' : 'Nama anggota baru...'"
               class="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm"
               @keyup.enter="saveMember" />
        <select v-model="memberRole" class="px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm">
          <option>Parent</option>
          <option>Child</option>
        </select>
        <button type="button" :disabled="isSavingMember"
                class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-60 transition-colors text-sm font-medium"
                @click="saveMember">
          {{ isSavingMember ? 'Menyimpan…' : editingMemberId ? 'Simpan' : 'Tambah' }}
        </button>
        <button v-if="editingMemberId" type="button"
                class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                @click="resetMemberForm">Batal</button>
      </div>
    </div>

    <!-- Rules -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="font-semibold text-lg text-gray-800">Aturan Rumah</h2>
        <span class="text-xs text-gray-400">Hanya admin &amp; parent yang dapat mengelola aturan</span>
      </div>

      <p v-if="store.isLoading && !store.isLoaded" class="text-sm text-gray-400">Memuat aturan…</p>
      <p v-else-if="store.rules.length === 0" class="text-sm text-gray-400">Belum ada aturan rumah.</p>

      <ul v-else class="space-y-2 mb-4">
        <li v-for="rule in store.rules" :key="rule.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <span class="text-xl">{{ rule.icon }}</span>
          <span class="flex-1 text-sm text-gray-700">{{ rule.text }}</span>
          <template v-if="canManageRules">
            <button type="button" class="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                    @click="editRule(rule)">Edit</button>
            <button type="button" class="text-gray-400 hover:text-red-500 text-sm"
                    @click="deleteRule(rule)">✕</button>
          </template>
        </li>
      </ul>

      <p v-if="ruleError" role="alert" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
        {{ ruleError }}
      </p>

      <div v-if="canManageRules" class="flex flex-col sm:flex-row gap-2">
        <input v-model="ruleText" :placeholder="editingRuleId ? 'Ubah aturan...' : 'Tambah aturan baru...'"
               class="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm"
               @keyup.enter="saveRule" />
        <button type="button" :disabled="isSavingRule"
                class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-60 transition-colors text-sm font-medium"
                @click="saveRule">
          {{ isSavingRule ? 'Menyimpan…' : editingRuleId ? 'Simpan' : 'Tambah' }}
        </button>
        <button v-if="editingRuleId" type="button"
                class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                @click="resetRuleForm">Batal</button>
      </div>
    </div>
  </div>
</template>
