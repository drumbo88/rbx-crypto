<template>
    <v-container>
        <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
                <v-card class="my-4">
                    <v-card-text>
                        <v-container>
                            <form @submit.prevent="signUserUp">
                                <v-layout row>
                                    <v-flex xs12>
                                        <v-text-field id="name" name="name" label="Name" v-model="name" type="name" required></v-text-field>
                                    </v-flex>
                                </v-layout>
                                <v-layout row>
                                    <v-flex xs12>
                                        <v-text-field id="email" name="email" label="Email" v-model="email" type="email" required></v-text-field>
                                    </v-flex>
                                </v-layout>
                                <v-layout row>
                                    <v-flex xs12>
                                        <v-text-field id="password" name="password" label="Password" v-model="password" type="password" required></v-text-field>
                                    </v-flex>
                                </v-layout>
                                <v-layout row>
                                    <v-flex xs12>
                                        <v-text-field id="confirmPassword" name="confirmPassword" label="Confirm Password" v-model="confirmPassword" type="password" required
                                        :rules="[comparePasswords]"></v-text-field>
                                    </v-flex>
                                </v-layout>
                                <v-layout row>
                                    <v-flex xs12>
                                        <v-btn type="submit" :disabled="loading" :loading="loading" class="primary">
                                            Sign Up
                                        </v-btn>
                                    </v-flex>
                                </v-layout>
                            </form>
                        </v-container>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
        <v-layout row v-if="hayErrores">
            <v-flex xs12 sm6 offset-sm3>
                <app-alert v-for="(error, i) in errores" :key="i" @dismissed="onDismissed" :text="error"></app-alert>
            </v-flex>
        </v-layout>
    </v-container>   
</template>

<script>
//import axios from 'axios'

export default {
  name: 'SignUp',
  data() {
    return {
      loading: false,
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      errores: {} //{1:"aaaa",2:"bbb"}
    }
  },
  methods: {
      signUserUp () {
        this.$store.dispatch('signUp', {
            name: this.name,
            email: this.email,
            password: this.password,
            confirmPassword: this.confirmPassword,
        })
        .then(() => this.$router.push({ name: 'Home' }))
        .catch((err) => {
            this.errores.push(err.message)
        })
      },
      onDismissed () {
          //this.$store.dispatch('clearError')
      },
      /*getInitData() {
        axios.get(this.API_COMPONENT_INIT)
          .then(response => {
            console.log(response)
            //axios.defaults.headers.common['x-csrf-token'] = response.data.csrfToken
          }, (err) => console.log(err))
          .then(response => (this.csrf = response.csrfToken))
      }*/
  },
  computed: {
    hayErrores () {
      return Boolean(Object.keys(this.errores).length) 
    },
    comparePasswords () {
        return this.password !== this.confirmPassword ? 'Passwords do not match' : ''
    },
  },
  mounted() {
      this.API_COMPONENT_INIT = process.env.VUE_APP_API_URL + `/users/signup`
      //this.getInitData()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
