let db = new Dexie('conselho')
db.version(1).stores({
    councils: 'id',
    council_grades: 'id',
    council_topics: 'id',
    evaluations: 'id, [council_id+grade_id], [council_id+grade_id+subject_id]',
    grades: 'id',
    grade_subjects: 'id',
    grade_observations: 'id',
    medical_reports: 'id',
    medical_report_subjects: 'id',
    permissions: 'id',
    roles: 'id',
    role_types: 'id',
    role_type_permissions: 'id',
    schools: 'id',
    students: 'id',
    student_observations: 'id',
    student_grades: 'id',
    subjects: 'id',
    teachers: 'id',
    teacher_requests: 'id',
    topics: 'id',
    topic_options: 'id',
    users: 'id'
})
db.open().catch(error => {
    console.error("Open failed: " + error.stack);
})

function set_load(state) {
    if (state === undefined) {
        state = true
    }
    app.loading = !!state
}

let data = {
    pathname: document.location.pathname,
    token: {},
    user: {},
    current_council: {},
    notification: {},
    new_topic_options: [{default: 1}],
    updated_evaluations: '',

    current_grade_id: '',
    current_subject_id: '',
    loading: true
}

let load_data_from_cache = window.localStorage.getItem('has_loaded_data')

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
    logout()
}

let filter_evaluations = function() {
    if (!this.current_grade_id || !this.current_council.id) {
        this.evaluations = []
        return
    }
    this.loading = true

    let index
    let equals
    if (this.current_subject_id) {
        index = '[council_id+grade_id+subject_id]'
        equals = [this.current_council.id, this.current_grade_id, this.current_subject_id]
    } else {
        index = '[council_id+grade_id]'
        equals = [this.current_council.id, this.current_grade_id]
    }

    return db.evaluations.where(index).equals(equals).toArray().then(evaluations => {
        this.evaluations = evaluations
        this.loading = false
    })
}
let app = new Vue({
    el: '#app',
    data: data,
    watch: {
        current_grade_id: filter_evaluations,
        current_subject_id: filter_evaluations
    },
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
                evaluation.student_id === parseInt(student_id) &&
                evaluation.subject_id === this.current_subject_id &&
                evaluation.user_id === this.user.id &&
                this.topic_options.find(topic_option =>
                    topic_option.id === evaluation.topic_option_id &&
                    topic_option.topic_id === parseInt(topic_id)
                ) !== undefined
            )

            return evaluation === undefined ? '' : evaluation.topic_option_id
        },
        reportStudentTopic(student_id, topic_id) {
            let topic_options = this.orderedTopicOptions(topic_id)

            let evaluations = this.evaluations.filter(evaluation =>
                evaluation.student_id === student_id &&
                topic_options.find(topic_option =>
                    topic_option.id === evaluation.topic_option_id
                ) !== undefined
            )

            if (!evaluations.length) {
                return '-'
            }

            let values = evaluations.map(evaluation =>
                parseInt(topic_options.find(topic_option => topic_option.id === evaluation.topic_option_id).value)
            )

            let sum = values.reduce((a, b) => a + b)
            let avg = parseInt(sum / values.length)

            let topic_options_values = topic_options.map(topic_option => topic_option.value)

            let nearest_value = parseInt(topic_options_values.reduce(function(prev, curr) {
                return (Math.abs(curr - avg) < Math.abs(prev - avg) ? curr : prev);
            }))

            return topic_options.find(topic_option => parseInt(topic_option.value) === nearest_value).name + ' ('+avg+'%)'
        },
        studentGrade(student_id) {
            return this.student_grades.find(student_grade =>
                parseInt(student_grade.grade_id) === parseInt(this.current_grade_id) &&
                parseInt(student_grade.student_id) === parseInt(student_id)
            )
        }
    },
    computed: {
        studentsInGrade() {
            if (!this.current_grade_id) {
                return undefined
            }
            return this.students.filter(student => this.studentGrade(student.id, this.current_grade_id) !== undefined)
        },
        currentGrade() {
            if (!this.current_grade_id) {
                return undefined
            }
            return this.grades.find(grade => parseInt(grade.id) === parseInt(this.current_grade_id))
        },
        councilTopics() {
            return this.topics.filter(topic =>
                this.council_topics.find(council_topic =>
                    council_topic.topic_id === topic.id &&
                    council_topic.council_id === this.current_council.id
                ) !== undefined
            )
        },
        subjectsInGrade() {
            if (!this.current_grade_id) {
                return undefined
            }
            return this.subjects.filter(subject =>
                this.grade_subjects.find(grade_subject =>
                    grade_subject.subject_id === subject.id &&
                    grade_subject.grade_id === this.current_grade_id
                )
            )
        },
        gradeObservations() {
            if (!this.current_grade_id) {
                return undefined
            }
            return this.grade_observations.filter(grade_observation =>
                parseInt(grade_observation.grade_id) === parseInt(this.current_grade_id) &&
                parseInt(grade_observation.council_id) === parseInt(this.current_council.id) &&
                grade_observation.description.length &&
                (
                    !this.current_subject_id ||
                    parseInt(grade_observation.subject_id) === parseInt(this.current_subject_id)
                )
            )
        }
    }
})

