import CouncilGradeApi from '../../services/api/CouncilGrade'

export default {
  namespaced: true,

  state: {
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

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(councilGrades => {
        context.commit('setAll', councilGrades)
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
