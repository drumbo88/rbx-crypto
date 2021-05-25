<template>
  <v-app>
      <v-card>
        <v-toolbar color="green darken-1" >
          <v-app-bar-nav-icon @mouseover.native.stop="drawer = !drawer"></v-app-bar-nav-icon>
          <v-toolbar-title>
            <router-link to="/" custom v-slot="{ navigate }" style="cursor: pointer">
              <span @click="navigate" @keypress.enter="navigate" role="link">RBX-Crypto</span>
            </router-link>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items class="hidden-xs-only">
            <v-btn v-for="item in menuItems" :key="item.title" text router :to="item.link" >
              <v-icon left>{{ item.icon }}</v-icon>  
              {{ item.title }}
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-main is="transition" name="fade" mode="out-in">
          <keep-alive>
            <router-view />
          </keep-alive>
        </v-main>
      </v-card>
      <v-navigation-drawer
        v-model="drawer" absolute temporary
      >
        <v-list-item>
          <v-list-item-avatar>
            <v-img src="https://randomuser.me/api/portraits/men/78.jpg"></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ loggedIn ? user.name : 'Sin sesión iniciada' }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list dense>
          <v-list-item v-for="item in menuItems" :key="item.title" link router :to="item.link">
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="loggedIn" link @click="signUserOut">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>Sign Out</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
//import axios from 'axios'
import { authComputed } from './store/helpers.js'
export default {
  name: 'App',

  data: () => ({
    drawer: null,
  }),
  computed: {
    ...authComputed,
	...mapGetters('users', ['user','loggedIn']),
    menuItems () {
      if (!this.loggedIn) 
        return [
          { title: 'Sign Up', icon: 'mdi-face', link: '/users/signup' },
          { title: 'Sign In', icon: 'mdi-lock-open', link: '/users/signin' },
        ]
      return [
        { title: 'Mi billetera', icon: 'mdi-wallet', link: '/wallet' },
        { title: 'Mercado', icon: 'mdi-calendar-plus', link: '/market' },
        { title: 'Profile', icon: 'mdi-account', link: '/users/profile' },
      ]
    },
    
  },
  methods: {
    signUserOut() {
      this.$store.dispatch('users/signOut')
    }
  }

};
</script>

<style>
  .fade-enter {
    opacity: 0
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 1.5s
  }
  .fade-leave-to {
    opacity: 0
  }
</style>
