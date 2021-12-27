<template>
    <div 
        class="nb-marginalia"
        :style="style"
        @click="onClick()"
        @mouseenter="onHover(true)"
        @mouseleave="onHover(false)">
            {{this.thread.text.length > 200 ? `${this.thread.text.substring(0, 400)}...` : this.thread.text}}
    </div>
</template>

<script>
import { getTextBoundingBoxes } from '../../../utils/overlay-util.js'
import axios from 'axios'

export default {
    name: 'nb-marginalia',
    props: {
        thread: Object,
        user: Object,
        threadSelected: Object,
        threadsHovered: {
            type: Array,
            default: () => []
        },
        activeClass: {
            type: Object,
            default: () => {}
        },
    },
    computed: {
        style: function () {
            let color = this.thread.spotlight.color? this.thread.spotlight.color : 'black'
            let backgroundColor = this.thread.spotlight.background? this.thread.spotlight.background : '#fef5d7'

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
               style = `${style} color: ${color}; background-color: ${backgroundColor}; z-index: 1;`
            }

            if (this.thread === this.threadSelected) {
                style = `${style} mask-image: unset; color: ${color}; background-color: ${backgroundColor}; z-index: 2;`
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
            this.$emit('hover-innotation', this.thread)
        },
        onMouseLeave: function () {
            this.$emit('unhover-innotation', this.thread)
        },
        onClick: function () {
            const source = window.location.pathname === '/nb_viewer.html' ? window.location.href : window.location.origin + window.location.pathname
            const token = localStorage.getItem("nb.user");
            const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: source } }
            axios.post(`/api/spotlights/log`, {
                spotlight_id: this.thread.spotlight.id,
                action: 'CLICK', 
                type: this.thread.spotlight.type.toUpperCase(), 
                annotation_id: this.thread.id, 
                class_id: this.activeClass.id,
                role: this.user.role.toUpperCase() 
            }, config)
            
            this.$emit('select-thread', this.thread, 'SPOTLIGHT')
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