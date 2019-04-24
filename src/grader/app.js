import Vue from 'vue'
import VTooltip from 'v-tooltip'
Vue.use(VTooltip)

import GradeTable from './GradeTable.vue'

import { CriteriaType, Criterion, Grade } from './grade-schema.js'

let app = new Vue({
  el: '#app',
  data: {
    criteria: [],
    grades: []
  },
  methods: {
    customCriterion: function() {
      console.log('custom')
    },
    editCriterion: function(criterion) {
      console.log('edit', criterion)
    }
  },
  components: {
    GradeTable
  }
})

let criterionA = new Criterion(CriteriaType.COMMENTS, "COMMENTS")
let criterionB = new Criterion(CriteriaType.WORDS, "WORDS")

app.criteria.push(criterionA)
app.criteria.push(criterionB)

let gradeA = new Grade('1', "Very good", 4)
let gradeB = new Grade('2', "Good", 3)
let gradeC = new Grade('3', "Fair", 2)

gradeA.setThreshold(criterionA.id, 3)
gradeA.setThreshold(criterionB.id, 60)
gradeB.setThreshold(criterionA.id, 2)
gradeB.setThreshold(criterionB.id, 40)
gradeC.setThreshold(criterionA.id, 1)
gradeC.setThreshold(criterionB.id, 15)

app.grades.push(gradeA)
app.grades.push(gradeB)
app.grades.push(gradeC)
