import Vue from 'vue'
import TeacherApi from '../../services/api/Teacher'

export default {
  namespaced: true,

  state: {
    loaded: false,
    teachers: []
  },

  getters: {
    getTeachers: state => {
      return state.teachers
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.teachers = payload
    },

    create: (state, payload) => {
      state.teachers.push(payload)
    },

    update: (state, payload) => {
      const index = state.teachers.findIndex(teacher =>
        teacher.id === payload.id
      )

      Vue.set(state.teachers, index, payload)
    },

    delete: (state, teacherId) => {
      const index = state.teachers.findIndex(teacherRequest =>
        teacherRequest.id === teacherId
      )

      Vue.delete(state.teachers, index)
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.teachers = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.teachers.toArray()
    },

    getAllFromAPI: () => {
      return TeacherApi.getTeachers()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      context.dispatch('getAllFromDb').then(teachers => {
        context.commit('setAll', teachers)
        context.commit('setLoaded')
      })
    },

    create: (context, teacher) => {
      const db = context.rootState.db

      teacher.school_id = context.rootState.school_id

      return TeacherApi.createTeacher(teacher).then(teacher =>
        db.teachers.put(teacher).then(() => teacher)
      ).then(teacher => {
        context.commit('create', teacher)
        return teacher
      })
    },

    update: (context, teacher) => {
      const db = context.rootState.db

      return TeacherApi.updateTeacher(teacher).then(teacher =>
        db.teachers.put(teacher).then(() => teacher)
      ).then(teacher => {
        context.commit('update', teacher)
        return teacher
      })
    },

    delete: (context, teacherId) => {
      const db = context.rootState.db

      return TeacherApi.deleteTeacher(teacherId).then(() =>
        db.teachers.delete(teacherId)
      ).then(() => {
        context.commit('delete', teacherId)
      })
    }
  }
}
