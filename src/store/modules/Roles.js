import RoleApi from '../../services/api/Role'
import Vue from 'vue'

export default {
  namespaced: true,

  state: {
    roles: []
  },

  getters: {
    getRoles: state => {
      return state.roles
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.roles = payload
    },

    create: (state, payload) => {
      state.roles.push(payload)
    },

    update: (state, payload) => {
      const index = state.roles.findIndex(role =>
        role.id === payload.id
      )

      Vue.set(state.roles, index, payload)
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.roles.toArray()
    },

    getAllFromAPI: () => {
      return RoleApi.getRoles()
    },

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(roles => {
        context.commit('setAll', roles)
      })
    },

    create: (context, role) => {
      const db = context.rootState.db

      role.school_id = context.rootState.school_id

      return RoleApi.createRole(role).then(role =>
        db.roles.put(role).then(() => role)
      ).then(role => {
        context.commit('create', role)
        return role
      })
    },

    update: (context, role) => {
      const db = context.rootState.db

      return RoleApi.updateRole(role).then(role =>
        db.roles.put(role).then(() => role)
      ).then(role => {
        context.commit('update', role)
        return role
      })
    }
  }
}
