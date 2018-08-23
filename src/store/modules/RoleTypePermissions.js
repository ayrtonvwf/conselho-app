import RoleTypePermissionApi from '../../services/api/RoleTypePermission'

export default {
  namespaced: true,

  state: {
    role_type_permissions: [],
    loaded: false
  },

  getters: {
    getRoleTypePermissions: state => {
      return state.role_type_permissions
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.role_type_permissions = payload
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.role_type_permissions = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.role_type_permissions.toArray()
    },

    getAllFromAPI: () => {
      return RoleTypePermissionApi.getRoleTypePermissions()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      return context.dispatch('getAllFromDb').then(roleTypePermissions => {
        context.commit('setAll', roleTypePermissions)
        context.commit('setLoaded')
      })
    }
  }
}
