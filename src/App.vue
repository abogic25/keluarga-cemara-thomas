<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const isMenuOpen = ref(false)
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const signOutError = ref('')

const navItems = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/members', label: 'Family & Rules', icon: '👨‍👩‍👧‍👦' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/shopping', label: 'Shopping', icon: '🛒' },
]

async function signOut() {
  signOutError.value = ''
  try {
    await authStore.logout()
    await router.replace({ name: 'auth' })
  } catch (error) {
    signOutError.value = error instanceof Error ? error.message : 'Could not sign out.'
  }
}
</script>

<template>
  <RouterView v-if="route.name === 'auth'" />

  <div v-else class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <RouterLink to="/" class="flex items-center gap-2">
            <span class="text-2xl">🌳</span>
            <span class="font-bold text-xl text-emerald-700 hidden sm:block">Keluarga Cemara</span>
          </RouterLink>

          <!-- Desktop Nav -->
          <nav class="hidden lg:flex items-center gap-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              :class="$route.path === item.path
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
            >
              <span class="mr-1">{{ item.icon }}</span>
              {{ item.label }}
            </RouterLink>
          </nav>

          <div class="hidden items-center gap-3 lg:flex">
            <span class="max-w-40 truncate text-xs text-gray-500">{{ authStore.currentUser?.email }}</span>
            <button
              class="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              @click="signOut"
            >
              Sign out
            </button>
          </div>

          <!-- Mobile menu button -->
          <button
            @click="isMenuOpen = !isMenuOpen"
            class="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Nav -->
      <div v-if="isMenuOpen" class="lg:hidden border-t border-gray-100 bg-white">
        <div class="px-4 py-2 space-y-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            @click="isMenuOpen = false"
            class="block px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            :class="$route.path === item.path
              ? 'bg-emerald-100 text-emerald-800'
              : 'text-gray-600 hover:bg-gray-100'"
          >
            <span class="mr-2">{{ item.icon }}</span>
            {{ item.label }}
          </RouterLink>
          <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span class="truncate text-xs text-gray-500">{{ authStore.currentUser?.email }}</span>
            <button class="text-sm font-medium text-emerald-700" @click="signOut">Sign out</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <p v-if="signOutError" role="alert" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
        {{ signOutError }}
      </p>
      <RouterView />
    </main>
  </div>
</template>