import Vue from 'vue'
import GradeApi from '../../services/api/Grade'

export default {
  namespaced: true,

  state: {
    grades: []
  },

  getters: {
    getGrades: state => {
      return state.grades
    },

    getOrderedGrades: state => {
      return state.grades.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', {ignorePunctuation: true})
      )
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.grades = payload
    },

    create: (state, payload) => {
      state.grades.push(payload)
    },

    update: (state, payload) => {
      const index = state.grades.findIndex(grade =>
        grade.id === payload.id
      )

      Vue.set(state.grades, index, payload)
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.grades.toArray()
    },

    getAllFromAPI: () => {
      return GradeApi.getGrades()
    },

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(grades => {
        context.commit('setAll', grades)
      })
    },

    create: (context, grade) => {
      const db = context.rootState.db

      grade.school_id = context.rootState.school_id

      return GradeApi.createGrade(grade).then(grade =>
        db.grades.put(grade).then(() => grade)
      ).then(grade => {
        context.commit('create', grade)
        return grade
      })
    },

    update: (context, grade) => {
      const db = context.rootState.db

      return GradeApi.updateGrade(grade).then(grade =>
        db.grades.put(grade).then(() => grade)
      ).then(grade => {
        context.commit('update', grade)
        return grade
      })
    }
  }
}
