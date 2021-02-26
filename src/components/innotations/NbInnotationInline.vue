<template>
    
</template>

<script>

export default {
    name: 'nb-highlight-inline',
    props: {
        thread: Object,
        isInline: Boolean,
    },
    created: function() {
        // // remove elm if exists
        // const elm = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
        // if (elm) elm.remove()

        // if (!this.isInline) return

        // console.log("\n\n\n\n\n=======NEW THREAD===========");
        // console.log(this.thread);
        // console.log(this.thread.text);
        // console.log(this.thread.authorName);
        
        // const commonAncestor = this.thread.range.commonAncestor
        // const endNode = this.thread.range.end
        // const startNode = this.thread.range.start
        
        // // build innotation item
        // const innotation = document.createElement('nb-innotation-inline')
        // innotation.id = `nb-innotation-inline-${this.thread.id}`
        // const text = this.thread.text.length > 100 ? `${this.thread.text.substring(0, 100)}...` : this.thread.text;
        // innotation.innerText = (`${text}`)
        // innotation.addEventListener('mouseover', this.onHover)
        // innotation.addEventListener('mouseenter', this.onMouseEnter)
        // innotation.addEventListener('mouseleave', this.onMouseLeave)


        // console.log("commonAncestor");
        // console.log(commonAncestor);
        // console.log('startNode');
        // console.log(startNode);
        // console.log('endNode');
        // console.log(endNode);
        // console.log(endNode.nodeName);

        // endNode.before(innotation)
        // window.dispatchEvent(new Event('resize'))
    },
    methods: {
        onHover: function (state) {
            console.log('onHover');
            console.log(state);
            console.log(document.getElementById(`nb-innotation-inline-${this.thread.id}`));
        },
        onMouseEnter: function (state) {
            console.log('onMouseEnter');
            console.log(state);

            const innotation = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
            console.log(innotation)
            const text = this.thread.text.length > 300 ? `${this.thread.text.substring(0, 300)}...` : this.thread.text;
            innotation.innerText = (`${text}`)
            window.dispatchEvent(new Event('resize'))
        },
        onMouseLeave: function (state) {
            console.log('onMouseLeave');
            console.log(state);

            const innotation = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
            console.log(innotation)
            const text = this.thread.text.length > 100 ? `${this.thread.text.substring(0, 100)}...` : this.thread.text;
            innotation.innerText = (`${text}`)
            window.dispatchEvent(new Event('resize'))
        },
    },
    watch: {
        isInline: function(val) {
            // remove elm if exists
            const elm = document.getElementById(`nb-innotation-inline-${this.thread.id}`)
            if (elm) elm.remove()

            if (!this.isInline) return

            console.log("\n\n\n\n\n=======NEW THREAD===========");
            console.log(this.thread);
            console.log(this.thread.text);
            console.log(this.thread.authorName);
            
            const commonAncestor = this.thread.range.commonAncestor
            const endNode = this.thread.range.end
            const startNode = this.thread.range.start
            
            // build innotation item
            const innotation = document.createElement('nb-innotation-inline')
            innotation.id = `nb-innotation-inline-${this.thread.id}`
            const text = this.thread.text.length > 100 ? `${this.thread.text.substring(0, 100)}...` : this.thread.text;
            innotation.innerText = (`${text}`)
            innotation.addEventListener('mouseover', this.onHover)
            innotation.addEventListener('mouseenter', this.onMouseEnter)
            innotation.addEventListener('mouseleave', this.onMouseLeave)


            console.log("commonAncestor");
            console.log(commonAncestor);
            console.log('startNode');
            console.log(startNode);
            console.log('endNode');
            console.log(endNode);
            console.log(endNode.nodeName);

            endNode.before(innotation)
            window.dispatchEvent(new Event('resize'))

        }
    }

     // TODO: add functions for manipulations
}
</script>