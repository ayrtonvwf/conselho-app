import Vue from 'vue'
import StudentApi from '../../services/api/Student'

export default {
  namespaced: true,

  state: {
    students: []
  },

  getters: {
    getStudents: state => {
      return state.students
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.students = payload
    },

    create: (state, payload) => {
      state.students.push(payload)
    },

    update: (state, payload) => {
      const index = state.students.findIndex(student =>
        student.id === payload.id
      )

      Vue.set(state.students, index, payload)
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.students.toArray()
    },

    getAllFromAPI: () => {
      return StudentApi.getStudents()
    },

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(students => {
        context.commit('setAll', students)
      })
    },

    create: (context, student) => {
      const db = context.rootState.db

      student.school_id = context.rootState.school_id

      return StudentApi.createStudent(student).then(student =>
        db.students.put(student).then(() => student)
      ).then(student => {
        context.commit('create', student)
        return student
      })
    },

    update: (context, student) => {
      const db = context.rootState.db

      return StudentApi.updateStudent(student).then(student =>
        db.students.put(student).then(() => student)
      ).then(student => {
        context.commit('update', student)
        return student
      })
    }
  }
}
