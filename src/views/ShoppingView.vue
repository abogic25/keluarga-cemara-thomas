<script setup>
import { ref } from 'vue'
import { useShoppingStore } from '@/stores/shoppingStore'

const store = useShoppingStore()
const newName = ref('')
const newQuantity = ref('')
const newCategory = ref('Produce')

function addItem() {
  if (!newName.value.trim()) return
  store.addItem({
    name: newName.value,
    quantity: newQuantity.value || '1',
    category: newCategory.value
  })
  newName.value = ''
  newQuantity.value = ''
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center gap-3">
      <span class="text-4xl">🛒</span>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Shopping Lists</h1>
        <p class="text-gray-500">Daftar belanja keluarga.</p>
      </div>
    </div>

    <!-- Add Item -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div class="flex flex-col sm:flex-row gap-2">
        <input v-model="newName" placeholder="Nama barang..." class="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" @keyup.enter="addItem" />
        <input v-model="newQuantity" placeholder="Jumlah..." class="w-full sm:w-32 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
        <select v-model="newCategory" class="px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none text-sm">
          <option>Produce</option>
          <option>Dairy</option>
          <option>Meat</option>
          <option>Grains</option>
          <option>Snacks</option>
          <option>Other</option>
        </select>
        <button @click="addItem" class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">Tambah</button>
      </div>
    </div>

    <!-- Lists -->
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-semibold text-lg text-gray-800 mb-4">📝 Perlu Dibeli ({{ store.pendingItems.length }})</h2>
        <div v-if="store.pendingItems.length === 0" class="text-gray-400 text-sm text-center py-8">Semua sudah dibeli! 👍</div>
        <ul v-else class="space-y-2">
          <li v-for="item in store.pendingItems" :key="item.id"
              class="flex items-center gap-3 p-3 rounded-lg bg-sky-50 border border-sky-100">
            <input type="checkbox" @change="store.toggleItem(item.id)" class="w-4 h-4 accent-emerald-500" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-800">{{ item.name }}</div>
              <div class="text-xs text-gray-400">{{ item.quantity }} · {{ item.category }}</div>
            </div>
            <button @click="store.removeItem(item.id)" class="text-gray-300 hover:text-red-500 text-sm">✕</button>
          </li>
        </ul>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-semibold text-lg text-gray-800 mb-4">✅ Sudah Dibeli ({{ store.boughtItems.length }})</h2>
        <div v-if="store.boughtItems.length === 0" class="text-gray-400 text-sm text-center py-8">Belum ada yang dibeli.</div>
        <ul v-else class="space-y-2">
          <li v-for="item in store.boughtItems" :key="item.id"
              class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 opacity-60">
            <input type="checkbox" checked @change="store.toggleItem(item.id)" class="w-4 h-4 accent-emerald-500" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-500 line-through">{{ item.name }}</div>
              <div class="text-xs text-gray-400">{{ item.quantity }} · {{ item.category }}</div>
            </div>
            <button @click="store.removeItem(item.id)" class="text-gray-300 hover:text-red-500 text-sm">✕</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>