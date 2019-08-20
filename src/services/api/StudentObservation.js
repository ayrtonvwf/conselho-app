import {getResource, saveResource, updateResource} from './helpers'
import axios from 'axios'

export default {
  getStudentObservations (filter) {
    return getResource('student_observation', filter)
  },

  createStudentObservation (studentObservation) {
    return saveResource('student_observation', studentObservation)
  },

  updateStudentObservation (studentObservation) {
    return updateResource('student_observation', studentObservation)
  },

  deleteStudentObservation (studentObservationId) {
    return axios.delete('/student_observation/' + studentObservationId)
  }
}
