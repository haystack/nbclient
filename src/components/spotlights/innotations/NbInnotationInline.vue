<template>
</template>

<script>
import axios from 'axios'

export default {
    name: 'nb-highlight-inline',
    props: {
        thread: Object,
        user: Object,
        threadSelected: Object,
        activeClass: {
            type: Object,
            default: () => {}
        },
    },
    data () {
        return {
            hoverLogTimeout: null,
            isInnotationTextExtended: null,
        }
    },
    created: function() {
        // remove elm if exists
        const elm = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
        if (elm) elm.remove()

        let color = this.thread.spotlight.color? this.thread.spotlight.color : 'blue'
        
        // build innotation item
        const endNode = this.thread.range.end
        const innotation = document.createElement('nb-innotation-inline')
        innotation.style.color = color
        innotation.id = `nb-innotation-inline-${this.thread.id}`
        const text = this.thread.text.length > 100 ? `${this.thread.text.substring(0, 100)}...` : this.thread.text;
        innotation.innerText = (`${text}`)
        innotation.addEventListener('mouseover', this.onHover)
        innotation.addEventListener('mouseenter', this.onMouseEnter)
        innotation.addEventListener('mouseleave', this.onMouseLeave)
        innotation.addEventListener('click', this.onClick)
        endNode.before(innotation)
        window.dispatchEvent(new Event('resize'))
    },
    watch: {
        threadSelected: function (val) {
            //this.thread !== val ? this.collapseInnotationText() : this.extendInnotationText()
        }
    },
    methods: {
        onClick: function () {
            clearTimeout(this.hoverLogTimeout)
            this.$emit('log-nb', 'CLICK', 'SPOTLIGHT', this.thread)
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
        },
        onMouseEnter: function (state) {
            // console.log('onMouseEnter')
            //if (this.thread === this.threadSelected) return // ignore hover when thread is selected

            this.hoverLogTimeout = setTimeout(this.logHover, 3000)
            this.extendInnotationText()
            this.$emit('hover-innotation', this.thread)
        },
        onMouseLeave: function (state) {
            // console.log('onMouseLeave')
            //if (this.thread === this.threadSelected) return // ignore hover when thread is selected

            clearTimeout(this.hoverLogTimeout)
            this.collapseInnotationText()
            this.$emit('unhover-innotation', this.thread)
        },
        logHover: function () {
            // console.log('Log Hover!')
        },
        extendInnotationText: function () {
            // console.log('extendInnotationText...')
            if (this.isInnotationTextExtended) return
            // console.log('extendInnotationText')
            const innotation = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
            const text = this.thread.text.length > 300 ? `${this.thread.text.substring(0, 300)}...` : this.thread.text;
            innotation.innerText = (`${text}`)
            this.isInnotationTextExtended = true
            window.dispatchEvent(new Event('resize'))
        },
        collapseInnotationText: function() {
            // console.log('collapseInnotationText...')
            if (!this.isInnotationTextExtended) return
            // console.log('collapseInnotationText...')
            const innotation = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
            const text = this.thread.text.length > 100 ? `${this.thread.text.substring(0, 100)}...` : this.thread.text;
            innotation.innerText = (`${text}`)
            this.isInnotationTextExtended = false
            window.dispatchEvent(new Event('resize'))
        }
    },
    beforeDestroy: function() {
        // remove elm if exists
        const elm = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
        if (elm) elm.remove()
        window.dispatchEvent(new Event('resize'))
    } 
}
</script>