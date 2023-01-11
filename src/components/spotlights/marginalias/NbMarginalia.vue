<template>
    <div 
        class="nb-marginalia"
        :style="style"
        @click="onClick()"
        @mouseenter="onHover(true)"
        @mouseleave="onHover(false)">
            <span v-if="hasHeader" v-html="spotlight.header" class="nb-marginalia-header"></span>
            <span v-if="showTime" class="nb-marginalia-time"> <b>{{ authorName }}</b> @ {{ ago }}</span>
            {{thread.text.length > 200 ? `${thread.text.substring(0, 400)}...` : thread.text}}
    </div>
</template>

<script>
import { getTextBoundingBoxes } from '../../../utils/overlay-util.js'
import axios from 'axios'
import moment from 'moment'
import { CommentAnonymity } from '../../../models/enums.js'

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
    data () {
        return {
            ago: '',
            time: '',
            interval:null
        }
    },
    created: function() {
        if (this.spotlight.showTime) {
            this.time = this.thread.timestamp
            this.interval = setInterval(() => {
                this.ago = moment(this.time).fromNow();
            }, 1000)
        }
    },
    destroyed: function() {
         if (this.spotlight.showTime) {
            clearInterval(this.interval)
         }
    },
    computed: {
        spotlight: function () {
            return this.thread.systemSpotlight ? this.thread.systemSpotlight : this.thread.spotlight
        },
        style: function () {
            const spot = this.thread.systemSpotlight ? this.thread.systemSpotlight : this.thread.spotlight
            let color = spot.color? spot.color : 'black'
            let backgroundColor = spot.background? spot.background : '#fef5d7'
            const boundingBoxes = getTextBoundingBoxes(this.thread.range.toRange())
            let style = ''

            if (boundingBoxes.length > 0) {
                style = `top: ${boundingBoxes[0].top - document.body.getBoundingClientRect().top}px; transition: 0.3s;`

                if (this.threadsHovered.includes(this.thread)) {
                style = `${style} color: ${color}; background-color: ${backgroundColor}; z-index: 1;`
                }

                if (this.thread === this.threadSelected) {
                    style = `${style} mask-image: unset; color: ${color}; background-color: ${backgroundColor}; z-index: 2;`
                }
            }

            return style
        },
        authorName: function () {
            if ((this.thread.anonymity === CommentAnonymity.ANONYMOUS && this.user.role !== 'instructor') || this.thread.author === null ) {
                    return 'Anonymous'
            }
            return this.thread.authorName
        },
        hasHeader: function () {
            return this.spotlight.header ? true : false
        },
        showTime: function () {
            return (this.thread.systemSpotlight && this.thread.systemSpotlight.showTime) || (!this.thread.systemSpotlight && this.thread.spotlight.showTime)
        }
    },
    watch: {
        threadSelected: function (val) {}
    },
    methods: {
        onMouseEnter: function () {
            this.$emit('hover-innotation', this.thread)
        },
        onMouseLeave: function () {
            this.$emit('unhover-innotation', this.thread)
        },
        onClick: function () {
            this.$emit('log-nb', 'CLICK', 'SPOTLIGHT', this.thread)

            const spotlightType = this.thread.systemSpotlight ? this.thread.systemSpotlight.type : this.thread.spotlight.type
            const source = window.location.pathname === '/nb_viewer.html' ? window.location.href : window.location.origin + window.location.pathname
            const token = localStorage.getItem("nb.user");
            const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: source } }
            
            try {
                axios.post(`/api/spotlights/log`, {
                    spotlight_id: this.thread.systemSpotlight ? null : this.thread.spotlight.id,
                    action: 'CLICK', 
                    type: spotlightType.toUpperCase(), 
                    annotation_id: this.thread.id, 
                    class_id: this.activeClass.id,
                    role: this.user.role.toUpperCase() 
                }, config)
            } catch (error) {}

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