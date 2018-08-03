import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/Index'
import Login from '@/components/Login'
import TeacherRequest from '@/components/TeacherRequest'
import Subject from '@/components/Subject'
import Topic from '@/components/Topic'
import Grade from '@/components/Grade'
import Council from '@/components/Council'
import Role from '@/components/Role'
import Teacher from '@/components/Teacher'
import User from '@/components/User'
import Report from '@/components/Report'
import Evaluate from '@/components/Evaluate'

Vue.use(Router)

// export default new Router({
let router = new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { title: 'Login' }
    }, {
      path: '/subject',
      name: 'Subject',
      component: Subject,
      meta: { title: 'Disciplinas' }
    }, {
      path: '/topic',
      name: 'Topic',
      component: Topic,
      meta: { title: 'Tópicos' }
    }, {
      path: '/grade',
      name: 'Grade',
      component: Grade,
      meta: { title: 'Turmas' }
    }, {
      path: '/teacher_request',
      name: 'TeacherRequest',
      component: TeacherRequest,
      meta: { title: 'Turmas' }
    }, {
      path: '/council',
      name: 'Council',
      component: Council,
      meta: { title: 'Conselhos de Classe' }
    }, {
      path: '/role',
      name: 'Role',
      component: Role,
      meta: { title: 'Usuários' }
    }, {
      path: '/teacher',
      name: 'Teacher',
      component: Teacher,
      meta: { title: 'Professores' }
    }, {
      path: '/user',
      name: 'User',
      component: User,
      meta: { title: 'Usuário' }
    }, {
      path: '/report/:id',
      name: 'Report',
      component: Report,
      meta: { title: 'Relatórios' }
    }, {
      path: '/evaluate/:id',
      name: 'Evaluate',
      component: Evaluate,
      meta: { title: 'Avaliar' }
    }, {
      path: '/',
      name: 'Index',
      component: Index
    }
  ]
})

router.beforeEach((to, from, next) => {
  let title = 'Conselho'
  if (to.meta.title) {
    title += ' - ' + to.meta.title
  }
  document.title = title
  document.location.hash = '' // closes modal
  next()
})
export default router
