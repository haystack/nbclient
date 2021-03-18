<template>
</template>

<script>
import NbInnotationPosition from './NbInnotationPosition'

export default {
    name: 'nb-highlight-block',
    props: {
        thread: Object,
    },
    data () {
        return {
            innoPos: null
        }
    },
    created: function() {
        console.log('nb-highlight-block Created')
        // remove elm if exists
        const elm = document.getElementById(`nb-innotation-block-${this.thread.id}`)
        if (elm) elm.remove()

        const commonAncestor = this.thread.range.commonAncestor

        console.log(this.thread)
        // get pos of inno. (from db)
        this.innoPos = this.thread.innotation.position.toLowerCase()

        console.log(this.innoPos)

        // build innotation item
        // TODO: Seperate the author name from content. create new element
        const innotation = document.createElement('nb-innotation')
        innotation.id = `nb-innotation-block-${this.thread.id}`
        const text = this.thread.text.length > 400 ? `${this.thread.text.substring(0, 400)}...` : this.thread.text;
        innotation.innerText = (`${text}\n\n${this.thread.authorName}`)

        // check if there is a collection for the position?
        console.log('check if there is a collection for the position?');
        const innotationCollection = Array.from(commonAncestor.childNodes.values()).find( elm => { 
            return elm.nodeName.toLowerCase() === 'nb-innotation-collection' && elm.className.includes(`nb-${this.innoPos}`)
        })
        
        console.log(innotationCollection);
        if (innotationCollection) {
            console.log('there is a collection');
            // if yes add the innotation
            innotationCollection.appendChild(innotation)
        } else {
            console.log('NO collection');

            // if not create a collection, edit commonancestor css based on collection then add the innotation
            commonAncestor.classList.add('nb-innotation-ancestor', `nb-${this.innoPos}`)
            const innotationCollection =  document.createElement('nb-innotation-collection')

            innotationCollection.className = `nb-${this.innoPos}`
            commonAncestor.appendChild(innotationCollection)
            innotationCollection.appendChild(innotation)
        }
        
        window.dispatchEvent(new Event('resize'))
    },
    beforeUpdate: function (val) {
        console.log("beforeDestroy nb-highlight-block")
        console.log(this.thread)
        console.log(val)
    },
    beforeDestroy: function() {
        console.log("beforeDestroy nb-highlight-block")
        console.log(this.thread)
        // remove elm if exists
        const elm = document.getElementById(`nb-innotation-block-${this.thread.id}`)
        if (elm) elm.remove()
        window.dispatchEvent(new Event('resize'))

        // remove collection if no elm left in item
        const commonAncestor = this.thread.range.commonAncestor
        const innotationCollection = Array.from(commonAncestor.childNodes.values()).find( elm => { 
            return elm.nodeName.toLowerCase() === 'nb-innotation-collection' && elm.className.includes(`nb-${this.innoPos}`)
        })
        console.log(this.innoPos)
        console.log(innotationCollection)
        if(innotationCollection) innotationCollection.remove()
        commonAncestor.classList.remove(`nb-${this.innoPos}`)
    } 

     // TODO: add functions for manipulations
}
</script>