import {getResource, saveResource, updateResource} from './helpers'

export default {
  getRoles () {
    return getResource('roles')
  },

  createRole (role) {
    return saveResource('role', role)
  },

  updateRole (role) {
    return updateResource('role', role)
  }
}
