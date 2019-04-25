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
        + Total {{ type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() }} <!-- TODO: make this method -->
      </div>
      <div @click="createCriterion">
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
  import { CriteriaTypes, DefaultCriterion, CustomCriterion } from './grade-schema.js'
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
        return CriteriaTypes.filter(type => !this.hasCriterion(type))
      }
    },
    methods: {
      addGrade: function(grade) {
        this.grades.push(grade)
        // TODO: add 'grade' to database
      },
      editGrade: function(grade) {
        this.editableGrades.push(grade)
      },
      deleteGrade: function(grade) {
        // TODO: better alert?
        let message = "Do you really want to remove this grade: " +
            (grade.label ? grade.label : "[ no label ]") +
            " (" + grade.points + "pts) ?\n"
        for (let criterion of this.criteria) {
          message += criterion.label + " >= " + grade.getThreshold(criterion.getID()) + "\n"
        }
        if (confirm(message)) {
          let idx = this.grades.indexOf(grade)
          if (idx >= 0) { this.grades.splice(idx, 1) }
          // TODO: remove 'grade' from database
        }
      },
      saveGrade: function(grade) {
        let idx = this.editableGrades.indexOf(grade)
        if (idx >= 0) { this.editableGrades.splice(idx, 1) }
        // TODO: update 'grade' in database
      },
      hasCriterion: function(type) {
        return this.criteria.find(x => x.getType() === type)
      },
      addCriterion: function(type) {
        this.criteria.push(new DefaultCriterion(type))
        // TODO: add this criterion to database
      },
      createCriterion: function() {
        if (this.customFormVisible) { // TODO: these conflicts should be resolved by modals.
          alert("You're currently editting another custom column! Please save or cancel first.")
          return
        }
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
        // TODO: update this criterion in database
      },
      newCriterion: function(criterion) {
        this.criteria.push(criterion)
        this.customFormVisible = false
        // TODO: add this criterion to database
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
        if (idx >= 0) { this.criteria.splice(idx, 1) }
        for (let grade of this.grades) {
          grade.removeThreshold(criterion.id)
        }
        // TODO: remove this criterion from database
        // TODO: update grades accordingly in database
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
