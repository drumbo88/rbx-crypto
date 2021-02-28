import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
let firebase = null

export const store = new Vuex.Store({
    state: {
        prices: [],
        balance: [],
        loadedMeetups: [],
        user: null,
        loading: false,
        error: null,
    },
    actions: {
        async loadPrices ({commit}) {
            commit('SET_LOADING', true)
            await firebase.database().ref('meetups').once('value')
                .then(data => {
                    const meetups = []
                    const obj = data.val() // { key1: {}, key2: {} ...}
                    for (let key in obj) {
                        meetups.push({
                            id: key,
                            title: obj[key].title,
                            description: obj[key].description,
                            imageUrl: obj[key].imageUrl,
                            date: obj[key].date,
                            location: obj[key].location,
                            creatorId: obj[key].creatorId,
                        })
                    }
                    commit('setLoadedMeetups', meetups)
                    commit('SET_LOADING', false)
                })
                .catch(error => {
                    console.log(error)
                    commit('SET_LOADING', false)
                })
        },
        createMeetup ({commit, getters}, payload) {
            const meetup = {
                title: payload.title,
                location: payload.location,
                //imageUrl: payload.imageUrl,
                description: payload.description,
                date: payload.date.toISOString(),
                creatorId: getters.user.id,
            }
            let key
            let storage
            firebase.database().ref('meetups').push(meetup)
                .then(data => {
                    key = data.key
                    //commit('createMeetup', {...meetup, id: data.key })
                    return key
                })
                .then(key => {
                    const filename = payload.image.name
                    const ext = filename.slice(filename.lastIndexOf('.') + 1)
                    storage = firebase.storage().ref('meetups/' + key + '.' + ext)
                    const uploadTask = storage.put(payload.image)
                    uploadTask.on('state_changed', snapshot => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                          case firebase.storage.TaskState.PAUSED: // or 'paused'
                            console.log('Upload is paused');
                            break;
                          case firebase.storage.TaskState.RUNNING: // or 'running'
                            console.log('Upload is running');
                            break;
                        }                        
                    }, error => {
                        console.log(error)
                    }, () => {
                        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                            firebase.database().ref('meetups').child(key).update({ imageUrl: downloadURL })
                            .then(() => {
                                commit('createMeetup', {...meetup, imageUrl: downloadURL, id: key })
                            })
                        }).catch(error => console.log(error));
                    })
                })
                /*.then(fileData => {
                    return fileData.ref.getDownloadURL() //fileData.metadata.getDownloadURL() //.metadata.downloadURLs[0]
                        .then(function(downloadURL) {
                            return firebase.database().ref('meetups').child(key).update({ imageUrl: downloadURL })
                        });
                })
                .then((data) => {
                    commit('createMeetup', {...meetup, imageUrl: imageUrl, id: data.key })
                })*/
                .catch(error => {
                    console.log(error)
                })
        },
        updateMeetupData({commit}, payload) {
            commit('SET_LOADING', true)
            const updateObj = {}
            if (payload.title) {
                updateObj.title = payload.title
            }
            if (payload.description) {
                updateObj.description = payload.description
            }
            if (payload.date) {
                updateObj.date = payload.date
            }
            firebase.database().ref('meetups').child(payload.id).update(updateObj)
            .then(() => {
                commit('SET_LOADING', false)
                commit('updateMeettup', payload)
            })
            .catch(error  => {
                console.log(error)
                commit('SET_LOADING', false)
            })
        },
        signUserUp ({commit}, payload) {
            commit('SET_LOADING', true)
            commit('clearError')
            firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
                .then(user => {
                    const newUser = {
                        id: user.uid,
                        registeredMeetups: [],
                    }
                    commit('setUser', newUser)
                    commit('SET_LOADING', false)
                })
                .catch(error => {
                    commit('setError', error)
                    commit('SET_LOADING', false)
                    console.log(error)
                })
        },
        signUserIn ({commit}, payload) {
            commit('SET_LOADING', true)
            commit('clearError')
            firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
                .then(
                    user => {
                        const newUser = {
                            id: user.id,
                            registeredMeetups: []
                        }
                        commit('setUser', newUser)
                        commit('SET_LOADING', false)
                    }
                )
                .catch(error => {
                    commit('setError', error)
                    commit('SET_LOADING', false)
                    console.log(error)
                })
        },
        autoSignIn ({commit}, payload) {
            commit('setUser', { id: payload.uid, registeredMeetups: [] })
        },
        clearError ({commit}) {
            commit('clearError')
        },
    },    
    mutations: {
        setLoadedMeetups (state, payload) {
            state.loadedMeetups = payload
        },
        createMeetup(state, payload) {
            state.loadedMeetups.push(payload)
        },
        updateMeetup(state, payload) {
            const meetup = state.loadedMeetups.find(meetup => meetup.id == payload.id)
            if (payload.title) 
                meetup.title = payload.title
            if (payload.description) 
                meetup.description = payload.description
            if (payload.date) 
                meetup.date = payload.date
            state.loadedMeetups.push(payload)
        },
        setUser (state, payload) {
            state.user = payload
        },
        SET_LOADING (state, payload) {
            state.loading = payload
        },
        setError (state, payload) {
            state.error = payload
        },
        clearError (state) {
            state.error = null
        },
    },
    getters: {
        loadedMeetups (state) {
            return state.loadedMeetups.sort((A,B) => A.date > B.date)
        },
        featuredMeetups(state, getters) {
            return getters.loadedMeetups.slice(0, 5)
        },
        loadedMeetup (state) {
            return (meetupId) => state.loadedMeetups.find((meetup) => meetup.id === meetupId)
        },
        user (state) { return state.user },
        loading (state) { return state.loading },
        error (state) { return state.error },
    }
})