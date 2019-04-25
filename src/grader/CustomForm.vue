<template>
  <div class="custom-form">
    <div class="custom-label">
      <input type="text" placeholder="Label (required)" v-model="label">
    </div>
    <div class="filter-header">
      Comments with:
    </div>
    <div class="filter-type" v-for="type in filterTypes">
      <input
          type="text"
          placeholder="0"
          v-model="filters[type]"
          @keypress="e => validate(e, false)">
      or more {{ type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() }}
    </div>
    <div class="form-buttons">
      <button @click="cancel"> Cancel </button>
      <button @click="save"> Save </button>
    </div>
  </div>
</template>

<script>
  import { isNumberKey } from "./input-util.js"
  import { CustomCriterion } from "./grade-schema.js"

  export default {
    name: 'custom-form',
    props: {
      criterion: null
    },
    data() {
      return {
        label: "",
        filters: {
          CHARACTERS: null,
          WORDS: null,
          HASHTAGS: null
        },
        filterTypes: ["CHARACTERS", "WORDS", "HASHTAGS"]
      }
    },
    watch: {
      criterion: function(val) {
        this.label = val ? val.label : ""
        this.filters = val ? Object.assign({}, val.filters) : {}
      }
    },
    methods: {
      validate(event, allowDecimal) {
        return isNumberKey(event, allowDecimal)
      },
      cancel() {
        this.$emit('cancel-criterion', this.criterion)
        this.reset()
      },
      save() {
        if (this.label.length === 0) {
          alert("Label cannot be empty!")
          return
        }
        if (this.criterion) { // editting an existing criterion
          this.criterion.label = this.label
          for (let type of Object.keys(this.filters)) {
            if (this.filters[type]) {
              this.criterion.setFilter(type, parseInt(this.filters[type]))
            } else {
              this.criterion.removeFilter(type)
            }
          }
          this.$emit('save-criterion', this.criterion)
        } else { // creating a new criterion
          let criterion = new CustomCriterion(Date.now(), this.label) // TODO: Use actual ID
          for (let type of Object.keys(this.filters)) {
            if (this.filters[type]) {
              criterion.setFilter(type, parseInt(this.filters[type]))
            }
          }
          this.$emit('new-criterion', criterion)
        }
        this.reset()
      },
      reset: function() {
        this.label = ""
        this.filters = {
          CHARACTERS: null,
          WORDS: null,
          HASHTAGS: null
        }
      }
    }
  }
</script>

<style scoped>
  .custom-form {
    width: 200px;
    padding: 0 8px;
  }
  .custom-label,
  .filter-header,
  .filter-type {
    padding: 8px 0
  }
  .custom-label input {
    width: 192px;
    padding: 4px;
    font-size: 20px;
  }
  .filter-type input {
    width: 50px;
    font-size: 16px;
    text-align: center;
  }
</style>
