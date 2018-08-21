import RoleTypePermissionApi from '../../services/api/RoleTypePermission'

export default {
  namespaced: true,

  state: {
    role_type_permissions: []
  },

  getters: {
    getRoleTypePermissions: state => {
      return state.role_type_permissions
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.role_type_permissions = payload
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

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(roleTypePermissions => {
        context.commit('setAll', roleTypePermissions)
      })
    }
  }
}
