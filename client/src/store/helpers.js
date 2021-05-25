import { mapGetters } from 'vuex'

export const authComputed = {
    ...mapGetters(['users/loggedIn'])
}