<template>
  <div>
    <table>
      <table-head
          :criteria="criteria"
          @edit-criterion="editCriterion"
          @delete-criterion="deleteCriterion">
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
    <div class="add-column">
      Add column:
      <div v-for="type in unusedCriteria" @click="addCriterion(type)">
        + Total {{ type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() }}
      </div>
      <div @click="customCriterion">
        + Custom
      </div>
    </div>
  </div>
</template>

<script>
  import { CriteriaType, Criterion, CustomCriterion } from './grade-schema.js'
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
      },
      unusedCriteria: function() {
        let types = ['CHARACTERS', 'WORDS', 'HASHTAGS', 'COMMENTS']
        return types.filter(type => !this.hasCriterion(CriteriaType[type]))
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
            (grade.label ? grade.label : "[ no label ]") +
            " (" + grade.points + "pts) ?\n"
        for (let criterion of this.criteria) {
          message += criterion.label + " >= " + grade.getThreshold(criterion.id) + "\n"
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
      hasCriterion: function(type) {
        return this.criteria.find((x) => {
          return !(x instanceof CustomCriterion) && (x.type === type)
        })
      },
      addCriterion: function(type) {
        this.criteria.push(new Criterion(type, type))
      },
      customCriterion: function() {
        this.$emit('custom-criterion', null)
      },
      editCriterion: function(criterion) {
        this.$emit('edit-criterion', criterion)
      },
      deleteCriterion: function(criterion) {
        if (this.criteria.length > 1) {
          let idx = this.criteria.indexOf(criterion)
          if (idx >= 0) this.criteria.splice(idx, 1)
        } else {
          alert("Cannot delete the only criteria left!")
        }
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
  .add-column > div {
    padding: 8px;
    cursor: pointer;
  }
  .add-column > div:hover {
    background-color: #eee;
  }
</style>
<style src="../components/style/tooltip.css"></style>
