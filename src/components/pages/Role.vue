<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h1 class="content-title"><i class="material-icons">people</i>Usuários</h1>
      </div>
      <div class="col text-right"><a class="btn-success btn-sm no-wrap" href="#modal-new">
        <div class="material-icons">add</div> Criar novo usuário</a></div>
    </div>
    <article class="box">
      <div class="box-body">
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>E-mail</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in orderedUsers" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ role_type(user.id).name }}</td>
              <td>{{ user.email }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
    <modal anchor="modal-new" title="Novo usuário" ref="modalNew">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Usuário cadastrado com sucesso" data-error="Não foi possível cadastrar o usuário" @submit.prevent="user_save"><br>
            <div class="row">
              <div class="col-sm-6 input">
                <input required placeholder="Ex.: João da Silva" name="name" minlength="3">
                <label>Nome</label>
              </div>
              <div class="col-sm-6 input">
                <input required placeholder="Ex.: joao@email.com" name="email" type="email" minlength="3">
                <label>E-mail</label>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-6 input">
                <input required placeholder="Ao menos 5 caracteres" name="password" type="password" minlength="5">
                <label>Senha</label>
              </div>
              <div class="col-sm-6 input">
                <input required placeholder="Igual à anterior" name="re_password" type="password" minlength="5">
                <label>Repita a senha</label>
              </div>
            </div>
            <div class="row justify-content-center">
              <div class="col-sm-6 input">
                <select required name="role_type_id">
                  <option value="" selected disabled hidden>Selecione...</option>
                  <option v-for="role_type in orderedRoleTypes" :value="role_type.id" :key="role_type.id">{{ role_type.name }}</option>
                </select>
                <label>Tipo de usuário</label>
              </div>
            </div><br><br><a class="btn-danger" href="#">
              <div class="material-icons">close</div>  Cancelar</a>
            <button class="btn-success pull-right" type="submit">
              <span class="material-icons">check</span>  Salvar
            </button><br>
          </form>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Role',
  data () {
    return {}
  },
  computed: {
    orderedUsers () {
      return this.$store.getters['users/getOrderedUsers']
    },

    orderedRoleTypes () {
      return this.$store.getters['role_types/getOrderedRoleTypes']
    }
  },
  methods: {
    role_type (userId) {
      const role = this.$store.getters['roles/getRoles'].find(role =>
        role.user_id === userId &&
        parseInt(role.approved)
      )

      if (!role) {
        return {}
      }

      return this.$store.getters['role_types/getRoleTypes'].find(roleType =>
        roleType.id === role.role_type_id
      )
    },
    user_save (event) {
      const form = event.target

      const user = {
        name: form.querySelector('[name=name]').value,
        email: form.querySelector('[name=email]').value,
        password: form.querySelector('[name=password]').value
      }

      const role = {
        role_type_id: form.querySelector('[name=role_type_id]').value,
        approved: true
      }

      if (user.password !== form.querySelector('[name=re_password]').value) {
        this.$emit('notify', 'Erro!', 'As senhas informadas devem ser iguais!', 'danger')
        return
      }

      this.$emit('loading')

      const currentUserToken = axios.defaults.headers.common['Token'] + ''

      this.$store.dispatch('users/create', user).then(response => {
        user.id = response.id
        user.created_at = response.created_at
        user.updated_at = response.created_at

        role.user_id = user.id

        return axios.post('/user_token', user)
      }).then(response => {
        axios.defaults.headers.common['Token'] = response.data.value
        return this.$store.dispatch('roles/create', role)
      }).then(response => {
        role.id = response.id
        role.created_at = response.created_at
        role.updated_at = response.created_at

        axios.defaults.headers.common['Token'] = currentUserToken

        return this.$store.dispatch('roles/update', role)
      }).then(() => {
        this.$emit('notify', 'Sucesso!', 'Usuário criado com sucesso!', 'success')

        this.$refs.modalNew.close()

        form.querySelector('[name=name]').value = ''
        form.querySelector('[name=email]').value = ''
        form.querySelector('[name=password]').value = ''
        form.querySelector('[name=role_type_id]').value = ''
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível criar o usuário.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    }
  }
}
</script>
