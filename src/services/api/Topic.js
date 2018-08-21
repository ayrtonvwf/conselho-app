import {getResource, saveResource, updateResource} from './helpers'

export default {
  getTopics () {
    return getResource('topics')
  },

  createTopic (topic) {
    return saveResource('topic', topic)
  },

  updateTopic (topic) {
    return updateResource('topic', topic)
  }
}
