<template>
</template>

<script>
import axios from 'axios'

export default {
    name: 'nb-highlight-inline',
    props: {
        thread: Object,
        user: Object,
        activeClass: {
            type: Object,
            default: () => {}
        },
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
        //innotation.addEventListener('click', this.onClick)
        endNode.before(innotation)
        window.dispatchEvent(new Event('resize'))
    },
    methods: {
        onClick: function () {
            // const source = window.location.pathname === '/nb_viewer.html' ? window.location.href : window.location.origin + window.location.pathname
            // const token = localStorage.getItem("nb.user");
            // const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: source } }
            // axios.post(`/api/spotlights/log`, {
            // spotlight_id: this.thread.spotlight.id,
            // action: 'CLICK', 
            // type: this.thread.spotlight.type.toUpperCase(), 
            // annotation_id: this.thread.id, 
            // class_id: this.activeClass.id,
            // role: this.user.role.toUpperCase() 
            // }, config)
        },
        onHover: function (state) {
        },
        onMouseEnter: function (state) {
            const innotation = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
            const text = this.thread.text.length > 300 ? `${this.thread.text.substring(0, 300)}...` : this.thread.text;
            innotation.innerText = (`${text}`)
            window.dispatchEvent(new Event('resize'))
        },
        onMouseLeave: function (state) {
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