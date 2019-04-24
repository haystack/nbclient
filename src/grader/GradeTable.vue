<template>
  <div class="grade-table">
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
    <div class="add-column" v-show="!customFormVisible">
      <h1>Add column:</h1>
      <div v-for="type in unusedCriteria" @click="addCriterion(type)">
        + Total {{ type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() }}
      </div>
      <div @click="customCriterion">
        + Custom
      </div>
    </div>
    <custom-form
        v-show="customFormVisible"
        :criterion="editableCriterion"
        @cancel-criterion="cancelCriterion"
        @save-criterion="saveCriterion"
        @new-criterion="newCriterion">
    </custom-form>
  </div>
</template>

<script>
  import { Criterion, CustomCriterion } from './grade-schema.js'
  import TableHead from './TableHead.vue'
  import TableRow from './TableRow.vue'
  import TableFoot from './TableFoot.vue'
  import CustomForm from './CustomForm.vue'

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
        editableGrades: [],
        editableCriterion: null,
        customFormVisible: false
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
        return types.filter(type => !this.hasCriterion(type))
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
        this.customFormVisible = true
      },
      editCriterion: function(criterion) {
        if (this.customFormVisible) {
          alert("You're currently editting another custom column! Please save or cancel first.")
          return
        }
        this.editableCriterion = criterion
        this.customFormVisible = true
      },
      cancelCriterion: function(criterion) {
        this.editableCriterion = null
        this.customFormVisible = false
      },
      saveCriterion: function(criterion) {
        this.editableCriterion = null
        this.customFormVisible = false
      },
      newCriterion: function(criterion) {
        this.criteria.push(criterion)
        this.customFormVisible = false
      },
      deleteCriterion: function(criterion) {
        if (this.criteria.length == 1) {
          alert("Cannot delete the only criteria left!")
          return
        }
        if (criterion === this.editableCriterion) {
          alert("This column is currently being editted!")
          return
        }
        let idx = this.criteria.indexOf(criterion)
        if (idx >= 0) this.criteria.splice(idx, 1)
      }
    },
    components: {
      TableHead,
      TableRow,
      TableFoot,
      CustomForm
    }
  }
</script>

<style scoped>
  .grade-table {
    display: flex;
    flex-flow: row wrap;
  }
  table, table td {
    padding: 8px;
    text-align: center;
  }
  .add-column {
    width: 200px;
  }
  .add-column > h1 {
    font-size: 16px;
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
