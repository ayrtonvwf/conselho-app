import {getResource, saveResource, updateResource} from './helpers'

export default {
  getStudents () {
    return getResource('students')
  },

  createStudent (student) {
    return saveResource('student', student)
  },

  updateStudent (student) {
    return updateResource('student', student)
  }
}
