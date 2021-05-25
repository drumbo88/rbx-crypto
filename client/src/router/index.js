import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/users/signup',
    name: 'Sign Up',
    component: () => import('../views/SignUp.vue')
  },
  {
    path: '/users/signin',
    name: 'Sign In',
    component: () => import('../views/SignIn.vue')
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: () => import('../views/Wallet/Dashboard.vue')
  },
  {
    path: '/users/profile',
    name: 'Profile',
    component: () => import('../views/Users/Profile.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/NotFound',
    name: 'NotFound',
    component: () => import('../views/errors/404.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
	
	if (!router.resolve(to.path).resolved.matched.length)
		return next({ name: 'NotFound' })

  const unauthPages = ['Sign Up', 'Sign In']
  const publicPages = ['Home']
  const isPublicPage = publicPages.includes(to.name)
  const isUnauthPage = unauthPages.includes(to.name)
  const isAuthPage = !isUnauthPage && !isPublicPage
  const loggedIn = localStorage.getItem('authUser')

    //if (to.matched.some(record => record.meta.requiresAuth && loggedIn)) 
	const defaultPage = 'Home'
	const authOK = isAuthPage && loggedIn
	const unauthOK = isUnauthPage && !loggedIn
	
  if (isPublicPage || authOK || unauthOK)
		next()
	else
		next({ name: defaultPage })
})

export default router
