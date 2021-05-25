<template>
    <h1>PROFILE</h1>
</template>

<script>
import axios from 'axios'

export default {
    created() {
        axios.get('http://localhost:4000/users/profile').then(res => {
            console.log(res)
        })
        .catch(err => console.log(err))
    }
}
</script>
