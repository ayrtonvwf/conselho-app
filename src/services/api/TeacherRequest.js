import axios from 'axios'
import {getResource, saveResource, updateResource} from './helpers'

export default {
  getTeacherRequests () {
    return getResource('teacher_requests')
  },

  createTeacherRequest (teacherRequest) {
    return saveResource('teacher_request', teacherRequest)
  },

  updateTeacherRequest (teacherRequest) {
    return updateResource('teacher_request', teacherRequest)
  },

  deleteTeacherRequest (teacherRequestId) {
    return axios.delete('/teacher_request/' + teacherRequestId)
  }
}
