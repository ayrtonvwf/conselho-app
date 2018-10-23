import CouncilObservationTopicApi from '../../services/api/CouncilObservationTopic'

export default {
  namespaced: true,

  state: {
    council_observation_topics: [],
    loaded: false
  },

  getters: {
    getCouncilObservationTopics: state => {
      return state.council_observation_topics
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.council_observation_topics = payload
    },

    create: (state, payload) => {
      state.council_observation_topics.push(payload)
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.council_observation_topics = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.council_observation_topics.toArray()
    },

    getAllFromAPI: () => {
      return CouncilObservationTopicApi.getCouncilTopics()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      return context.dispatch('getAllFromDb').then(councilObservationTopics => {
        context.commit('setAll', councilObservationTopics)
        context.commit('setLoaded')
      })
    },

    create: (context, councilObservationTopic) => {
      const db = context.rootState.db

      councilObservationTopic.school_id = context.rootState.school_id

      return CouncilObservationTopicApi.createCouncilObservationTopic(councilObservationTopic).then(councilObservationTopic =>
        db.council_observation_topics.put(councilObservationTopic).then(() => councilObservationTopic)
      ).then(councilObservationTopic => {
        context.commit('create', councilObservationTopic)
        return councilObservationTopic
      })
    }
  }
}
