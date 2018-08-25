<template>
  <div>
    <div class="row">
      <template v-if="$store.state.browser.support">
        <div class="col-auto">
          <h1 class="content-title"><i class="material-icons">home</i> Página Inicial</h1>
        </div>
      </template>
      <template v-else>
        <div class="col-auto">
          <h1 class="content-title"><i class="material-icons">warning</i> Navegador Não Suportado</h1>
        </div>
        <div class="col-12">
          <div class="row justify-content-center">
            <div class="col-md-9">
              <article class="box">
                <header class="box-header" v-if="$store.state.browser.readableName()">
                  Seu <b>{{ $store.state.browser.readableName() }}</b> está desatualizado.
                </header>
                <div class="box-body text-center">
                  <template v-if="!$store.state.browser.readableName()">
                    <p>Para que o aplicativo funcione corretamente, utilize um navegador suportado:</p>
                    <ul>
                      <li><a href="https://www.google.com/chrome" target="_blank">Google Chrome</a></li>
                      <li><a href="https://www.mozilla.org/pt-BR/firefox/new" target="_blank">Mozilla Firefox</a></li>
                    </ul>
                  </template>
                  <template v-else>
                    <br><br>
                    <p class="h5">Para que o aplicativo funcione corretamente, atualize seu navegador.</p>
                    <br>
                    <p>
                      <a class="btn-info btn-lg" :href="$store.state.browser.updateLink()" target="_blank">Baixar {{ $store.state.browser.readableName() }} atualizado</a>
                    </p>
                    <br><br>
                  </template>
                </div>
              </article>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Index'
}
</script>
