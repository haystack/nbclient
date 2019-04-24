<template>
  <div>
    <table>
      <table-head :criteria="criteria" @edit-criterion="editCriterion">
      </table-head>
      <tbody>
        <table-row
            v-for="grade in sortedGrades"
            :criteria="criteria"
            :grade="grade"
            :editable="editableGrades.includes(grade)"
            @edit-grade="editGrade"
            @delete-grade="deleteGrade"
            @save-grade="saveGrade">
        </table-row>
      </tbody>
      <table-foot :criteria="criteria" @add-grade="addGrade"></table-foot>
    </table>
  </div>
</template>

<script>
  import TableHead from './TableHead.vue'
  import TableRow from './TableRow.vue'
  import TableFoot from './TableFoot.vue'

  export default {
    name: 'grade-table',
    props: {
      criteria: {
        type: Array,
        default: []
      },
      grades: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        overflowMenu: false,
        editableGrades: []
      }
    },
    computed: {
      sortedGrades: function() {
        return this.grades.sort(function(a, b) {
          return b.points - a.points
        })
      }
    },
    methods: {
      addGrade: function(grade) {
        this.grades.push(grade)
      },
      editGrade: function(grade) {
        this.editableGrades.push(grade)
      },
      deleteGrade: function(grade) {
        let message = "Do you really want to remove this grade: " +
            (grade.nickname ? grade.nickname : "[ no label ]") +
            " (" + grade.points + "pts) ?\n"
        for (let criterion of this.criteria) {
          message += criterion.nickname + " >= " + grade.getThreshold(criterion.id) + "\n"
        }
        if (confirm(message)) {
          let idx = this.grades.indexOf(grade)
          if (idx >= 0) { this.grades.splice(idx, 1) }
        }
      },
      saveGrade: function(grade) {
        let idx = this.editableGrades.indexOf(grade)
        if (idx >= 0) this.editableGrades.splice(idx, 1)
      },
      editCriterion: function(criterion) {
        this.$emit('edit-criterion', criterion)
      }
    },
    components: {
      TableHead,
      TableRow,
      TableFoot,
    }
  }
</script>

<style scoped>
  table, table td {
    padding: 5px;
    /* border: solid 1px #666; */
    text-align: center;
  }
</style>
