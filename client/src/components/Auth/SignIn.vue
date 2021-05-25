<template>
    <v-container>
        <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
                <v-card class="my-4">
                    <v-card-text>
                        <v-container>
                            <form @submit.prevent="signUserIn">
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
                                        <v-btn type="submit" :disabled="loading" :loading="loading" class="primary">
                                            Sign In
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
    import { mapGetters } from 'vuex'
    export default {
        data() {
            return {
                email: '',
                password: '',
                errores: {}
            }
        },
        methods: {
            signUserIn() {
                this.$store.dispatch('users/signIn', {
                    email: this.email,
                    password: this.password,
                })
                .then(() => {
                    if (this.loggedIn)
                        location.reload() //this.$router.push({ name: 'Home' })
                })
            }
        },
        computed: {
            ...mapGetters(['loading']),
            ...mapGetters('users', ['loggedIn']),
            hayErrores () {
                return Boolean(Object.keys(this.errores).length) 
            },
        }
    }
</script>
