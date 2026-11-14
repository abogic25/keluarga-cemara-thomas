import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useShoppingStore = defineStore('shopping', () => {
  const items = ref([
    { id: 1, name: 'Milk', quantity: '2 cartons', category: 'Dairy', bought: false },
    { id: 2, name: 'Eggs', quantity: '1 dozen', category: 'Dairy', bought: true },
    { id: 3, name: 'Rice', quantity: '5 kg', category: 'Grains', bought: false },
    { id: 4, name: 'Vegetables', quantity: 'Mixed bag', category: 'Produce', bought: false },
    { id: 5, name: 'Chicken', quantity: '1 kg', category: 'Meat', bought: false },
  ])

  const pendingItems = computed(() => items.value.filter(i => !i.bought))
  const boughtItems = computed(() => items.value.filter(i => i.bought))

  function addItem(item) {
    items.value.push({ ...item, id: Date.now(), bought: false })
  }

  function toggleItem(id) {
    const item = items.value.find(i => i.id === id)
    if (item) item.bought = !item.bought
  }

  function removeItem(id) {
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, pendingItems, boughtItems, addItem, toggleItem, removeItem }
})