function get_resource(name) {
    return api_fetch(name)
        .then(response => response.json())
        .then(response_data => {
            let return_data = response_data.results

            let max = parseInt(response_data.max_results_per_page)
            let total = parseInt(response_data.total_results)

            let remaining_pages = Math.floor(total/max)

            if (total === max || !remaining_pages) {
                return return_data
            }

            let remaining_requisitions = []
            for (let i = 1; i <= remaining_pages; i++) {
                remaining_requisitions.push(api_fetch(name, 'GET', {page: i+1}).then(remaining_response => remaining_response.json()))
            }

            return Promise.all(remaining_requisitions).then(remaining_responses => {
                remaining_responses.forEach(remaining_response_data => {
                    return_data = return_data.concat(remaining_response_data.results)
                })
                return return_data
            })
        })
}

function seed(needed_resources) {
    if (needed_resources === undefined) {
        needed_resources = resources
    } else if (typeof needed_resources === 'string') {
        needed_resources = [needed_resources]
    }

    app.loading = true

    let promises = []

    let fetched_data = {}

    needed_resources.forEach(resource => {
        if (load_data_from_cache) {
            promises.push(db[resource+'s'].toArray().then(data => {
                fetched_data[resource+'s'] = data
            }))
        } else {
            let promise = get_resource(resource)
                .then(data => {
                    fetched_data[resource + 's'] = data
                    return db[resource+'s'].bulkPut(parseObjects(data))
                })

            promises.push(promise)
        }
    })

    load_data_from_cache = false

    return Promise.all(promises).then(() => {
        window.localStorage.setItem('has_loaded_data', true)
        let app_data = app
        needed_resources.forEach(resource => {
            if (resource === 'evaluation') {
                return
            }
            app_data[resource+'s'] = fetched_data[resource+'s']
        })

        app_data.user = app_data.users.find(user => parseInt(user.id) === token.user_id)

        if (document.location.pathname.endsWith('evaluate.html') || document.location.pathname.endsWith('report.html')) {
            let current_council_id = parseInt(new URL(document.location.href).searchParams.get('id'))
            app_data.current_council = app_data.councils.find(council => council.id === current_council_id)
        }

        app_data.loading = false

        app = app_data
    })
}

seed()

function serialize(obj) {
    let str = [];
    for (let p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
    }
    return str.join('&');
}

