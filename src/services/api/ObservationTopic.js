import {getResource, saveResource, updateResource} from './helpers'

export default {
  getObservationTopics () {
    return getResource('observation_topics')
  },

  createObservationTopic (observationTopic) {
    return saveResource('observation_topic', observationTopic)
  },

  updateObservationTopic (observationTopic) {
    return updateResource('observation_topic', observationTopic)
  }
}
