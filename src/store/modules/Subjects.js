import Vue from 'vue'
import SubjectApi from '../../services/api/Subject'

export default {
  namespaced: true,

  state: {
    subjects: [],
    loaded: false
  },

  getters: {
    getSubjects: state => {
      return state.subjects
    },

    getOrderedSubjects: state => {
      return state.subjects.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', {ignorePunctuation: true})
      )
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.subjects = payload
    },

    create: (state, payload) => {
      state.subjects.push(payload)
    },

    update: (state, payload) => {
      const index = state.subjects.findIndex(subject =>
        subject.id === payload.id
      )

      Vue.set(state.subjects, index, payload)
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.subjects = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.subjects.toArray()
    },

    getAllFromAPI: () => {
      return SubjectApi.getSubjects()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      context.dispatch('getAllFromDb').then(subjects => {
        context.commit('setAll', subjects)
        context.commit('setLoaded')
      })
    },

    create: (context, subject) => {
      const db = context.rootState.db

      subject.school_id = context.rootState.school_id

      return SubjectApi.createSubject(subject).then(subject =>
        db.subjects.put(subject).then(() => subject)
      ).then(subject => {
        context.commit('create', subject)
        return subject
      })
    },

    update: (context, subject) => {
      const db = context.rootState.db

      return SubjectApi.updateSubject(subject).then(subject =>
        db.subjects.put(subject).then(() => subject)
      ).then(subject => {
        context.commit('update', subject)
        return subject
      })
    }
  }
}