function api_fetch(path, method, body, headers) {
    if (method === undefined) {
        method = 'GET'
    }

    if (method === 'GET' || method === 'DELETE') {
        if (body !== undefined) {
            path += '?'+serialize(body)
            body = undefined
        }
    } else {
        body.school_id = 1
        body = JSON.stringify(parseObject(body))
    }

    if (headers === undefined) {
        headers = {}
    }

    headers = new Headers(headers)
    headers.set('Timezone', '-03:00')
    headers.set('Accept', 'application/json; charset=UTF-8')
    headers.set('Content-Type', 'application/json')
    headers.set('Token', token.value)

    let url = 'http://localhost/conselho-server/'+path
    let options = {
        headers: headers,
        method: method,
        mode: 'cors',
        body: body
    }

    return fetch(url, options).then(response => {
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

    app.loading = true

    save_resource(resource, data, false).then(() => {
        return seed(resource)
    }).then(() => {
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function delete_resource(resource_name, id, notification, reload_view) {
    document.location.hash = '' // closes modal

    if (notification === undefined) {
        notification = true
    }

    if (reload_view === undefined) {
        reload_view = true
    }

    app.loading = true
    return api_fetch(resource_name+'/'+id, 'DELETE').then(() => {
        return db[resource_name+'s'].delete(id)
    }).then(() => {
        if (reload_view) {
            return db[resource_name+'s'].toArray().then(all_data => app[resource_name+'s'] = all_data)
        }
    }).then(() => {
        if (notification) {
            app.loading = false
            notify('Sucesso!', 'Excluído com sucesso', 'success')
        }
    }).catch(() => {
        if (notification) {
            app.loading = false
            notify('Erro!', 'Não foi possível excluir', 'danger')
        }
    })
}

function save_resource(resource_name, data, save_to_db, update_view) {
    if (save_to_db === undefined) {
        save_to_db = true
    }
    if (save_to_db && update_view === undefined) {
        update_view = true
    }

    let path = resource_name
    let method = 'POST'

    if (data.id) {
        path += '/'+data.id
        method = 'PATCH'
    } else {
        delete data.id
    }

    return api_fetch(path, method, data).then(response => {
        return response.json()
    }).then((json) => {
        if (json.id) {
            data.id = parseInt(json.id)
        }
        if (json.created_at) {
            data.created_at = json.created_at
        }
        if (json.updated_at) {
            data.updated_evaluations = json.updated_at
        }
        if (save_to_db) {
            return db[resource_name+'s'].put(data)
        }
    }).then(() => {
        if (update_view) {
            return db[resource_name+'s'].toArray().then(all_data => app[resource_name+'s'] = all_data)
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

function logout() {
    if ('app' in window) {
        app.loading = true
    }
    localStorage.removeItem('token')
    localStorage.removeItem('has_loaded_data')
    db.delete().then(() => {
        location.href = 'login.html'
    })
}

function parseObject(object) {
    let properties = Object.keys(object)
    properties.forEach(property => {
        if (object[property] === null || object[property] === undefined) {
            return
        }

        if (object[property].toString() === parseInt(object[property]).toString()) {
            object[property] = parseInt(object[property]) // "int" to int
        } else if (object[property].toString() === parseFloat(object[property]).toString()) {
            object[property] = parseFloat(object[property]) // "float" to float
        } else if (object[property] === !!object[property]) {
            object[property] = object[property] ? 1 : 0 // bool to int
        }
    })
    return object
}

function parseObjects(object_array) {
    return object_array.map(object => parseObject(object))
}

// specific resource operations

function subject_save(event) {
    event.preventDefault()

    app.loading = true

    document.location.hash = '' // closes the current modal

    let form = event.target
    let subject = parseObject({
        name: form.querySelector('[name=name]').value,
        active: true
    })

    return save_resource('subject', subject).then(() => {
        app.loading = false
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function subject_update(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    app.loading = true

    let form = event.target
    let subject = parseObject({
        id: form.querySelector('[name=id]').value,
        name: form.querySelector('[name=name]').value,
        active: !!form.querySelector('[name=active]').checked
    })

    return save_resource('subject', subject).then(() => {
        app.loading = false
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function topic_save(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    app.loading = true

    let form = event.target
    let topic = {
        name: form.querySelector('[name=name]').value,
        active: true,
        topic_option_id: null
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

    return save_resource('topic', topic, true, false).then(response => {
        topic.id = response.id

        let save_options = []

        options.forEach(option => {
            option.topic_id = response.id
            save_options.push(save_resource('topic_option', option, true, false))
        })

        return Promise.all(save_options)
    }).then(promises_response => {
        if (default_option_index === -1) {
            return;
        }

        topic.topic_option_id = promises_response[default_option_index].id
        return save_resource('topic', topic, false)
    }).then(() => {
        return Promise.all([
            db.topics.toArray().then(data => app.topics = data),
            db.topic_options.toArray().then(data => app.topic_options = data)
        ])
    }).then(() => {
        app.loading = false
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function topic_update(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    app.loading = true

    let form = event.target

    let option_id_inputs = form.querySelectorAll('[name="option_id[]"]')
    let option_ids = [].map.call(option_id_inputs, input => input.value)

    let option_name_inputs = form.querySelectorAll('[name="option_name[]"]')
    let option_names = [].map.call(option_name_inputs, input => input.value)

    let option_value_inputs = form.querySelectorAll('[name="option_value[]"]')
    let option_values = [].map.call(option_value_inputs, input => input.value)

    let option_default_inputs = form.querySelectorAll('[name=option_default]')
    let option_defaults = [].map.call(option_default_inputs, input => input.checked)
    let default_option_index = option_defaults.indexOf(true)

    let topic = {
        id: form.querySelector('[name=id]').value,
        name: form.querySelector('[name=name]').value,
        active: form.querySelector('[name=active]').checked,
        topic_option_id: option_ids[default_option_index] ? option_ids[default_option_index] : null
    }

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

    return save_resource('topic', topic, true, false).then(response => {
        let save_options = []

        options.forEach(option => {
            save_options.push(save_resource('topic_option', option, true, false))
        })

        return Promise.all(save_options)
    }).then(() => {
        return Promise.all([
            db.topics.toArray().then(data => app.topics = data),
            db.topic_options.toArray().then(data => app.topic_options = data)
        ])
    }).then(() => {
        app.loading = false
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function grade_save(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    app.loading = true

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
            }, true, false))
        })

        return Promise.all(save_grade_subjects)
    }).then(() => {
        return db.grade_subjects.toArray().then(all_data => app.grade_subjects = all_data)
    }).then(() => {
        app.loading = false
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function grade_update(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    app.loading = true

    let form = event.target
    let grade = {
        id: form.querySelector('[name=id').value,
        name: form.querySelector('[name=name]').value,
        level: form.querySelector('[name=level]').value,
        active: form.querySelector('[name=active]').checked
    }

    return save_resource('grade', grade).then(() => {
        app.loading = false
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function student_save(event) {
    event.preventDefault()

    app.loading = true

    let form = event.target
    let student = {
        name: form.querySelector('[name=name]').value,
        active: true
    }

    let student_grade = {
        grade_id: form.querySelector('[name=grade_id]').value,
        number: form.querySelector('[name=number]').value,
        start_date: '2018-01-01',
        end_date: '2018-12-31'
    }
    return save_resource('student', student, true, false).then(response => {
        student.id = response.id
        student_grade.student_id = response.id
        return save_resource('student_grade', student_grade, true, false)
    }).then((response) => {
        student_grade.id = response.id
        app.students.push(student)
        app.student_grades.push(student_grade)
    }).then(() => {
        app.loading = false
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function student_toggle(student_id) {
    let student_grade = app.student_grades.find(student_grade => parseInt(student_grade.student_id) === student_id)
    student_grade.end_date = new Date(student_grade.end_date) <= new Date() ? '2018-12-31' : new Date().toISOString().slice(0, 10)

    app.loading = true
    return save_resource('student_grade', student_grade).then(() => {
        notify('Sucesso!', '', 'success')
        app.loading = false
    }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        notify('Erro!', '', 'danger')
    })
}

function council_save(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    app.loading = true

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

        app.grades.forEach(grade => {
            save_council_grades.push(save_resource('council_grade', {
                grade_id: grade.id,
                council_id: response.id
            }))
        })
        return Promise.all(save_council_topics.concat(save_council_grades))
    }).then(() => {
        app.loading = false
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function council_update(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    app.loading = true

    let form = event.target
    let council = {
        id: form.querySelector('[name=id]').value,
        name: form.querySelector('[name=name]').value,
        start_date: form.querySelector('[name=start_date]').value,
        end_date: form.querySelector('[name=end_date]').value,
        active: true
    }

    return save_resource('council', council).then(() => {
        app.loading = false
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function accept_teacher_request(teacher_request_id) {
    let teacher_request = app.teacher_requests.find(teacher_request => parseInt(teacher_request.id) === teacher_request_id)

    app.loading = true

    let teacher = {
        user_id: teacher_request.user_id,
        grade_id: teacher_request.grade_id,
        subject_id: teacher_request.subject_id,
        start_date: '2018-01-01',
        end_date: '2018-12-31'
    }
    save_resource('teacher', teacher).then(() => {
        return delete_resource('teacher_request', teacher_request_id)
    }).then(() => {
        app.loading = false
        notify('Sucesso!', 'Professor aceitado com sucesso', 'success')
    }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        notify('Erro!', 'Não foi possível aceitar o professor', 'danger')
    })
}

function deny_teacher_request(teacher_request_id) {
    app.loading = true
    delete_resource('teacher_request', teacher_request_id).then(() => {
        app.loading = false
        notify('Sucesso!', 'Professor negado com sucesso', 'success')
    }).catch(error => {
        app.loading = false
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

    app.loading = true

    app.loading = false
    return ;

    let form = event.target

    let base_evaluation = {
        council_id: app.current_council.id,
        grade_id: app.current_grade_id,
        subject_id: app.current_subject_id,
        user_id: app.user.id
    }

    let evaluations = []
    let student_observations = []

    let student_rows = form.querySelectorAll('[data-student_id]')
    student_rows.forEach(student_row => {
        let topic_selects = student_row.querySelectorAll('[data-topic_id]')
        topic_selects.forEach(topic_select => {
            let previous_evaluation = app.evaluations.find(existent_evaluation =>
                existent_evaluation.council_id === app.current_council.id &&
                existent_evaluation.grade_id === app.current_grade_id &&
                existent_evaluation.student_id === parseInt(student_row.dataset.student_id) &&
                existent_evaluation.subject_id === app.current_subject_id &&
                existent_evaluation.user_id === app.user.id &&
                app.topic_options.find(topic_option =>
                    topic_option.id === existent_evaluation.topic_option_id &&
                    topic_option.topic_id === parseInt(topic_select.dataset.topic_id)
                ) !== undefined
            )

            evaluations.push({
                ...base_evaluation,
                student_id: parseInt(student_row.dataset.student_id),
                topic_id: parseInt(topic_select.dataset.topic_id),
                topic_option_id: topic_select.value,
                id: previous_evaluation ? previous_evaluation.id : null
            })

        })

        let student_observation = student_row.querySelector('textarea').value
        if (!student_observation.length) {
            return
        }

        let previous_observation = app.student_observations.find(existent_observation =>
            existent_observation.council_id === app.current_council.id &&
            existent_observation.grade_id === app.current_grade_id &&
            existent_observation.student_id === parseInt(student_row.dataset.student_id) &&
            existent_observation.subject_id === app.current_subject_id &&
            existent_observation.user_id === app.user.id
        )

        student_observations.push({
            ...base_evaluation,
            student_id: parseInt(student_row.dataset.student_id),
            description: student_observation,
            id: previous_observation ? previous_observation.id : null
        })
    })

    let evaluation_promises = []
    evaluations.forEach(evaluation => {
        evaluation_promises.push(save_resource('evaluation', evaluation, false))
    })
    let student_observation_promises = []
    student_observations.forEach(student_observation => {
        student_observation_promises.push(save_resource('student_observation', student_observation, false))
    })

    let grade_observation_description = form.querySelector('[name=grade_observation]').value
    let grade_observation_promise
    if (grade_observation_description.length) {
        let previous_grade_observation = app.grade_observations.find(grade_observation =>
            grade_observation.council_id === app.current_council.id &&
            grade_observation.grade_id === app.current_grade_id &&
            grade_observation.subject_id === app.current_subject_id &&
            grade_observation.user_id === app.user.id
        )
        grade_observation_promise = save_resource('grade_observation', {
            ...base_evaluation,
            description: grade_observation_description,
            id: previous_grade_observation ? previous_grade_observation.id : null
        }, false)
    }

    let save_promises = [
        Promise.all(evaluation_promises).then(evaluation_results =>
            db.evaluations.bulkPut(evaluation_results)
        ),
        Promise.all(student_observation_promises).then(student_observation_results =>
            db.student_observations.bulkPut(student_observation_results)
        ),
        grade_observation_promise.then(grade_observation_result =>
            db.grade_observations.put(grade_observation_result)
        )
    ]

    return Promise.all(save_promises).then(() => filter_evaluations())
    .then(() => {
        notify('Sucesso!', form.dataset.success, 'success')
        window.onbeforeunload = undefined
        app.loading = false
    }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}