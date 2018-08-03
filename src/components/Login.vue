<template>
  <div v-if="!logged_in">
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
  data: function() {
    return this.$parent.$data
  },
  methods: {
    login(event) {
      let component = this
      let app = this.$parent

      let headers = new Headers()
      headers.set('Timezone', '-03:00')
      headers.set('Accept', 'application/json; charset=UTF-8')
      headers.set('Content-Type', 'application/json')

      let form_data = new FormData(event.target)
      let data = {}
      form_data.forEach(function (value, field) {
        data[field] = value
      })

      let url = app.api_url + 'user_token'

      let options = {
        headers: headers,
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data)
      }

      app.loading = true

      return fetch(url, options).then(function (response) {
        if (!response.ok) {
          alert('Não foi possível fazer login. Tente novamente!')
          throw response
        }

        return response.json()
      }).then(token => {
        localStorage.setItem('token', JSON.stringify(token))
        app.token = token
        app.logged_in = true
        component.logged_in = true
        component.$forceUpdate()
        app.seed().then(() => {
          app.$router.push('/')
          app.loading = false
        })
      }).catch(() => {
        app.loading = false
      })
    }
  }
}
</script>
