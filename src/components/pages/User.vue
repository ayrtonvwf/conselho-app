<template>
  <div>
    <h1 class="content-title"><i class="material-icons">person</i>Usuário</h1>
    <div class="row justify-content-center">
      <div class="col-md-10 col-lg-8 col-xlg-6">
        <article class="box">
          <div class="box-body">
            <form action="#" data-success="Usuário editado com sucesso" data-error="Não foi possível editar o usuário" @submit.prevent="userUpdate">
              <div class="row">
                <div class="input col-sm-6">
                  <input id="user_name" name="name" :value="currentUser.name" minlength="3" required>
                  <label for="user_name">Nome completo</label>
                </div>
                <div class="input col-sm-6">
                  <input id="user_email" name="email" :value="currentUser.email" type="email" minlength="3" required>
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
                  <span class="material-icons">check</span> Salvar
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
export default {
  name: 'User',
  data () {
    return {}
  },

  computed: {
    currentUser () {
      const user = this.$store.getters['users/getUsers'].find(user =>
        user.id === this.$store.state.token.user_id
      )

      return user || {}
    }
  },

  methods: {
    userUpdate (event) {
      const form = event.target
      const user = {
        id: this.currentUser.id,
        name: form.querySelector('[name=name]').value,
        email: form.querySelector('[name=email]').value
      }

      const password = form.querySelector('#password').value
      const rePassword = form.querySelector('#re_password').value

      if (password !== rePassword) {
        this.$emit('notify', 'Erro!', 'Os dois campos de senha devem ser iguais.', 'danger')
        return
      }

      if (password) {
        user.password = password
      }

      this.$emit('loading')

      return this.$store.dispatch('users/update', user).then(() => {
        this.$emit('notify', 'Sucesso!', 'Usuário editado com sucesso!', 'success')
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível editar seu usuário.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    }
  }
}
</script>
