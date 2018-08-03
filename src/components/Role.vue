<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h1 class="content-title"><i class="material-icons">people</i>Usuários</h1>
      </div>
      <div class="col text-right"><a class="btn-success btn-sm no-wra" href="#modal-new">
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
    <modal anchor="modal-new" title="Novo usuário">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Usuário cadastrado com sucesso" data-error="Não foi possível cadastrar o usuário" @submit="user_save"><br>
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
    return this.$parent.$data
  },
  computed: {
    orderedUsers () {
      return this.users.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true }))
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
      event.preventDefault()

      let component = this
      let app = this.$parent

      let form = event.target

      let data = {
        name: form.querySelector('[name=name]').value,
        email: form.querySelector('[name=email]').value,
        password: form.querySelector('[name=password]').value
      }

      let role = {
        role_type_id: form.querySelector('[name=role_type_id]').value
      }

      if (data.password !== form.querySelector('[name=re_password]').value) {
        app.notify('Erro!', 'As senhas informadas devem ser iguais!', 'danger')
        return
      }

      app.loading = true

      app.save_resource('user', data).then(response => {
        data.id = response.id
        role.user_id = response.id
        return app.api_fetch('user_token', 'POST', data)
      }).then(response => {
        return response.json()
      }).then(response => {
        return app.save_resource('role', role, true, true, { Token: response.value })
      }).then(response => {
        role.id = response.id
        role.approved = true
        return app.save_resource('role', role)
      }).then(() => {
        app.notify('Sucesso!', form.dataset.success, 'success')
        document.location.hash = ''
      }).catch(error => {
        app.notify('Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.$forceUpdate()
      })
    }
  }
}
</script>
