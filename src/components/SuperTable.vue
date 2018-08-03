<template>
  <div class="table">
    <table>
      <slot></slot>
    </table>
  </div>
</template>

<script>
import superTable from '../assets/superTable'

export default {
  name: 'SuperTable',
  created () {
    setTimeout(superTable, 1000)
  }
}
</script>
