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
                      <div class="material-icons">email</div> E-mail
                    </label>
                  </div>
                  <div class="input">
                    <input name="password" required type="password" id="password">
                    <label for="password">
                      <div class="material-icons">vpn_key</div> Senha
                    </label>
                  </div>
                  <div class="text-right">
                    <button class="btn-success btn-lg" type="submit">
                      <div class="material-icons">check</div> Entrar
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
/* eslint-disable */
export default {
  name: 'Login',
  methods: {
    login(event) {
      this.$emit('loading')

      let app = this.$parent

      let form = event.target
      let data = {
        email: form.querySelector('[name=email]').value,
        password: form.querySelector('[name=password]').value
      }

      return app.api_fetch('user_token', 'POST', data).then(response =>
        response.json()
      ).then(token => {
        localStorage.setItem('token', JSON.stringify(token))

        app.setAuthData()

        return app.loadFromAPI()
      }).then(() => {
        app.setAuthData()
        return app.loadData()
      }).then(() => {
          app.$router.push('/')
      }).catch(error => {
        console.log('Error:', error)
      }).finally(() =>
        this.$emit('loaded')
      )
    }
  }
}
</script>
