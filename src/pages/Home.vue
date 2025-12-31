<script setup>
import { onMounted, ref } from 'vue'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

const isLoading = ref(true)
const loadError = ref('')
const quizzes = ref([])

async function loadQuizzes() {
	isLoading.value = true
	loadError.value = ''
	try {
		const quizzesQuery = query(collection(db, 'quizzes'), orderBy('title'))
		const snapshot = await getDocs(quizzesQuery)
		quizzes.value = snapshot.docs.map((doc) => ({
			id: doc.id,
			...(doc.data() ?? {})
		}))
	} catch (err) {
		loadError.value = String(err)
	} finally {
		isLoading.value = false
	}
}

onMounted(loadQuizzes)
</script>

<template>
	<section>
		<div style="display:flex; align-items:baseline; gap: 1rem; margin:0 0 1rem 0;">
			<h1 style="margin:0;">Quizzes</h1>
			<RouterLink to="/new-quiz">New Quiz</RouterLink>
		</div>
		<p v-if="isLoading">Loading quizzes…</p>
		<p v-else-if="loadError" style="color:#c00">Failed to load: {{ loadError }}</p>
		<ul v-else>
			<li v-for="quiz in quizzes" :key="quiz.id">
				{{ quiz.title || 'Untitled quiz' }}
			</li>
		</ul>
	</section>
	<!-- In the future we can link to /quiz/:id once routes exist -->
</template>

<style scoped>
ul {
	list-style: disc;
	padding-left: 1.25rem;
}
li {
	margin: 0.25rem 0;
}
</style>


