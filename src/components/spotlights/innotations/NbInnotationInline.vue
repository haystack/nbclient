<template>
</template>

<script>
import axios from 'axios'

export default {
    name: 'nb-highlight-inline',
    props: {
        thread: Object,
        user: Object,
    },
    created: function() {
        // remove elm if exists
        const elm = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
        if (elm) elm.remove()
        
        // build innotation item
        const endNode = this.thread.range.end
        const innotation = document.createElement('nb-innotation-inline')
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
    methods: {
        onClick: function () {
            const token = localStorage.getItem("nb.user");
            const headers = { headers: { Authorization: 'Bearer ' + token }}
            axios.post(`/api/spotlights/log`, {  action: 'CLICK', position: 'IN', annotation_id: this.thread.id, role: this.user.role.toUpperCase() }, headers)
        },
        onHover: function (state) {
            console.log('onHover');
        },
        onMouseEnter: function (state) {
            console.log('onMouseEnter');
            const innotation = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
            const text = this.thread.text.length > 300 ? `${this.thread.text.substring(0, 300)}...` : this.thread.text;
            innotation.innerText = (`${text}`)
            window.dispatchEvent(new Event('resize'))
        },
        onMouseLeave: function (state) {
            console.log('onMouseLeave');
            const innotation = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
            const text = this.thread.text.length > 100 ? `${this.thread.text.substring(0, 100)}...` : this.thread.text;
            innotation.innerText = (`${text}`)
            window.dispatchEvent(new Event('resize'))
        },
    },
    beforeDestroy: function() {
        // remove elm if exists
        const elm = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
        if (elm) elm.remove()
        window.dispatchEvent(new Event('resize'))
    } 


     // TODO: add functions for manipulations
}
</script>