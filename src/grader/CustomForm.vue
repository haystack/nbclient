<template>
  <div class="custom-form">
    <div class="custom-label">
      <input type="text" placeholder="Label (required)" v-model="label">
    </div>
    <div class="filter-header">
      Comments with:
    </div>
    <div class="filter-type" v-for="filter in filters">
      <input
          type="text"
          placeholder="0"
          v-model="filter.value"
          @keypress="e => validate(e, false)">
      or more {{ filter.label }}
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
      edittingCriterion: null
    },
    data() {
      return {
        label: null,
        filters: [
          { type: "HASHTAGS", label: "Hashtags", value: null },
          { type: "WORDS", label: "Words", value: null },
          { type: "CHARS", label: "Characters", value: null}
        ]
      }
    },
    watch: {
      edittingCriterion: function(val) {
        if (val) {
          this.label = val.label
          for (let filter of this.filters) {
            filter.value = val.getFilter(filter.type)
          }
        } else {
          this.reset()
        }
      }
    },
    methods: {
      validate(event, allowDecimal) {
        return isNumberKey(event, allowDecimal)
      },
      cancel() {
        this.$emit('cancel-criterion')
        this.reset()
      },
      save() {
        if (!this.label) {
          alert("Label cannot be empty!")
          return
        }
        if (this.edittingCriterion) { // editting an existing criterion
          this.edittingCriterion.label = this.label
          for (let filter of this.filters) {
            this.edittingCriterion.setFilter(filter.value, filter.type)
          }
          this.$emit('save-criterion', this.edittingCriterion)
        } else { // creating a new criterion
          let criterion = new CustomCriterion(Date.now(), this.label) // TODO: Use actual ID
          for (let filter of this.filters) {
            criterion.setFilter(filter.value, filter.type)
          }
          this.$emit('new-criterion', criterion)
        }
        this.reset()
      },
      reset: function() {
        this.label = null
        for (let filter of this.filters) {
          filter.value = null
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
