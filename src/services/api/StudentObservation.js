import {getResource, saveResource, updateResource} from './helpers'

export default {
  getStudentObservations () {
    return getResource('student_observations')
  },

  createStudentObservation (studentObservation) {
    return saveResource('student_observation', studentObservation)
  },

  updateStudentObservation (studentObservation) {
    return updateResource('student_observation', studentObservation)
  }
}
