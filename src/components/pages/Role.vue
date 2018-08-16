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
          <tr v-for="user in $store.state.users" :key="user.id">
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
                  <option v-for="role_type in $store.state.role_types" :value="role_type.id" :key="role_type.id">{{ role_type.name }}</option>
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
/* eslint camelcase: 0 */
export default {
  name: 'Role',
  data () {
    return {}
  },
  methods: {
    role_type (user_id) {
      const role = this.$store.state.roles.find(role =>
        role.user_id === user_id &&
        parseInt(role.approved)
      )

      if (!role) {
        return {}
      }

      return this.$store.state.role_types.find(role_type =>
        role_type.id === role.role_type_id
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
        role_type_id: form.querySelector('[name=role_type_id]').value
      }

      if (user.password !== form.querySelector('[name=re_password]').value) {
        this.$emit('notify', 'Erro!', 'As senhas informadas devem ser iguais!', 'danger')
        return
      }

      this.$emit('loading')

      const save_resource = {
        resource_name: 'user',
        data: user
      }
      this.$store.dispatch('save_resource', save_resource).then(user => {
        role.user_id = user.id
        const api_fetch = {
          path: 'user_token',
          method: 'POST',
          body: {
            email: user.email,
            password: user.password
          }
        }
        return this.$store.dispatch('api_fetch', api_fetch).then(response =>
          response.json()
        )
      }).then(user_token => {
        const save_resource = {
          resource_name: 'role',
          data: role,
          headers: {
            Token: user_token.value
          }
        }
        return this.$store.dispatch('save_resource', save_resource)
      }).then(role => {
        role.approved = true
        const save_resource = {
          resource_name: 'role',
          data: role
        }
        return this.$store.dispatch('save_resource', save_resource)
      }).then(() => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')

        this.$refs.modalNew.close()

        form.querySelector('[name=name]').value = ''
        form.querySelector('[name=email]').value = ''
        form.querySelector('[name=password]').value = ''
        form.querySelector('[name=role_type_id]').value = ''
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    }
  }
}
</script>
