import axios from 'axios'
import router from '../../router/index'
export default {
  state: {
    urlApi: process.env.VUE_APP_URL,
    user: {},
    token: localStorage.getItem('token') || null,
    keys: null,
    isLogin: false
  },
  mutations: {
    delUser(state) {
      state.user = {}
      state.token = null
      state.isLogin = false
    },
    setLoginData(state, payload) {
      state.user = payload
      state.isLogin = true
    },
    setKeys(state, payload) {
      state.keys = payload
    }
  },
  actions: {
    login(context, payload) {
      return new Promise((resolve, reject) => {
        axios
          .post(`${context.state.urlApi}user/login`, payload)
          .then(response => {
            context.commit('setLoginData', response.data.data)
            localStorage.setItem('token', response.data.data.token)
            resolve(response.data)
          })
          .catch(error => {
            if (error.response === undefined) {
              alert('Tidak dapat terhubung ke server')
            } else {
              reject(error.response)
            }
          })
      })
    },
    register(context, payload) {
      return new Promise((resolve, reject) => {
        console.log(payload)
        axios
          .post(`${context.state.urlApi}user/register`, payload)
          .then(response => {
            resolve(response)
          })
          .catch(error => {
            if (error.response === undefined) {
              alert('Tidak dapat terhubung ke server')
            } else {
              reject(error.response)
            }
          })
      })
    },
    logout(context, payload) {
      alert("You'll be redirect to login page")
      if (context.state.isLogin === true) {
        router.push('/login')
        localStorage.removeItem('token')
        context.commit('delUser')
      } else {
        return null
      }
    },
    cekEmailForgot(context, payload) {
      return new Promise((resolve, reject) => {
        axios
          .post(`${context.state.urlApi}user/forgot`, payload)
          .then(response => {
            resolve(response.data.msg)
            context.commit('setKeys', response.data.data)
            console.log(response.data)
          })
          .catch(error => {
            if (error.response === undefined) {
              alert('Tidak dapat terhubung ke server')
            } else {
              reject(error.response)
            }
          })
      })
    },
    createNewPassword(context, payload) {
      return new Promise((resolve, reject) => {
        axios
          .patch(
            `${context.state.urlApi}user/change/?keys=${context.state.keys}`,
            payload
          )
          .then(response => {
            resolve(response.data.msg)
          })
          .catch(error => {
            if (error.response === undefined) {
              alert('Tidak dapat terhubung ke server')
            } else {
              reject(error.response)
            }
          })
      })
    },
    interceptorRequest(context) {
      axios.interceptors.request.use(
        function(config) {
          config.headers.Authorization = `Bearer ${context.state.token}`
          return config
        },
        function(error) {
          return Promise.reject(error)
        }
      )
    },
    interceptorResponse(context) {
      axios.interceptors.response.use(
        function(response) {
          return response
        },
        function(error) {
          if (error.response.status === 400) {
            if (
              error.response.data.msg === 'invalid token' ||
              error.response.data.msg === 'invalid signature'
            ) {
              localStorage.removeItem('token')
              context.commit('delUser')
              router.push('/login')
              alert('Invalid Token, Relogin required')
            } else if (error.response.data.msg === 'jwt expired') {
              localStorage.removeItem('token')
              context.commit('delUser')
              router.push('/login')
              alert('Token Expired, Relogin required')
            }
          }
          return Promise.reject(error)
        }
      )
    }
  },
  getters: {
    isLogin(state) {
      return state.token !== null
    }
  }
}
