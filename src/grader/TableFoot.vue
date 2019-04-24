<template>
  <tfoot>
    <tr>
      <td>
        <input type="text" placeholder="Label (optional)" v-model="label">
      </td>
      <td>
        <input
            type="text"
            placeholder="0"
            v-model="points"
            @keypress="event => validate(event, true)">
      </td>
      <td v-for="criterion in criteria">
        <input
            type="text"
            placeholder="0"
            v-model="thresholds[criterion.id]"
            @keypress="event => validate(event, false)">
      </td>
      <td>
        <button @click="addGrade"> Add </button>
      </td>
    </tr>
  </tfoot>
</template>

<script>
  import { isNumberKey } from './input-util.js'
  import { Grade } from './grade-schema.js'

  export default {
    name: 'table-foot',
    props: {
      criteria: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        label: null,
        points: null,
        thresholds: {}
      }
    },
    methods: {
      validate(event, allowDecimal) {
        return isNumberKey(event, allowDecimal)
      },
      addGrade: function() {
        let grade = new Grade(
          Date.now(),
          this.label ? this.label : "",
          this.points ? parseFloat(this.points) : 0,
        )
        for (let id of Object.keys(this.thresholds)) {
           grade.setThreshold(id, parseInt(this.thresholds[id]))
        }
        this.$emit('add-grade', grade)
        this.reset()
      },
      reset: function() {
        this.label = null
        this.points = null
        this.thresholds = {}
      }
    }
  }
</script>

<style scoped>
  input {
    font-size: 16px;
    text-align: center;
  }
</style>
