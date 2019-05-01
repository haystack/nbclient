<template>
  <div class="grade-table">
    <table>
      <table-head
          :default-criteria="defaultCriteria"
          :custom-criteria="customCriteria"
          @edit-criterion="editCriterion"
          @delete-criterion="deleteCriterion">
      </table-head>
      <tbody>
        <table-row
            v-for="grade in sortedGrades"
            :default-criteria="defaultCriteria"
            :custom-criteria="customCriteria"
            :grade="grade"
            :editting="edittingGrades.includes(grade)"
            @edit-grade="editGrade"
            @delete-grade="deleteGrade"
            @save-grade="saveGrade">
        </table-row>
      </tbody>
      <table-foot
          :default-criteria="defaultCriteria"
          :custom-criteria="customCriteria"
          @add-grade="addGrade">
      </table-foot>
    </table>
    <div class="add-column" v-show="!customFormVisible">
      <div @click="createCriterion">
        + Add Custom Column
      </div>
    </div>
    <custom-form
        v-show="customFormVisible"
        :editting-criterion="edittingCriterion"
        @cancel-criterion="cancelCriterion"
        @save-criterion="saveCriterion"
        @new-criterion="newCriterion">
    </custom-form>
  </div>
</template>

<script>
  import { DefaultCriterion, CustomCriterion } from './grade-schema.js'
  import TableHead from './TableHead.vue'
  import TableRow from './TableRow.vue'
  import TableFoot from './TableFoot.vue'
  import CustomForm from './CustomForm.vue'

  export default {
    name: 'grade-table',
    props: {
      customCriteria: {
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
        edittingGrades: [],
        edittingCriterion: null,
        customFormVisible: false,
        defaultCriteria: [
          { type: "COMMENTS", label: "Total Comments" },
          { type: "HASHTAGS", label: "Total Hashtags" },
          { type: "WORDS", label: "Total Words" },
          { type: "CHARS", label: "Total Characters" }
        ]
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
        // TODO: add 'grade' to database
      },
      editGrade: function(grade) {
        this.edittingGrades.push(grade)
      },
      deleteGrade: function(grade) {
        // TODO: better alert?
        let message = "Do you really want to remove this grade: " +
            (grade.label ? grade.label : "[ no label ]") +
            " (" + grade.points + "pts) ?\n"
        if (confirm(message)) {
          let idx = this.grades.indexOf(grade)
          if (idx >= 0) { this.grades.splice(idx, 1) }
          // TODO: remove 'grade' from database
        }
      },
      saveGrade: function(grade) {
        let idx = this.edittingGrades.indexOf(grade)
        if (idx >= 0) { this.edittingGrades.splice(idx, 1) }
        // TODO: update 'grade' in database
      },
      createCriterion: function() {
        if (this.customFormVisible) { // TODO: these conflicts should be resolved by modals.
          alert("You're currently editting another custom column! Please save or cancel first.")
          return
        }
        this.customFormVisible = true
      },
      editCriterion: function(criterion) {
        if (this.customFormVisible) { // TODO: these conflicts should be resolved by modals.
          alert("You're currently editting another custom column! Please save or cancel first.")
          return
        }
        this.edittingCriterion = criterion
        this.customFormVisible = true
      },
      cancelCriterion: function() {
        this.edittingCriterion = null
        this.customFormVisible = false
      },
      saveCriterion: function(criterion) {
        this.edittingCriterion = null
        this.customFormVisible = false
        // TODO: update this criterion in database
      },
      newCriterion: function(criterion) {
        this.customCriteria.push(criterion)
        this.customFormVisible = false
        // TODO: add this criterion to database
      },
      deleteCriterion: function(criterion) {
        if (criterion === this.edittingCriterion) { // TODO: these conflicts should be resolved by modals.
          alert("This column is currently being editted!")
          return
        }
        let idx = this.customCriteria.indexOf(criterion)
        if (idx >= 0) { this.customCriteria.splice(idx, 1) }
        for (let grade of this.grades) {
          grade.setThreshold(null, "CUSTOM", criterion.id)
        }
        // TODO: remove this criterion from database
        // TODO: remove corresponding thresholds from database
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
  .add-column > div {
    padding: 8px;
    cursor: pointer;
  }
  .add-column > div:hover {
    background-color: #eee;
  }
</style>
<style src="../components/style/tooltip.css"></style>
