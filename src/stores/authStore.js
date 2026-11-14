import { defineStore } from 'pinia'
import { shallowRef, ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth'
import { auth, getFirestoreDb, isFirebaseConfigured } from '@/firebase/config'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = shallowRef(null)
  const userProfile = shallowRef(null)
  const isReady = ref(!isFirebaseConfigured)
  const profileReady = ref(false)
  const authError = ref('')
  const profileSyncs = new Map()
  let resolveAuthReady

  const authReady = new Promise((resolve) => {
    resolveAuthReady = resolve
  })

  if (isFirebaseConfigured) {
    onAuthStateChanged(
      auth,
      async (user) => {
        currentUser.value = user
        userProfile.value = null
        profileReady.value = false
        authError.value = ''

        if (user) {
          try {
            await ensureUserProfile(user)
            profileReady.value = true
          } catch (error) {
            authError.value = error.message
          }
        }

        isReady.value = true
        resolveAuthReady(user)
      },
      (error) => {
        authError.value = error.message
        currentUser.value = null
        userProfile.value = null
        profileReady.value = false
        isReady.value = true
        resolveAuthReady(null)
      },
    )
  } else {
    resolveAuthReady(null)
  }

  function ensureFirebaseConfigured() {
    if (!auth) {
      throw new Error('Firebase is not configured. Add the required VITE_FIREBASE_* values to your .env file.')
    }
  }

  async function writeUserProfile(user) {
    const [{ doc, getDoc, serverTimestamp, setDoc, updateDoc }, db] = await Promise.all([
      import('firebase/firestore/lite'),
      getFirestoreDb(),
    ])
    if (!db) {
      throw new Error('Firestore is not configured.')
    }

    const userRef = doc(db, 'users', user.uid)
    const snapshot = await getDoc(userRef)
    const profileFields = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    }

    let profile
    if (snapshot.exists()) {
      await updateDoc(userRef, {
        ...profileFields,
        updatedAt: serverTimestamp(),
      })
      profile = { ...snapshot.data(), ...profileFields }
    } else {
      profile = {
        ...profileFields,
        role: 'guest',
      }
      await setDoc(userRef, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    userProfile.value = profile
    authError.value = ''
  }

  function ensureUserProfile(user) {
    const pendingSync = profileSyncs.get(user.uid)
    if (pendingSync) return pendingSync

    const sync = writeUserProfile(user)
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unknown Firestore error.'
        throw new Error(`Signed in, but could not save your user profile to Firestore: ${message}`)
      })
      .finally(() => profileSyncs.delete(user.uid))

    profileSyncs.set(user.uid, sync)
    return sync
  }

  async function retryProfileSync() {
    ensureFirebaseConfigured()
    const user = auth.currentUser
    if (!user) throw new Error('No signed-in user is available to sync.')

    currentUser.value = user
    profileReady.value = false
    await ensureUserProfile(user)
    profileReady.value = true
  }

  function waitUntilReady() {
    return authReady
  }

  async function finishAuthentication(credential) {
    currentUser.value = credential.user
    profileReady.value = false
    await ensureUserProfile(credential.user)
    profileReady.value = true
    return credential
  }

  async function registerWithEmail(email, password) {
    ensureFirebaseConfigured()
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    return finishAuthentication(credential)
  }

  async function loginWithEmail(email, password) {
    ensureFirebaseConfigured()
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return finishAuthentication(credential)
  }

  async function loginWithGoogle() {
    ensureFirebaseConfigured()
    const credential = await signInWithPopup(auth, new GoogleAuthProvider())
    return finishAuthentication(credential)
  }

  function logout() {
    ensureFirebaseConfigured()
    return signOut(auth)
  }

  return {
    currentUser,
    userProfile,
    isReady,
    profileReady,
    authError,
    waitUntilReady,
    retryProfileSync,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
  }
})
