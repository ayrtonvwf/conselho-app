import {getResource, saveResource, updateResource} from './helpers'

export default {
  getTopicOptions () {
    return getResource('topic_options')
  },

  createTopicOption (topicOption) {
    return saveResource('topic_option', topicOption)
  },

  updateTopicOption (topicOption) {
    return updateResource('topic_option', topicOption)
  }
}
