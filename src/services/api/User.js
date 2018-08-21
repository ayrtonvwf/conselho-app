import {getResource, saveResource, updateResource} from './helpers'

export default {
  getUsers () {
    return getResource('users')
  },

  createUser (user) {
    return saveResource('user', user)
  },

  updateUser (user) {
    return updateResource('user', user, false)
  }
}
