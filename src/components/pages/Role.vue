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
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ role_type(user.id).name }}</td>
            <td>{{ user.email }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </article>
    <modal anchor="modal-new" title="Novo usuário">
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
                  <option v-for="role_type in role_types" :value="role_type.id" :key="role_type.id">{{ role_type.name }}</option>
                </select>
                <label>Tipo de usuário</label>
              </div>
            </div><br><br><a class="btn-danger" href="#">
              <div class="material-icons">close</div>  Cancelar</a>
            <button class="btn-success pull-right" type="submit">
              <div class="material-icons">check</div>  Salvar
            </button><br>
          </form>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'Role',
  data: function() {
    return {
      users: [],
      role_types: [],
      roles: []
    }
  },
  methods: {
    role_type (user_id) {
      let role = this.roles.find(role => role.user_id === user_id && parseInt(role.approved))

      if (!role) {
        return {}
      }

      return this.role_types.find(role_type => role_type.id === role.role_type_id)
    },
    user_save (event) {
      let app = this.$parent

      let form = event.target

      let user = {
        name: form.querySelector('[name=name]').value,
        email: form.querySelector('[name=email]').value,
        password: form.querySelector('[name=password]').value
      }

      let role = {
        role_type_id: form.querySelector('[name=role_type_id]').value
      }

      if (user.password !== form.querySelector('[name=re_password]').value) {
        this.$emit('notify', 'Erro!', 'As senhas informadas devem ser iguais!', 'danger')
        return
      }

      this.$emit('loading')

      app.save_resource('user', user, true, false).then(saved_user => {
        user = saved_user
        role.user_id = user.id
        this.users.push(user)
        let user_token = {
          email: user.email,
          password: user.password
        }
        return app.api_fetch('user_token', 'POST', user_token).then(response => response.json())
      }).then(user_token => {
        return app.save_resource('role', role, true, false, { Token: user_token.value })
      }).then(saved_role => {
        role = saved_role
        role.approved = true
        return app.save_resource('role', role, true, false)
      }).then(role => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        document.location.hash = ''
        this.roles.push(role)
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    }
  },
  beforeCreate() {
    this.$emit('loading')
  },
  created() {
    let db = this.$parent.db

    this.users = []
    this.role_types = []
    this.roles = []

    let promises = []

    promises.push(db.users.toArray().then(users =>
      this.users = users.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true })
      )
    ))
    promises.push(db.role_types.toArray().then(role_types =>
      this.role_types = role_types
    ))
    promises.push(db.roles.toArray().then(roles =>
      this.roles = roles
    ))

    Promise.all(promises).then(() =>
      this.$emit('loaded')
    )
  }
}
</script>
