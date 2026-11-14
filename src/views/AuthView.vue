<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isFirebaseConfigured, missingFirebaseConfig } from '@/firebase/config'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const isRegistering = ref(false)
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

function firebaseErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'An account already exists for this email. Try signing in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/invalid-credential': 'That email and password combination is incorrect.',
    'auth/invalid-login-credentials': 'That email and password combination is incorrect.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed before finishing.',
    'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.',
    'auth/unauthorized-domain': 'This website domain is not authorized in your Firebase project.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Authentication.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
  }

  return messages[error.code] || error.message || 'Authentication failed. Please try again.'
}

function destinationAfterLogin() {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/'
}

async function submitEmailForm() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    if (isRegistering.value) {
      await authStore.registerWithEmail(email.value.trim(), password.value)
    } else {
      await authStore.loginWithEmail(email.value.trim(), password.value)
    }
    await router.replace(destinationAfterLogin())
  } catch (error) {
    errorMessage.value = firebaseErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

async function submitGoogle() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await authStore.loginWithGoogle()
    await router.replace(destinationAfterLogin())
  } catch (error) {
    errorMessage.value = firebaseErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

async function retryProfileSave() {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await authStore.retryProfileSync()
    await router.replace(destinationAfterLogin())
  } catch (error) {
    errorMessage.value = firebaseErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4 py-10">
    <section class="w-full max-w-md">
      <RouterLink to="/" class="mb-8 flex items-center justify-center gap-2 text-emerald-800">
        <span class="text-3xl" aria-hidden="true">🌳</span>
        <span class="text-xl font-bold">Keluarga Cemara</span>
      </RouterLink>

      <div class="rounded-2xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-900/5 sm:p-8">
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isRegistering ? 'Create your account' : 'Welcome back' }}
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            {{ isRegistering ? 'Start organizing your family together.' : 'Sign in to continue to your family dashboard.' }}
          </p>
        </div>

        <div
          v-if="!isFirebaseConfigured"
          role="alert"
          class="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          Firebase is not configured. Add these values to your <code>.env</code> file and restart the dev server:
          <ul class="mt-2 list-inside list-disc font-mono text-xs">
            <li v-for="key in missingFirebaseConfig" :key="key">{{ key }}</li>
          </ul>
        </div>
        <p
          v-else-if="authStore.authError"
          role="alert"
          class="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          Could not initialize your session or save your Firestore profile: {{ authStore.authError }}
        </p>
        <button
          v-if="authStore.currentUser && !authStore.profileReady"
          type="button"
          class="mb-5 w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          :disabled="isSubmitting"
          @click="retryProfileSave"
        >
          Retry saving profile
        </button>

        <p
          v-if="errorMessage"
          role="alert"
          class="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {{ errorMessage }}
        </p>

        <button
          type="button"
          class="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!isFirebaseConfigured || isSubmitting"
          @click="submitGoogle"
        >
          <span class="text-base font-bold text-blue-600" aria-hidden="true">G</span>
          Continue with Google
        </button>

        <div class="my-5 flex items-center gap-3 text-xs text-gray-400">
          <span class="h-px flex-1 bg-gray-200"></span>
          OR CONTINUE WITH EMAIL
          <span class="h-px flex-1 bg-gray-200"></span>
        </div>

        <form class="space-y-4" @submit.prevent="submitEmailForm">
          <div>
            <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
              class="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              :autocomplete="isRegistering ? 'new-password' : 'current-password'"
              :minlength="isRegistering ? 6 : undefined"
              required
              placeholder="At least 6 characters"
              class="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            type="submit"
            class="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!isFirebaseConfigured || isSubmitting"
          >
            {{ isSubmitting ? 'Please wait…' : isRegistering ? 'Create account' : 'Sign in' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          {{ isRegistering ? 'Already have an account?' : 'New to Keluarga Cemara?' }}
          <button
            type="button"
            class="ml-1 font-semibold text-emerald-700 hover:text-emerald-800"
            @click="isRegistering = !isRegistering; errorMessage = ''"
          >
            {{ isRegistering ? 'Sign in' : 'Create an account' }}
          </button>
        </p>
      </div>
    </section>
  </main>
</template>
