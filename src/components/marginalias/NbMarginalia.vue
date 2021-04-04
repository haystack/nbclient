<template>
    <div 
        class="nb-marginalia"
        :style="style"
        @click="$emit('select-thread',thread)"
        @mouseenter="onHover(true)"
        @mouseleave="onHover(false)">
            {{this.thread.text.length > 200 ? `${this.thread.text.substring(0, 400)}...` : this.thread.text}}
    </div>
</template>

<script>
import { getTextBoundingBoxes } from '../../utils/overlay-util.js'

export default {
    name: 'nb-marginalia',
    props: {
        thread: Object,
        threadSelected: Object,
        threadsHovered: {
            type: Array,
            default: () => []
        },
    },
    computed: {
        style: function () {
            // console.log('=====================================');
            // console.log(this.thread.range)
            // console.log(document.body.getBoundingClientRect().top);
            // console.log(this.thread.range.commonAncestor.getBoundingClientRect().top);
            // console.log(this.thread.range.commonAncestor.getBoundingClientRect().top - document.body.getBoundingClientRect().top);
            // console.log(getTextBoundingBoxes(this.thread.range.toRange()))
            // console.log(this.getOffset(this.thread.range.commonAncestor).top)
            let style = `top: ${getTextBoundingBoxes(this.thread.range.toRange())[0].top - document.body.getBoundingClientRect().top}px; transition: 0.3s;`

             if (this.threadsHovered.includes(this.thread)) {
                // style = `${style} outline: 2px dashed #ccc;`
               style = `${style} background-color: #fef5d7; z-index: 1;`
            }

            if (this.thread === this.threadSelected) {
                style = `${style} mask-image: unset; background-color: #fef5d7; z-index: 2;`
            }

            return style
        },
    },
    watch: {
        threadSelected: function (val) {
            
        }
    },
    methods: {
        onMouseEnter: function () {
            console.log('onMouseEnter');
            this.$emit('hover-innotation', this.thread)
        },
        onMouseLeave: function () {
            console.log('onMouseLeave');
            this.$emit('unhover-innotation', this.thread)
        },
        onClick: function () {
            console.log('onClick');
            this.$emit('select-thread', this.thread)
        },
        onHover: function (state) {
            this.$emit(state ? 'hover-thread' : 'unhover-thread', this.thread)
        },
        getOffset: function (el) {
            let x = 0;
            let y = 0;

            while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
                x += el.offsetLeft - el.scrollLeft;
                y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }

            return { top: y, left: x };
        }
    }
}
</script>