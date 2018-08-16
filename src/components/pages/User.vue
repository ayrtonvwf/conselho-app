<template>
  <div>
    <h1 class="content-title"><i class="material-icons">person</i>Usuário</h1>
    <div class="row justify-content-center">
      <div class="col-md-10 col-lg-8 col-xlg-6">
        <article class="box">
          <div class="box-body">
            <form action="#" data-success="Usuário editado com sucesso" data-error="Não foi possível editar o usuário" @submit.prevent="user_update">
              <div class="row">
                <div class="input col-sm-6">
                  <input id="user_name" name="name" :value="user.name" minlength="3" required>
                  <label for="user_name">Nome completo</label>
                </div>
                <div class="input col-sm-6">
                  <input id="user_email" name="email" :value="user.email" type="email" minlength="3" required>
                  <label for="user_email">E-mail</label>
                </div>
              </div>
              <div class="row">
                <div class="input col-sm-6">
                  <input id="password" type="password" minlength="5" placeholder="Apenas caso queira alterar">
                  <label for="password">Nova senha</label>
                </div>
                <div class="input col-sm-6">
                  <input id="re_password" type="password" minlength="5" placeholder="Para conferir se digitou corretamente">
                  <label for="re_password">Repita a senha</label>
                </div>
              </div>
              <div class="text-right">
                <button class="btn-success">
                  <div class="material-icons">check</div> Salvar
                </button>
              </div>
            </form>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'User',
  data: function() {
    return {
      user: {}
    }
  },
  methods: {
    user_update (event) {
      let form = event.target
      let user = {
        id: this.user.id,
        name: form.querySelector('[name=name]').value,
        email: form.querySelector('[name=email]').value
      }

      let password = form.querySelector('#password').value
      let re_password = form.querySelector('#re_password').value

      if (password !== re_password) {
        this.$emit('notify', 'Erro!', 'Os dois campos de senha devem ser iguais!', 'danger')
        return
      }

      if (password) {
        user.password = password
      }

      this.$emit('loading')

      let api_fetch = {
        path: 'user',
        method: 'PATCH',
        body: user
      }
      return this.$store.dispatch('api_fetch', api_fetch).then(() => {
        delete user.password
        return this.$store.dispatch('db_put', {name: 'users', data: user})
      }).then(() => {
        this.$store.commit('updateItem', { name: 'users', data: user })
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    }
  },
  created() {
    let current_user_id = parseInt(this.$store.state.token.user_id)
    this.user = this.$store.state.users.find(user => user.id === current_user_id)
  }
}
</script>
