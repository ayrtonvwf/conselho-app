import {getResource, saveResource, updateResource} from './helpers'

export default {
  getCouncilObservationTopics () {
    return getResource('council_observation_topics')
  },

  createCouncilObservationTopic (councilObservationTopic) {
    return saveResource('council_observation_topic', councilObservationTopic)
  },

  updateCouncilObservationTopic (councilObservationTopic) {
    return updateResource('council_observation_topic', councilObservationTopic)
  }
}
