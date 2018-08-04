import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/pages/Index'
import Login from '@/components/pages/Login'
import TeacherRequest from '@/components/pages/TeacherRequest'
import Subject from '@/components/pages/Subject'
import Topic from '@/components/pages/Topic'
import Grade from '@/components/pages/Grade'
import Council from '@/components/pages/Council'
import Role from '@/components/pages/Role'
import Teacher from '@/components/pages/Teacher'
import User from '@/components/pages/User'
import Report from '@/components/pages/Report'
import Evaluate from '@/components/pages/Evaluate'

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
