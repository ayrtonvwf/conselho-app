import {getResource, saveResource, updateResource} from './helpers'
import axios from 'axios'

export default {
  getTeachers () {
    return getResource('teachers')
  },

  createTeacher (teacher) {
    return saveResource('teacher', teacher)
  },

  updateTeacher (teacher) {
    return updateResource('teacher', teacher)
  },

  deleteTeacher (teacherId) {
    return axios.delete('/teacher/' + teacherId)
  }
}
