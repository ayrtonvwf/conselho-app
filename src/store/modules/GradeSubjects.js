import Vue from 'vue'
import GradeSubjectApi from '../../services/api/GradeSubject'

export default {
  namespaced: true,

  state: {
    grade_subjects: [],
    loaded: false
  },

  getters: {
    getGradeSubjects: state => {
      return state.grade_subjects
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.grade_subjects = payload
    },

    create: (state, payload) => {
      state.grade_subjects.push(payload)
    },

    delete: (state, gradeSubjectId) => {
      const index = state.grade_subjects.findIndex(gradeSubject =>
        gradeSubject.id === gradeSubjectId
      )
      Vue.delete(state.grade_subjects, index)
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.grade_subjects = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.grade_subjects.toArray()
    },

    getAllFromAPI: () => {
      return GradeSubjectApi.getGradeSubjects()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      context.dispatch('getAllFromDb').then(gradeSubjects => {
        context.commit('setAll', gradeSubjects)
        context.commit('setLoaded')
      })
    },

    create: (context, gradeSubject) => {
      const db = context.rootState.db

      gradeSubject.school_id = context.rootState.school_id

      return GradeSubjectApi.createGradeSubject(gradeSubject).then(gradeSubject =>
        db.grade_subjects.put(gradeSubject).then(() => gradeSubject)
      ).then(gradeSubject => {
        context.commit('create', gradeSubject)
        return gradeSubject
      })
    },

    delete: (context, gradeSubjectId) => {
      const db = context.rootState.db

      return GradeSubjectApi.deleteGradeSubject(gradeSubjectId).then(() =>
        db.grade_observations.delete(gradeSubjectId)
      ).then(() => {
        context.commit('delete', gradeSubjectId)
      })
    }
  }
}
