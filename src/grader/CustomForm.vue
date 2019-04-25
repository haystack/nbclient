<template>
  <div class="custom-form">
    <div class="custom-label">
      <input type="text" placeholder="Label (required)" v-model="label">
    </div>
    <div class="filter-option">
      Comments with:
    </div>
    <div class="filter-option" v-for="type in filterTypes">
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
        filters: {},
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
        if (this.label === "") {
          alert("Label cannot be empty!")
          return
        }
        let criterion
        if (this.criterion) {
          criterion = this.criterion
        } else {
          criterion = new CustomCriterion(Date.now(), this.label)
        }
        for (let type of this.filterTypes) {
          if (type in this.filters) {
            criterion.setFilter(type, parseInt(this.filters[type]))
          } else {
            criterion.removeFilter(type)
          }
        }
        this.$emit(this.criterion ? 'save-criterion' : 'new-criterion', criterion)
        this.reset()
      },
      reset: function() {
        this.label = ""
        this.filters = {}
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
  .filter-option {
    padding: 8px 0
  }
  .custom-label input {
    width: 192px;
    padding: 4px;
    font-size: 20px;
  }
  .filter-option input {
    width: 50px;
    font-size: 16px;
    text-align: center;
  }
</style>
