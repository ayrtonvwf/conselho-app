import {getResource, saveResource, updateResource} from './helpers'

export default {
  getCouncilTopics () {
    return getResource('council_topics')
  },

  createCouncilTopic (councilTopic) {
    return saveResource('council_topic', councilTopic)
  },

  updateCouncilTopic (councilTopic) {
    return updateResource('council_topic', councilTopic)
  }
}
