import Vue from 'vue'
import TopicOptionApi from '../../services/api/TopicOption'

export default {
  namespaced: true,

  state: {
    topic_options: []
  },

  getters: {
    getTopicOptions: state => {
      return state.topic_options
    },

    getOrderedTopicOptions: state => {
      return state.topic_options.sort((a, b) =>
        Math.sign(b.value - a.value)
      )
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.topic_options = payload
    },

    create: (state, payload) => {
      state.topic_options.push(payload)
    },

    update: (state, payload) => {
      const index = state.topic_options.findIndex(topicOption =>
        topicOption.id === payload.id
      )

      Vue.set(state.topic_options, index, payload)
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.topic_options.toArray()
    },

    getAllFromAPI: () => {
      return TopicOptionApi.getTopicOptions()
    },

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(topicOptions => {
        context.commit('setAll', topicOptions)
      })
    },

    create: (context, topicOption) => {
      const db = context.rootState.db

      topicOption.school_id = context.rootState.school_id

      return TopicOptionApi.createTopicOption(topicOption).then(topicOption =>
        db.topic_options.put(topicOption).then(() => topicOption)
      ).then(topicOption => {
        context.commit('create', topicOption)
        return topicOption
      })
    },

    update: (context, topicOption) => {
      const db = context.rootState.db

      return TopicOptionApi.updateTopicOption(topicOption).then(topicOption =>
        db.topic_options.put(topicOption).then(() => topicOption)
      ).then(topicOption => {
        context.commit('update', topicOption)
        return topicOption
      })
    }
  }
}
