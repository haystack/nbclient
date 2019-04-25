<template>
  <thead>
    <tr>
      <th></th> <!-- labels -->
      <th> Points </th>
      <th v-for="criterion in criteria">
        {{ criterion.getLabel() }}
        <v-popover
          class="overflow-menu"
          :disabled="!overflowMenu">
          <span class="tooltip-target" @click="overflowMenu = true">
            <i class="fas fa-cog"></i>
          </span>
          <template slot="popover">
            <div
                class="overflow-btn"
                v-if="isEditable(criterion)"
                @click="editCriterion(criterion)">
              Edit
            </div>
            <div class="overflow-btn" @click="deleteCriterion(criterion)">
              Delete
            </div>
          </template>
        </v-popover>
      </th>
      <th></th> <!-- edit buttons -->
    </tr>
  </thead>
</template>

<script>
  import { CustomCriterion } from './grade-schema.js'

  export default {
    name: 'table-head',
    props: {
      criteria: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        overflowMenu: false
      }
    },
    methods: {
      isEditable(criterion) {
        return criterion instanceof CustomCriterion
      },
      editCriterion(criterion) {
        this.overflowMenu = false
        this.$emit('edit-criterion', criterion)
      },
      deleteCriterion(criterion) {
        this.overflowMenu = false
        this.$emit('delete-criterion', criterion)
      }
    }
  }
</script>

<style scoped>
  th, td {
    padding: 5px;
    text-align: center;
  }
  .overflow-btn {
    padding: 8px 12px;
    cursor: pointer;
  }
  .overflow-menu {
    display: inline-block;
    cursor: pointer;
  }
  .overflow-btn:hover {
    background-color: #444;
  }
</style>
