<template>
    <div id="nb-menu"> 
        <label>Active Class:</label>
        <select v-model="activeClass">
            <option v-for="(item, index) in myClasses" :id="item.id" :value="item">{{item.class_name}}</option>
        </select>
    </div>
</template>

<script>
export default {
    name: 'nb-menu',
    props:{
        myClasses: {
            type: Array,
            default: () => []
        },
        activeClass: {
            type: Object,
            default: () => {}
        },
    },
    data () {
        return {
            showSyncFeatures: true
        }
    },
    watch: {
        activeClass: function (newClass) {
            this.$emit('switch-class', newClass)
        }
    },
    created: function () {
        this.activeClass = this.myClasses[0]
    }
}
</script>