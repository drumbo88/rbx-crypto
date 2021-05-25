<template>
	<v-main class="home">
		<v-row><v-col>
			<h3>{{ loggedIn ? `Logueado como ${user.name}` : 'Sin sesión iniciada' }}</h3>
		</v-col></v-row>
		<v-row><v-col>
			<component :is="view" />
		</v-col></v-row>
	</v-main>
</template>

<script>
	import Home from '@/components/Home.vue'
	import Dashboard from '@/components/Dashboard.vue'
	import { mapGetters, mapState } from 'vuex'

	export default {
		name: 'HomeView',
		components: { Home, Dashboard },
		computed: {
			...mapState('users', ['user']),
			...mapGetters('users', ['loggedIn']),
			view() {
				return this.loggedIn ? 'Dashboard' : 'Home'
			}
		}
	}
</script>
