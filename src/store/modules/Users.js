import Vue from 'vue'
import UserApi from '../../services/api/User'

export default {
  namespaced: true,

  state: {
    users: [],
    loaded: false
  },

  getters: {
    getUsers: state => {
      return state.users
    },

    getOrderedUsers: state => {
      return state.users.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', {ignorePunctuation: true})
      )
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.users = payload
    },

    create: (state, payload) => {
      state.users.push(payload)
    },

    update: (state, payload) => {
      const index = state.users.findIndex(user =>
        user.id === payload.id
      )

      Vue.set(state.users, index, payload)
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.users = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.users.toArray()
    },

    getAllFromAPI: () => {
      return UserApi.getUsers()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      return context.dispatch('getAllFromDb').then(users => {
        context.commit('setAll', users)
        context.commit('setLoaded')
      })
    },

    create: (context, user) => {
      const db = context.rootState.db

      user.school_id = context.rootState.school_id

      return UserApi.createUser(user).then(response => {
        user = {...user}
        user.id = response.id
        user.updated_at = response.created_at
        user.updated_at = response.created_at
        delete user.password
        return db.users.put(user).then(() => user)
      }).then(user => {
        context.commit('create', user)
        return user
      })
    },

    update: (context, user) => {
      const db = context.rootState.db

      return UserApi.updateUser(user).then(user =>
        db.users.put(user).then(() => user)
      ).then(user => {
        context.commit('update', user)
        return user
      })
    }
  }
}
