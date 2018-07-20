let data = {
    pathname: document.location.pathname,
    token: {},
    user: {},
    current_council: {},
    notification: {},
    new_topic_options: [{}],

    current_grade_id: '',
    current_subject_id: '',
}

let resources = [
    'council',
    'council_grade',
    'council_topic',
    'evaluation',
    'grade',
    'grade_subject',
    'grade_observation',
    'medical_report',
    'medical_report_subject',
    'permission',
    'role',
    'role_type',
    'role_type_permission',
    'school',
    'student',
    'student_observation',
    'student_grade',
    'subject',
    'teacher',
    'teacher_request',
    'topic',
    'topic_option',
    'user'
]

resources.forEach(resource => {
    data[resource+'s'] = []
})

let token = JSON.parse(localStorage.getItem('token'))
if (!token || new Date(token.expires_at) < new Date()) {
    location.href = 'login.html'
}

let app = new Vue({
    el: '#app',
    data: data,
    methods: {
        orderedTopicOptions(topic_id) {
            let topic_options = this.topic_options.filter(topic_option => topic_option.topic_id === topic_id)
            // order by value desc
            return topic_options.sort((a, b) => {
                a = parseInt(a.value)
                b = parseInt(b.value)

                if (a > b) {
                    return -1
                }

                if (a < b) {
                    return 1
                }

                return 0
            })
        },
        activeCouncil(council_id) {
            let council = this.councils.find(council => council.id === council_id)
            return new Date(council.start_date) <= new Date() && new Date(council.end_date) >= new Date()
        },
        role_type(user_id) {
            let role = this.roles.find(role => role.user_id === user_id && parseInt(role.approved))

            if (!role) {
                return {}
            }

            return this.role_types.find(role_type => role_type.id === role.role_type_id)
        },
        userCanEvaluate(user_id) {
            let role_type = this.role_type(user_id)

            if (role_type.id === undefined) {
                return false;
            }

            let permission = this.permissions.find(permission => permission.reference === 'evaluate')

            return !!this.role_type_permissions.find(role_type_permission => role_type_permission.permission_id === permission.id)
        },
        userHasPermission(permission_reference) {
            let role_type = this.role_type(this.user.id)

            if (role_type.id === undefined) {
                return false;
            }

            let permission = this.permissions.find(permission => permission.reference === permission_reference)

            return !!this.role_type_permissions.find(role_type_permission => role_type_permission.permission_id === permission.id && role_type_permission.role_type_id === role_type.id)
        },
        selectedEvaluation(student_id, topic_id) {
            let evaluation = this.evaluations.find(evaluation =>
                evaluation.council_id === this.current_council.id &&
                evaluation.grade_id === this.current_grade_id &&
                evaluation.student_id === student_id &&
                evaluation.subject_id === this.current_subject_id &&
                evaluation.user_id === this.user.id &&
                this.topic_options.find(topic_option =>
                    topic_option.id === evaluation.topic_option_id &&
                    topic_option.topic_id === topic_id
                ) !== undefined
            )

            return evaluation === undefined ? '' : evaluation.topic_option_id
        }
    }
})

function seed() {
    let promises = []

    let fetched_data = {}

    resources.forEach(resource => {
        let promise = api_fetch(resource)
            .then(response => response.json())
            .then(data => fetched_data[resource+'s'] = data.results)
            // .then(data => app._data[resource+'s'] = data.results)

        promises.push(promise)
    })


    return Promise.all(promises).then(() => {
        let app_data = app._data
        resources.forEach(resource => {
            app_data[resource+'s'] = fetched_data[resource+'s']
        })

        app_data.user = app_data.users.find(user => parseInt(user.id) === token.user_id)

        if (document.location.pathname.endsWith('evaluate.html')) {
            let current_council_id = new URL(document.location.href).searchParams.get('id')
            app_data.current_council = app_data.councils.find(council => council.id === current_council_id)
        }

        app._data = app_data
    })
}

seed()

function api_fetch(path, method, body, headers) {
    if (method === undefined) {
        method = 'GET'
    }

    if (method === 'GET' || method === 'DELETE') {
        body = undefined
    } else {
        body.school_id = 1
        body = JSON.stringify(body)
    }

    if (headers === undefined) {
        headers = {}
    }

    headers = new Headers(headers)
    headers.set('Timezone', '-03:00')
    headers.set('Accept', 'application/json; charset=UTF-8')
    headers.set('Content-Type', 'application/json')
    headers.set('Token', token.value)

    let url = 'https://conselho-api.infomec.net.br/'+path
    let options = {
        headers: headers,
        method: method,
        mode: 'cors',
        body: body
    }

    return fetch(url, options).then((response) => {
        if (!response.ok) {
            throw response
        }
        return response
    })
}

