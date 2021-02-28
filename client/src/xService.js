import axios from 'axios'

const url = 'http://localhost:5000/api/posts'

class xService {
    // Get
    static getPosts() {
        return new Promise((resolve, reject) => {
            try {
                const res = axios.get(url)
                const data = res.data
                resolve(
                    data.map(post => ({
                        ...post,
                        createdAt: new Date(post.createdAt)
                    }))
                )
            } catch (err) {
                reject(err)
            }
        })
    }

    // Create 
    static insertPost(text) {
        return axios.post(url, {
            text
        })
    }
    // Delete
    static deletePost(id) {
        return axios.delete(`${url}${id}`)
    }
}

export default xService