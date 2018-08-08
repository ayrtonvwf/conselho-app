<style scoped>
  .table>table>thead, .table>table>tbody>tr>td:first-child {
    background-color: #f0f0f0;
  }
</style>

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
