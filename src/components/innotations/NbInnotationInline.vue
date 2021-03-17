<template>
</template>

<script>

export default {
    name: 'nb-highlight-inline',
    props: {
        thread: Object,
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
        endNode.before(innotation)
        window.dispatchEvent(new Event('resize'))
    },
    methods: {
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
        console.log("beforeDestroy")
        // remove elm if exists
        const elm = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
        if (elm) elm.remove()
        window.dispatchEvent(new Event('resize'))
    } 


     // TODO: add functions for manipulations
}
</script>