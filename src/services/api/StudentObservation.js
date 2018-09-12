import {getResource, saveResource, updateResource} from './helpers'
import axios from 'axios'

export default {
  getStudentObservations () {
    return getResource('student_observations')
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
