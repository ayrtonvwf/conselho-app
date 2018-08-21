import CouncilTopicApi from '../../services/api/CouncilTopic'

export default {
  namespaced: true,

  state: {
    council_topics: []
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

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(councilTopics => {
        context.commit('setAll', councilTopics)
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
