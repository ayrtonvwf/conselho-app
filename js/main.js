var data = {
    pathname: document.location.pathname,
    token: {
        value: '',
        expires_at: ''
    },
    user: {
        id: 1,
        name: 'Ayrton Fidelis'
    },
    notifications: [
        {
            title: "Trim the grass",
            description: "John Doe",
            date: "today"
        }, {
            title: "Clean the kitchen",
            description: "Ayrton Fidelis",
            date: "yesterday"
        }
    ],
    councils: [
        {
            id: 1,
            active: true,
            name: '3° Trimestre 2018',
            start_date: '2018-08-01',
            end_date: '2018-09-01'
        }, {
            id: 2,
            active: true,
            name: '2° Trimestre 2018',
            start_date: '2018-06-01',
            end_date: '2018-07-01'
        }, {
            id: 3,
            active: false,
            name: '2° Trimestre 2018',
            start_date: '2018-06-01',
            end_date: '2018-07-01'
        }, {
            id: 4,
            active: false,
            name: '2° Trimestre 2017',
            start_date: '2017-08-01',
            end_date: '2017-09-01'
        }, {
            id: 5,
            active: false,
            name: '1° Trimestre 2017',
            start_date: '2017-04-01',
            end_date: '2017-05-01'
        }
    ], // council grades, council topics
    evaluations: [],
    grades: [
        {
            id: 1,
            name: '1° ano A',
            level: 1,
            active: true
        }, {
            id: 2,
            name: '1° ano B',
            level: 1,
            active: true
        }, {
            id: 3,
            name: '2° ano A',
            level: 2,
            active: true
        }, {
            id: 4,
            name: '2° ano B',
            level: 2,
            active: false
        }
    ], // grade subjects, grade observations
    medical_reports: [], // medical report subjects
    permissions: [],
    roles: [],
    role_types: [], // role type permissions
    school: {},
    students: [ // student grades, student observations
        {
            id: 1,
            name: 'Ayrton Fidelis'
        }, {
            id: 2,
            name: 'John Doe'
        }, {
            id: 3,
            name: 'João José'
        }, {
            id: 4,
            name: 'Maria José'
        }, {
            id: 5,
            name: 'Galvão Bueno'
        }
    ],
    subjects: [],
    teachers: [],
    teacher_requests: [],
    topics: [
        {
            id: 1,
            active: true,
            name: 'Facilidade de aprendizado',
            default: 2,
            options: [
                {
                    id: 1,
                    active: true,
                    name: 'Acima da média',
                    value: 100
                }, {
                    id: 2,
                    active: true,
                    name: 'Regular',
                    value: 50
                }, {
                    id: 3,
                    active: true,
                    name: 'Abaixo da média',
                    value: 0
                }
            ]
        },
        {
            id: 2,
            active: true,
            name: 'Tarefas de casa',
            default: 2,
            options: [
                {
                    id: 1,
                    active: true,
                    name: 'Sempre no prazo',
                    value: 100
                }, {
                    id: 2,
                    active: true,
                    name: 'Algumas vezes atraza',
                    value: 75
                }, {
                    id: 3,
                    active: true,
                    name: 'Atraza mas faz',
                    value: 50
                }, {
                    id: 4,
                    active: true,
                    name: 'Algumas vezes faz, outras não',
                    value: 25
                }, {
                    id: 5,
                    active: true,
                    name: 'Geralmente não faz',
                    value: 0
                }, {
                    id: 6,
                    active: false,
                    name: 'Nunca faz',
                    value: 0
                }
            ]
        },
        {
            id: 3,
            active: true,
            name: 'Atividades de sala',
            default: 1,
            options: [
                {
                    id: 1,
                    active: true,
                    name: 'Sempre faz',
                    value: 100
                }, {
                    id: 2,
                    active: true,
                    name: 'Algumas vezes faz, outras não',
                    value: 66
                }, {
                    id: 3,
                    active: true,
                    name: 'Não faz mas não atrapalha',
                    value: 33
                }, {
                    id: 4,
                    active: true,
                    name: 'Não faz e atrapalha',
                    value: 0
                }
            ]
        },
        {
            id: 4,
            active: true,
            name: 'Frequência',
            default: 2,
            options: [
                {
                    id: 1,
                    active: true,
                    name: 'Sempre está presente',
                    value: 100
                }, {
                    id: 2,
                    active: true,
                    name: 'Falta poucas vezes',
                    value: 66
                }, {
                    id: 3,
                    active: true,
                    name: 'Falta bastate',
                    value: 33
                }, {
                    id: 4,
                    active: true,
                    name: 'Nunca está presente',
                    value: 0
                }
            ]
        },
        {
            id: 5,
            active: true,
            name: 'Disciplina',
            default: 1,
            options: [
                {
                    id: 1,
                    active: true,
                    name: 'Excelente',
                    value: 100
                }, {
                    id: 2,
                    active: true,
                    name: 'Boa',
                    value: 66
                }, {
                    id: 3,
                    active: true,
                    name: 'Pode melhorar',
                    value: 33
                }, {
                    id: 4,
                    active: true,
                    name: 'Ruim',
                    value: 0
                }
            ]
        },
        {
            id: 6,
            active: true,
            name: 'Provas',
            default: 1,
            options: [
                {
                    id: 1,
                    active: true,
                    name: 'Realizou todas',
                    value: 100
                }, {
                    id: 2,
                    active: true,
                    name: 'Não realizou alguma',
                    value: 0
                }
            ]
        },
        {
            id: 7,
            active: true,
            name: 'Material',
            default: 1,
            options: [
                {
                    id: 1,
                    active: true,
                    name: 'Sempre traz',
                    value: 100
                }, {
                    id: 2,
                    active: true,
                    name: 'Algumas vezes traz, outras não',
                    value: 50
                }, {
                    id: 3,
                    active: true,
                    name: 'Geralmente não traz',
                    value: 0
                }
            ]
        },
        {
            id: 9,
            active: false,
            name: 'Conversa',
            default: 2,
            options: [
                {
                    id: 1,
                    active: true,
                    name: 'Quieto',
                    value: 100
                }, {
                    id: 2,
                    active: true,
                    name: 'Conversa pouco',
                    value: 66
                }, {
                    id: 3,
                    active: true,
                    name: 'Conversa bastate',
                    value: 33
                }, {
                    id: 4,
                    active: true,
                    name: 'Conversa demais',
                    value: 0
                }
            ]
        }
    ], // topic options
    users: [
        {
            id: 1,
            name: 'Ayrton Fidelis'
        }, {
            id: 2,
            name: 'John Doe'
        }
    ]
}

if (document.location.pathname.endsWith('evaluate.html')) {
    let current_council_id = new URL(document.location.href).searchParams.get('id')
    data.current_council = data.councils.find(function(council) {
        return council.id == current_council_id;
    })
}

var app = new Vue({
    el: '#app',
    data: data
})