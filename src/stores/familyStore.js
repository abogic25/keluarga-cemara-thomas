import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getFirestoreDb } from '@/firebase/config'

const MEMBERS_COLLECTION = 'members'
const RULES_COLLECTION = 'rules'

function readableError(error) {
  if (error instanceof Error && error.message.includes('permission-denied')) {
    return 'You do not have permission to perform this action.'
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}

export const useFamilyStore = defineStore('family', () => {
  const members = ref([])
  const rules = ref([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref('')
  let loadPromise = null

  const memberCount = computed(() => members.value.length)

  async function getDb() {
    const db = await getFirestoreDb()
    if (!db) throw new Error('Firestore is not configured.')
    return db
  }

  async function fetchAll() {
    const db = await getDb()
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore/lite')
    const [memberSnapshot, ruleSnapshot] = await Promise.all([
      getDocs(query(collection(db, MEMBERS_COLLECTION), orderBy('createdAt'))),
      getDocs(query(collection(db, RULES_COLLECTION), orderBy('createdAt'))),
    ])

    members.value = memberSnapshot.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }))
    rules.value = ruleSnapshot.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }))
    isLoaded.value = true
  }

  async function load(force = false) {
    if (isLoaded.value && !force) return
    if (loadPromise) return loadPromise

    isLoading.value = true
    error.value = ''
    loadPromise = fetchAll()
      .catch((loadError) => {
        error.value = readableError(loadError)
        throw loadError
      })
      .finally(() => {
        isLoading.value = false
        loadPromise = null
      })

    return loadPromise
  }

  async function addMember(member) {
    const db = await getDb()
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore/lite')
    await addDoc(collection(db, MEMBERS_COLLECTION), {
      name: member.name.trim(),
      role: member.role,
      avatar: member.avatar,
      color: member.color,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await load(true)
  }

  async function updateMember(id, changes) {
    const db = await getDb()
    const { doc, serverTimestamp, updateDoc } = await import('firebase/firestore/lite')
    await updateDoc(doc(db, MEMBERS_COLLECTION, id), {
      ...changes,
      updatedAt: serverTimestamp(),
    })
    await load(true)
  }

  async function removeMember(id) {
    const db = await getDb()
    const { deleteDoc, doc } = await import('firebase/firestore/lite')
    await deleteDoc(doc(db, MEMBERS_COLLECTION, id))
    await load(true)
  }

  async function addRule(rule) {
    const db = await getDb()
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore/lite')
    await addDoc(collection(db, RULES_COLLECTION), {
      text: rule.text.trim(),
      icon: rule.icon,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await load(true)
  }

  async function updateRule(id, changes) {
    const db = await getDb()
    const { doc, serverTimestamp, updateDoc } = await import('firebase/firestore/lite')
    await updateDoc(doc(db, RULES_COLLECTION, id), {
      ...changes,
      updatedAt: serverTimestamp(),
    })
    await load(true)
  }

  async function removeRule(id) {
    const db = await getDb()
    const { deleteDoc, doc } = await import('firebase/firestore/lite')
    await deleteDoc(doc(db, RULES_COLLECTION, id))
    await load(true)
  }

  return {
    members,
    rules,
    memberCount,
    isLoading,
    isLoaded,
    error,
    load,
    addMember,
    updateMember,
    removeMember,
    addRule,
    updateRule,
    removeRule,
  }
})
