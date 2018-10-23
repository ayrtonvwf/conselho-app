import CouncilTopicApi from '../../services/api/CouncilTopic'

export default {
  namespaced: true,

  state: {
    council_topics: [],
    loaded: false
  },

  getters: {
    getCouncilTopics: state => {
      return state.council_topics
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.council_topics = payload
    },

    create: (state, payload) => {
      state.council_topics.push(payload)
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.council_topics = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.council_topics.toArray()
    },

    getAllFromAPI: () => {
      return CouncilTopicApi.getCouncilTopics()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      return context.dispatch('getAllFromDb').then(councilTopics => {
        context.commit('setAll', councilTopics)
        context.commit('setLoaded')
      })
    },

    create: (context, councilTopic) => {
      const db = context.rootState.db

      councilTopic.school_id = context.rootState.school_id

      return CouncilTopicApi.createCouncilTopic(councilTopic).then(councilTopic =>
        db.council_topics.put(councilTopic).then(() => councilTopic)
      ).then(councilTopic => {
        context.commit('create', councilTopic)
        return councilTopic
      })
    }
  }
}
