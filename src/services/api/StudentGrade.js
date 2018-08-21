import {getResource, saveResource, updateResource} from './helpers'

export default {
  getStudentGrades () {
    return getResource('student_grades')
  },

  createStudentGrade (studentGrade) {
    return saveResource('student_grade', studentGrade)
  },

  updateStudentGrade (studentGrade) {
    return updateResource('student_grade', studentGrade)
  }
}
