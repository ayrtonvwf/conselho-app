import {getResource, saveResource, updateResource} from './helpers'

export default {
  getGradeObservations () {
    return getResource('grade_observations')
  },

  createGradeObservation (gradeObservation) {
    return saveResource('grade_observation', gradeObservation)
  },

  updateGradeObservation (gradeObservation) {
    return updateResource('grade_observation', gradeObservation)
  }
}
