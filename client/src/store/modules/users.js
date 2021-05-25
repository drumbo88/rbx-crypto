import authService from '@/services/AuthService';
import useCommiter from '@/composables/use-commiter';

export const namespaced = true

export const state = {
    user: null
}

export const actions = {
    signUp ({commit}, payload) 
    {
        return useCommiter(
            () => authService.signIn({ payload }).then(res => {
                let user = res.data.user
                user.authToken = res.data.authToken
                commit('SET_USER', user)
            })
        )
    },
    signIn ({commit}, payload) 
    {
        commit('SET_LOADING', true, { root: true })
        commit('CLEAR_ERROR', null, { root: true })
        //const url = process.env.VUE_APP_API_URL + '/auth/signin'

        return authService.signIn({ payload }).then(res => {
            if (!res.data.error) {
                let user = res.data.user
                user.authToken = res.data.authToken
                commit('SET_USER', user)
                location.reload()
            }
            return res
        })
        .catch(error => {
            commit('SET_ERROR', error, { root: true })
        })
        .finally(() => {
            commit('SET_LOADING', false, { root: true })
        })
    },
    signOut ({commit, state}, askConfirm) {
        if (!askConfirm && askConfirm !== false)
            askConfirm = true
        if (askConfirm && (!state.user || confirm(`${state.user.name}, ¿Desea cerrar su sesión?`)))
            commit('CLEAR_USER')
    },
    autoSignIn ({commit}, payload) {
        commit('SET_USER', { id: payload.uid })
    },
}

export const mutations = {
    SET_USER (state, user) {
        state.user = user
        localStorage.setItem('authUser', JSON.stringify(user))
        //axios.defaults.headers.common['auth-token'] = `Bearer ${user.authToken}`
    },
    CLEAR_USER() {
        localStorage.removeItem('authUser')
        location.reload()
    },
}

export const getters = {
    user (state) { return state.user },
    loggedIn (state) { return state.user && state.user.authToken },
}