function form_submit(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    let form = event.target
    let resource = form.dataset.resource
    let form_data = new FormData(form)
    let data = {}
    form_data.forEach((value, field) => {
        data[field] = value
    })

    form.querySelectorAll('[type=checkbox]').forEach((checkbox) => {
        data[checkbox.name] = checkbox.checked
    })

    save_resource(resource, data).then(() => {
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function delete_resource(resource_name, id, notification) {
    document.location.hash = '' // closes modal

    if (notification === undefined) {
        notification = true
    }

    return api_fetch(resource_name+'/'+id, 'DELETE').then(() => {
        return seed()
    }).then(() => {
        if (notification) {
            notify('Sucesso!', 'Excluído com sucesso', 'success')
        }
    }).catch(() => {
        if (notification) {
            notify('Erro!', 'Não foi possível excluir', 'danger')
        }
    })
}

function save_resource(resource_name, data, reload_data) {
    if (reload_data === undefined) {
        reload_data = true
    }

    let path = resource_name
    let method = 'POST'

    if (data.id) {
        path += '/'+data.id
        method = 'PATCH'
    }

    return api_fetch(path, method, data).then(response => {
        return response.json()
    }).then((json) => {
        if (json.id !== undefined) {
            data.id = json.id
        }
        if (reload_data) {
            return seed()
        }
    }).then(() => data)
}

function notify(title, message, style, time) {
    if (time === undefined) {
        time = 5000
    }

    if (style === undefined) {
        style = 'info'
    }

    let icon
    if (style === 'success') {
        icon = 'check'
    } else if (style === 'danger') {
        icon = 'close'
    } else if (style === 'warning') {
        icon = 'warning'
    } else if (style === 'info' || style === 'primary') {
        icon = 'info'
    }

    let timestamp = Date.now().toString()

    document.getElementById('no-notification').checked = true

    // it there's already a notification, delay to transition
    let start_delay = Object.keys(app.notification).length > 0 ? 500 : 0

    setTimeout(() => {
        app.notification = {
            style: style,
            icon: icon,
            title: title,
            message: message,
            timestamp: timestamp
        }

        document.getElementById('notification-shown').checked = true

        setTimeout(() => {
            if (app.notification.timestamp !== timestamp) {
                return
            }

            document.getElementById('no-notification').checked = true

            setTimeout(() => { // delay to transition
                if (app.notification.timestamp !== timestamp) {
                    return
                }

                app.notification = {}
            }, 500)
        }, time)
    }, start_delay)
}

function submit_topic(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    let form = event.target
    let topic = {
        name: form.querySelector('[name=name]').value,
        active: true
    }

    let option_name_inputs = form.querySelectorAll('[name="option_name[]"]')
    let option_names = [].map.call(option_name_inputs, input => input.value)

    let option_value_inputs = form.querySelectorAll('[name="option_value[]"]')
    let option_values = [].map.call(option_value_inputs, input => input.value)

    let option_default_inputs = form.querySelectorAll('[name=option_default]')
    let option_defaults = [].map.call(option_default_inputs, input => input.checked)
    let default_option_index = option_defaults.indexOf(true)

    let options = []
    option_names.forEach((name, i) => {
        options.push({
            name: name,
            value: option_values[i],
            active: true
        })
    })

    return save_resource('topic', topic).then(response => {
        topic.id = response.id

        let save_options = []

        options.forEach(option => {
            option.topic_id = response.id
            save_options.push(save_resource('topic_option', option))
        })

        return Promise.all(save_options)
    }).then(promises_response => {
        if (default_option_index === -1) {
            return;
        }

        topic.topic_option_id = promises_response[default_option_index].id
        return save_resource('topic', topic)
    }).then(() => {
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function topic_update(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    let form = event.target
    let topic = {
        id: form.querySelector('[name=id]').value,
        name: form.querySelector('[name=name]').value,
        active: form.querySelector('[name=active]').checked
    }

    let option_id_inputs = form.querySelectorAll('[name="option_id[]"]')
    let option_ids = [].map.call(option_id_inputs, input => input.value)

    let option_name_inputs = form.querySelectorAll('[name="option_name[]"]')
    let option_names = [].map.call(option_name_inputs, input => input.value)

    let option_value_inputs = form.querySelectorAll('[name="option_value[]"]')
    let option_values = [].map.call(option_value_inputs, input => input.value)

    let option_default_inputs = form.querySelectorAll('[name=option_default]')
    let option_defaults = [].map.call(option_default_inputs, input => input.checked)
    let default_option_index = option_defaults.indexOf(true)

    topic.topic_option_id = option_ids[default_option_index]

    let options = []
    option_names.forEach((name, i) => {
        options.push({
            id: option_ids[i],
            name: name,
            value: option_values[i],
            active: true,
            topic_id: topic.id
        })
    })

    return save_resource('topic', topic).then(response => {
        let save_options = []

        options.forEach(option => {
            save_options.push(save_resource('topic_option', option))
        })

        return Promise.all(save_options)
    }).then(() => {
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function grade_save(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    let form = event.target
    let grade = {
        name: form.querySelector('[name=name]').value,
        level: form.querySelector('[name=level]').value,
        active: true
    }

    let grade_subject_inputs = form.querySelectorAll('[name="grade_subject[]"]:checked')
    let grade_subject_ids = [].map.call(grade_subject_inputs, input => input.value)

    return save_resource('grade', grade).then(response => {
        let save_grade_subjects = []

        grade_subject_ids.forEach(subject_id => {
            save_grade_subjects.push(save_resource('grade_subject', {
                subject_id: subject_id,
                grade_id: response.id
            }))
        })

        return Promise.all(save_grade_subjects)
    }).then(() => {
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function student_save(event) {
    event.preventDefault()

    let form = event.target
    let student = {
        name: form.querySelector('[name=name]').value,
        active: true
    }

    return save_resource('student', student).then(response => {
        return save_resource('student_grade', {
            student_id: response.id,
            grade_id: form.querySelector('[name=grade_id]').value,
            number: form.querySelector('[name=number]').value,
            start_date: '2018-01-01',
            end_date: '2018-12-31'
        })
    }).then(() => {
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function student_toggle(student_id) {
    let student_grade = app._data.student_grades.find(student_grade => parseInt(student_grade.student_id) === student_id)
    student_grade.end_date = new Date(student_grade.end_date) <= new Date() ? '2018-12-31' : new Date().toISOString().slice(0, 10)

    return save_resource('student_grade', student_grade).then(() => {
        notify('Sucesso!', '', 'success')
    }).catch(error => {
        console.log('Error:', error)
        notify('Erro!', '', 'danger')
    })
}

function council_save(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    let form = event.target
    let council = {
        name: form.querySelector('[name=name]').value,
        start_date: form.querySelector('[name=start_date]').value,
        end_date: form.querySelector('[name=end_date]').value,
        active: true
    }

    let council_topic_inputs = form.querySelectorAll('[name="council_topic[]"]:checked')
    let council_topic_ids = [].map.call(council_topic_inputs, input => input.value)

    return save_resource('council', council).then(response => {
        let save_council_topics = []

        council_topic_ids.forEach(topic_id => {
            save_council_topics.push(save_resource('council_topic', {
                topic_id: topic_id,
                council_id: response.id
            }))
        })

        let save_council_grades = []

        app._data.grades.forEach(grade => {
            save_council_grades.push(save_resource('council_grade', {
                grade_id: grade.id,
                council_id: response.id
            }))
        })
        return Promise.all(save_council_topics.concat(save_council_grades))
    }).then(() => {
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function council_update(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    let form = event.target
    let council = {
        id: form.querySelector('[name=id]').value,
        name: form.querySelector('[name=name]').value,
        start_date: form.querySelector('[name=start_date]').value,
        end_date: form.querySelector('[name=end_date]').value,
        active: true
    }

    return save_resource('council', council).then(() => {
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function logout() {
    localStorage.removeItem('token')
    location.href = 'login.html'
}

function accept_teacher_request(teacher_request_id) {
    console.log(app._data.teacher_requests)
    let teacher_request = app._data.teacher_requests.find(teacher_request => parseInt(teacher_request.id) === teacher_request_id)

    let teacher = {
        user_id: teacher_request.user_id,
        grade_id: teacher_request.grade_id,
        subject_id: teacher_request.subject_id,
        start_date: '2018-01-01',
        end_date: '2018-12-31'
    }
    api_fetch('teacher', 'POST', teacher).then(() => {
        return delete_resource('teacher_request', teacher_request_id, false)
    }).then(() => {
        notify('Sucesso!', 'Professor aceitado com sucesso', 'success')
    }).catch(error => {
        console.log('Error:', error)
        notify('Erro!', 'Não foi possível aceitar o professor', 'danger')
    })
}

function deny_teacher_request(teacher_request_id) {
    delete_resource('teacher_request', teacher_request_id, false).then(() => {
        notify('Sucesso!', 'Professor negado com sucesso', 'success')
    }).catch(error => {
        console.log('Error:', error)
        notify('Erro!', 'Não foi possível negar o professor', 'danger')
    })
}

function set_confirm_redirect() {
    window.onbeforeunload = event => {
        let dialogText = 'Tem certeza que deseja sair da página? Você perderá o que não foi salvo'
        event.returnValue = dialogText
        return dialogText
    }
}

function evaluation_save(event) {
    event.preventDefault()

    let form = event.target
    let base_evaluation = {
        council_id: app._data.current_council.id,
        grade_id: app._data.current_grade_id,
        subject_id: app._data.current_subject_id,
        user_id: app._data.user.id
    }

    let evaluations = []
    let student_observations = []

    let student_rows = form.querySelectorAll('[data-student_id]')
    student_rows.forEach(student_row => {
        let topic_selects = student_row.querySelectorAll('[data-topic_id]')
        topic_selects.forEach(topic_select => {
            let previous_evaluation = app._data.evaluations.find(existent_evaluation =>
                    existent_evaluation.council_id === app._data.current_council.id &&
                    existent_evaluation.grade_id === app._data.current_grade_id &&
                    existent_evaluation.student_id === student_row.dataset.student_id &&
                    existent_evaluation.subject_id === app._data.current_subject_id &&
                    existent_evaluation.user_id === app._data.user.id &&
                    app._data.topic_options.find(topic_option =>
                        topic_option.id === existent_evaluation.topic_option_id &&
                        topic_option.topic_id === topic_select.dataset.topic_id
                    ) !== undefined
                )

            evaluations.push({
                ...base_evaluation,
                student_id: student_row.dataset.student_id,
                topic_id: topic_select.dataset.topic_id,
                topic_option_id: topic_select.value,
                id: previous_evaluation ? previous_evaluation.id : null
            })

        })

        let student_observation = student_row.querySelector('textarea').value
        if (!student_observation.length) {
            return
        }

        let previous_observation = app._data.student_observations.find(existent_observation =>
            existent_observation.council_id === app._data.current_council.id &&
            existent_observation.grade_id === app._data.current_grade_id &&
            existent_observation.student_id === student_row.dataset.student_id &&
            existent_observation.subject_id === app._data.current_subject_id &&
            existent_observation.user_id === app._data.user.id
        )

        student_observations.push({
            ...base_evaluation,
            student_id: student_row.dataset.student_id,
            description: student_observation,
            id: previous_observation ? previous_observation.id : null
        })
    })

    let save_promises = []
    evaluations.forEach(evaluation => {
        save_promises.push(save_resource('evaluation', evaluation, false))
    })
    student_observations.forEach(student_observation => {
        save_promises.push(save_resource('student_observation', student_observation, false))
    })

    let grade_observation_description = form.querySelector('[name=grade_observation]').value
    if (grade_observation_description.length) {
        let previous_grade_observation = app._data.grade_observations.find(grade_observation =>
            grade_observation.council_id === app._data.current_council.id &&
            grade_observation.grade_id === app._data.current_grade_id &&
            grade_observation.subject_id === app._data.current_subject_id &&
            grade_observation.user_id === app._data.user.id
        )
        save_promises.push(save_resource('grade_observation', {
            ...base_evaluation,
            description: grade_observation_description,
            id: previous_grade_observation ? previous_grade_observation.id : null
        }, false))
    }

    return Promise.all(save_promises).then(() => {
        return seed()
    }).then(() => {
        notify('Sucesso!', form.dataset.success, 'success')
        window.onbeforeunload = event => {
            event.returnValue = undefined
            return undefined
        }
    }).catch(error => {
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}