import {getResource, saveResource, updateResource} from './helpers'

export default {
  getCouncilGrades () {
    return getResource('council_grades')
  },

  createCouncilGrade (councilGrade) {
    return saveResource('council_grade', councilGrade)
  },

  updateCouncilGrade (councilGrade) {
    return updateResource('council_grade', councilGrade)
  }
}
