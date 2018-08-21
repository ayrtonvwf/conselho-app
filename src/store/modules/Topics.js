import Vue from 'vue'
import TopicApi from '../../services/api/Topic'

export default {
  namespaced: true,

  state: {
    topics: []
  },

  getters: {
    getTopics: state => {
      return state.topics
    },

    getOrderedTopics: state => {
      return state.topics.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', {ignorePunctuation: true})
      )
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.topics = payload
    },

    create: (state, payload) => {
      state.topics.push(payload)
    },

    update: (state, payload) => {
      const index = state.topics.findIndex(topic =>
        topic.id === payload.id
      )

      Vue.set(state.topics, index, payload)
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.topics.toArray()
    },

    getAllFromAPI: () => {
      return TopicApi.getTopics()
    },

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(topics => {
        context.commit('setAll', topics)
      })
    },

    create: (context, topic) => {
      const db = context.rootState.db

      topic.school_id = context.rootState.school_id

      return TopicApi.createTopic(topic).then(topic =>
        db.topics.put(topic).then(() => topic)
      ).then(topic => {
        context.commit('create', topic)
        return topic
      })
    },

    update: (context, topic) => {
      const db = context.rootState.db

      return TopicApi.updateTopic(topic).then(topic =>
        db.topics.put(topic).then(() => topic)
      ).then(topic => {
        context.commit('update', topic)
        return topic
      })
    }
  }
}
