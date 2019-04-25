<template>
  <tr v-if="editable">
    <td>
      <input type="text" placeholder="Label (optional)" v-model="newLabel">
    </td>
    <td>
      <input
          type="text"
          placeholder="0"
          v-model="newPoints"
          @keypress="event => validate(event, true)">
    </td>
    <td v-for="criterion in criteria">
      <input
          type="text"
          placeholder="0"
          v-model="newThresholds[criterion.getID()]"
          @keypress="event => validate(event, false)">
    </td>
    <td>
      <button @click="saveGrade"> Save </button>
    </td>
  </tr>
  <tr v-else>
    <td>{{ grade.label ? grade.label : "[ no label ]" }}</td>
    <td>{{ grade.points }}</td>
    <td v-for="criterion in criteria">
      {{ grade.getThreshold(criterion.getID()) }}
    </td>
    <td>
      <v-popover
        class="overflow-menu"
        :disabled="!overflowMenu">
        <span class="tooltip-target" @click="overflowMenu = true">
          ···
        </span>
        <template slot="popover">
          <div class="overflow-btn" @click="editGrade"> Edit </div>
          <div class="overflow-btn" @click="deleteGrade"> Delete </div>
        </template>
      </v-popover>
    </td>
  </tr>
</template>

<script>
  import { isNumberKey } from './input-util.js'

  export default {
    name: 'table-row',
    props: {
      criteria: Array,
      grade: Object,
      editable: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        overflowMenu: false,
        newLabel: this.grade.label,
        newPoints: this.grade.points,
        newThresholds: Object.assign({}, this.grade.thresholds)
      }
    },
    methods: {
      validate(event, allowDecimal) {
        return isNumberKey(event, allowDecimal)
      },
      editGrade: function() {
        this.overflowMenu = false
        this.$emit('edit-grade', this.grade)
      },
      deleteGrade: function() {
        this.overflowMenu = false
        this.$emit('delete-grade', this.grade)
      },
      saveGrade: function() {
        this.grade.label = this.newLabel ? this.newLabel : ""
        this.grade.points = this.newPoints ? parseFloat(this.newPoints) : 0
        for (let criterion of this.criteria) {
          let id = criterion.getID()
          if (id in this.newThresholds) {
            this.grade.setThreshold(id, parseInt(this.newThresholds[id]))
          } else {
            this.grade.removeThreshold(id)
          }
        }
        this.$emit('save-grade', this.grade)
      }
    }
  }
</script>

<style scoped>
  .overflow-menu {
    cursor: pointer;
  }
  .overflow-btn {
    padding: 8px 12px;
    cursor: pointer;
  }
  .overflow-btn:hover {
    background-color: #444;
  }
  input {
    font-size: 16px;
    text-align: center;
  }
</style>
