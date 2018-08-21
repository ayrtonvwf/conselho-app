import {getResource, saveResource, updateResource} from './helpers'

export default {
  getSubjects () {
    return getResource('subjects')
  },

  createSubject (subject) {
    return saveResource('subject', subject)
  },

  updateSubject (subject) {
    return updateResource('subject', subject)
  }
}
