<template>
  <thead>
    <tr>
      <th></th> <!-- nicknames -->
      <th> Points </th>
      <th v-for="criterion in criteria" @click="$emit('edit-criterion', criterion)">
        {{ criterion.nickname }}
      </th>
      <th></th> <!-- edit buttons -->
    </tr>
  </thead>
</template>

<script>
  export default {
    name: 'table-head',
    props: {
      criteria: {
        type: Array,
        default: []
      }
    }
  }
</script>

<style scoped>
  th, td {
    padding: 5px;
    text-align: center;
  }
</style>
