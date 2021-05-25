import store from '@/store'

export default (action, fn) => 
{
    if ((typeof action) === 'function')
        { fn = action; action = null }
    
    if (action && store.state.promises[action])
        return store.state.promises[action]

    const promise = new Promise((res, rej) => {

        return fn()
            .then((data) => {
                return res(data)
            })
            .catch(error => {
                store.commit('SET_ERROR', error, { root: true })
                return rej(error)
            })
            .finally(() => {
                store.commit('CLEAR_PROMISE', { action }, { root: true })
            })
    })
    if (action) {
        store.commit('SET_PROMISE', { promise, action }, { root: true })
    }

    return promise
}

/*
export default (fn, { action, interval, delay, timeout }) => 
{
    if ((typeof action) === 'function')
        { fn = action; action = null }
    
    if (interval && timeout === true)
        timeout = interval
        
    const actionFn = () => {

        if (action && store.state.promises[action])
            return store.state.promises[action]

        const promise = new Promise((res, rej) => {

            const idTimeout = null
            if (timeout)
                idTimeout = setTimeout(() => rej("Espera agotada"), timeout)

            return fn()
                .then((data) => {
                    if (idTimeout)
                        clearTimeout(idTimeout)
                    return res(data)
                })
                .catch(error => {
                    store.commit('SET_ERROR', error, { root: true })
                    return rej(error)
                })
                .finally(() => {
                    store.commit('CLEAR_PROMISE', { action }, { root: true })
                })
        })
        if (action) {
            store.commit('SET_PROMISE', { promise, action }, { root: true })
        }
    }
    if (interval) {
        setInterval(actionFn, interval)
    }

    return promise
}
*/