import {getResource, saveResource, updateResource} from './helpers'

export default {
  getGrades () {
    return getResource('grades')
  },

  createGrade (grade) {
    return saveResource('grade', grade)
  },

  updateGrade (grade) {
    return updateResource('grade', grade)
  }
}
