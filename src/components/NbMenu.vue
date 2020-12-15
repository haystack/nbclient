<template>
    <div class="nb-menu"> 
        <label>Select a class:</label>
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
    watch: {
        activeClass: function (newClass) {
            console.log('clicked on class');
            console.log(newClass);
            this.$emit('switch-class', newClass)
        }
    }
}
</script>