import axios from 'axios'
import {parseObject, parseObjects} from '../../assets/helpers'

export function getResource (name, filter) {
  return axios.get('/' + name, { params: filter }).then(response => {
    const responseData = response.data

    let returnData = responseData.results

    const max = parseInt(responseData.max_results_per_page)
    const total = parseInt(responseData.total_results)

    const remainingPages = Math.floor(total / max)

    if (total === max || !remainingPages) {
      return parseObjects(returnData)
    }

    const remainingRequisitions = []

    for (let i = 1; i <= remainingPages; i++) {
      const requestConfig = {
        params: {
          page: i + 1
        }
      }
      const request = axios.get('/' + name, requestConfig)

      remainingRequisitions.push(request)
    }

    return Promise.all(remainingRequisitions).then(remainingResponses => {
      remainingResponses.forEach(remainingResponse => {
        returnData = returnData.concat(remainingResponse.data.results)
      })

      return parseObjects(returnData)
    })
  })
}

export function saveResource (name, data) {
  data = parseObject({...data})

  return axios.post('/' + name, data).then(response => {
    return parseObject({
      ...data,
      ...response.data
    })
  })
}

export function updateResource (name, data, appendId) {
  if (appendId === undefined) {
    appendId = true
  }

  data = parseObject({...data})
  const path = '/' + name + (appendId ? '/' + data.id : '')

  return axios.patch(path, data).then(response => {
    return parseObject({
      ...data,
      ...response.data
    })
  })
}

export function putResources (name, data) {
  data = parseObject({...data})

  return axios.put('/' + name, data).then(response => {
    return response.data.map((obj, i) => {
      return {
        ...data[i],
        ...obj
      }
    })
  })
}
