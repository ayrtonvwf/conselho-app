import Vue from 'vue'
import ObservationTopicApi from '../../services/api/ObservationTopic'

export default {
  namespaced: true,

  state: {
    observation_topics: [],
    loaded: false
  },

  getters: {
    getObservationTopics: state => {
      return state.observation_topics
    },

    getOrderedObservationTopics: state => {
      return state.observation_topics.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', {ignorePunctuation: true})
      )
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.observation_topics = payload
    },

    create: (state, payload) => {
      state.observation_topics.push(payload)
    },

    update: (state, payload) => {
      const index = state.observation_topics.findIndex(observationTopic =>
        observationTopic.id === payload.id
      )

      Vue.set(state.observation_topics, index, payload)
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.observation_topics = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.observation_topics.toArray()
    },

    getAllFromAPI: () => {
      return ObservationTopicApi.getTopics()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      return context.dispatch('getAllFromDb').then(observationTopics => {
        context.commit('setAll', observationTopics)
        context.commit('setLoaded')
      })
    },

    create: (context, observationTopic) => {
      const db = context.rootState.db

      observationTopic.school_id = context.rootState.school_id

      return ObservationTopicApi.createTopic(observationTopic).then(observationTopic =>
        db.observation_topics.put(observationTopic).then(() => observationTopic)
      ).then(observationTopic => {
        context.commit('create', observationTopic)
        return observationTopic
      })
    },

    update: (context, observationTopic) => {
      const db = context.rootState.db

      return ObservationTopicApi.updateTopic(observationTopic).then(observationTopic =>
        db.observation_topics.put(observationTopic).then(() => observationTopic)
      ).then(observationTopic => {
        context.commit('update', observationTopic)
        return observationTopic
      })
    }
  }
}
