import {getResource, saveResource, updateResource} from './helpers'
import axios from 'axios'

export default {
  getGradeObservations () {
    return getResource('grade_observations')
  },

  createGradeObservation (gradeObservation) {
    return saveResource('grade_observation', gradeObservation)
  },

  updateGradeObservation (gradeObservation) {
    return updateResource('grade_observation', gradeObservation)
  },

  deleteGradeObservation (gradeObservationId) {
    return axios.delete('/grade_observation/' + gradeObservationId)
  }
}
