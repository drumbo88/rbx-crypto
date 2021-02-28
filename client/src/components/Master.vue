<template>
    <v-container>
        <v-layout row wrap>
            <v-flex xs12 sm6 class="text-sm-center text-md-right">
                <v-btn large to="/meetups" class="info mx-2">Hola</v-btn>
            </v-flex>
            <v-flex xs12 sm6 class="text-sm-center text-md-left">
                <v-btn large to="/meetup/new" class="info mx-2">Chau</v-btn>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import xService from '../xService'

export default {
    name: 'Master',
    data() {
        return {
            posts: [],
            error: '',
            text: '',
        }
    },
    async created() {
        try {
            this.posts = await xService.getPosts()
        } catch (err) {
            this.error = err.message
        }
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
