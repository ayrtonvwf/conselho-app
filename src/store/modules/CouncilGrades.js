import CouncilGradeApi from '../../services/api/CouncilGrade'

export default {
  namespaced: true,

  state: {
    loaded: false,
    council_grades: []
  },

  getters: {
    getCouncilGrades: state => {
      return state.council_grades
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.council_grades = payload
    },

    create: (state, payload) => {
      state.council_grades.push(payload)
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.council_grades = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.council_grades.toArray()
    },

    getAllFromAPI: () => {
      return CouncilGradeApi.getCouncilGrades()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      context.dispatch('getAllFromDb').then(councilGrades => {
        context.commit('setAll', councilGrades)
        context.commit('setLoaded')
      })
    },

    create: (context, councilGrade) => {
      const db = context.rootState.db

      councilGrade.school_id = context.rootState.school_id

      return CouncilGradeApi.createCouncilGrade(councilGrade).then(councilGrade =>
        db.council_grades.put(councilGrade).then(() => councilGrade)
      ).then(councilGrade => {
        context.commit('create', councilGrade)
        return councilGrade
      })
    }
  }
}
