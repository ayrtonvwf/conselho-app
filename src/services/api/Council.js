import {getResource, saveResource, updateResource} from './helpers'

export default {
  getCouncils () {
    return getResource('councils')
  },

  createCouncil (council) {
    return saveResource('council', council)
  },

  updateCouncil (council) {
    return updateResource('council', council)
  }
}
