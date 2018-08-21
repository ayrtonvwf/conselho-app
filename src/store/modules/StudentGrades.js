import Vue from 'vue'
import StudentGradeApi from '../../services/api/StudentGrade'

export default {
  namespaced: true,

  state: {
    student_grades: []
  },

  getters: {
    getStudentGrades: state => {
      return state.student_grades
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.student_grades = payload
    },

    create: (state, payload) => {
      state.student_grades.push(payload)
    },

    update: (state, payload) => {
      const index = state.student_grades.findIndex(studentGrade =>
        studentGrade.id === payload.id
      )

      Vue.set(state.student_grades, index, payload)
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.student_grades.toArray()
    },

    getAllFromAPI: () => {
      return StudentGradeApi.getStudentGrades()
    },

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(studentGrades => {
        context.commit('setAll', studentGrades)
      })
    },

    create: (context, studentGrade) => {
      const db = context.rootState.db

      studentGrade.school_id = context.rootState.school_id

      return StudentGradeApi.createStudentGrade(studentGrade).then(studentGrade =>
        db.student_grades.put(studentGrade).then(() => studentGrade)
      ).then(studentGrade => {
        context.commit('create', studentGrade)
        return studentGrade
      })
    },

    update: (context, studentGrade) => {
      const db = context.rootState.db

      return StudentGradeApi.updateStudentGrade(studentGrade).then(studentGrade =>
        db.student_grades.put(studentGrade).then(() => studentGrade)
      ).then(studentGrade => {
        context.commit('update', studentGrade)
        return studentGrade
      })
    }
  }
}
