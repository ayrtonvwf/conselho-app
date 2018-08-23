<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h1 class="content-title"><i class="material-icons">lock</i>Login</h1>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 col-lg-7 col-xlg-6">
        <article class="box">
          <div class="box-body">
            <form action="#" method="POST" v-on:submit.prevent="login"><br>
              <div class="row justify-content-center">
                <div class="col-11">
                  <div class="input">
                    <input name="email" required type="email" id="email">
                    <label for="email">
                      <span class="material-icons">email</span> E-mail
                    </label>
                  </div>
                  <div class="input">
                    <input name="password" required type="password" id="password">
                    <label for="password">
                      <span class="material-icons">vpn_key</span> Senha
                    </label>
                  </div>
                  <div class="text-right">
                    <button class="btn-success btn-lg" type="submit">
                      <span class="material-icons">check</span> Entrar
                    </button>
                  </div>
                </div>
              </div><br>
            </form>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  methods: {
    login (event) {
      this.$emit('loading')

      const form = event.target
      const data = {
        email: form.querySelector('[name=email]').value,
        password: form.querySelector('[name=password]').value
      }

      return this.$store.dispatch('login', data).then(() =>
        this.$store.dispatch('loadFromAPI')
      ).then(() =>
        this.$store.dispatch('loadData')
      ).then(() =>
        this.load()
      ).then(() => {
        this.$emit('loaded')
        this.$router.push('/')
      }).catch(error => {
        this.$emit('loaded')
        this.$emit('notify', 'Erro', 'Não foi possível fazer login. Tente novamente!', 'danger')
        console.log('Error:', error)
      })
    },

    load () {
      const required = [
        'teacher_requests',
        'users',
        'councils',
        'roles',
        'role_types',
        'role_type_permissions',
        'permissions'
      ]

      const promises = required.map(module =>
        this.$store.dispatch(module + '/loadFromDb', true)
      )

      return Promise.all(promises)
    }
  }
}
</script>
