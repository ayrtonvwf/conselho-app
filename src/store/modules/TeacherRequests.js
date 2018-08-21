import Vue from 'vue'
import TeacherRequestApi from '../../services/api/TeacherRequest'

export default {
  namespaced: true,

  state: {
    teacher_requests: []
  },

  getters: {
    getTeacherRequests: state => {
      return state.teacher_requests
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.teacher_requests = payload
    },

    create: (state, payload) => {
      state.teacher_requests.push(payload)
    },

    update: (state, payload) => {
      const index = state.teacher_requests.findIndex(teacherRequest =>
        teacherRequest.id === payload.id
      )

      Vue.set(state.teacher_requests, index, payload)
    },

    delete: (state, teacherRequestId) => {
      const index = state.teacher_requests.findIndex(teacherRequest =>
        teacherRequest.id === teacherRequestId
      )

      Vue.delete(state.teacher_requests, index)
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.teacher_requests.toArray()
    },

    getAllFromAPI: () => {
      return TeacherRequestApi.getTeacherRequests()
    },

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(teacherRequests => {
        context.commit('setAll', teacherRequests)
      })
    },

    create: (context, teacherRequest) => {
      const db = context.rootState.db

      teacherRequest.school_id = context.rootState.school_id

      return TeacherRequestApi.createTeacherRequest(teacherRequest).then(teacherRequest =>
        db.teacher_requests.put(teacherRequest).then(() => teacherRequest)
      ).then(teacherRequest => {
        context.commit('create', teacherRequest)
        return teacherRequest
      })
    },

    update: (context, teacherRequest) => {
      const db = context.rootState.db

      return TeacherRequestApi.updateTeacherRequest(teacherRequest).then(teacherRequest =>
        db.teacher_requests.put(teacherRequest).then(() => teacherRequest)
      ).then(teacherRequest => {
        context.commit('update', teacherRequest)
        return teacherRequest
      })
    },

    delete: (context, teacherRequestId) => {
      const db = context.rootState.db

      return TeacherRequestApi.deleteTeacherRequest(teacherRequestId).then(() =>
        db.teacher_requests.delete(teacherRequestId)
      ).then(() => {
        context.commit('delete', teacherRequestId)
      })
    }
  }
}
