import PermissionApi from '../../services/api/Permission'

export default {
  namespaced: true,

  state: {
    permissions: [],
    loaded: false
  },

  getters: {
    getPermissions: state => {
      return state.permissions
    },

    getOrderedPermissions: state => {
      return state.permissions.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', {ignorePunctuation: true})
      )
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.permissions = payload
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.permissions = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.permissions.toArray()
    },

    getAllFromAPI: () => {
      return PermissionApi.getPermissions()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      context.dispatch('getAllFromDb').then(permissions => {
        context.commit('setAll', permissions)
        context.commit('setLoaded')
      })
    }
  }
}
