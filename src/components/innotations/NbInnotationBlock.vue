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
        this.innoPos = this.thread.innotation.position.toLowerCase()

        console.log('nb-highlight-block Created')
        // remove elm if exists
        const elm = document.getElementById(`nb-innotation-block-${this.thread.id}-${this.innoPos}`)
        if (elm) elm.remove()

        const commonAncestor = this.thread.range.commonAncestor

        console.log(this.thread)
        

        console.log(this.innoPos)

        // build innotation item
        // TODO: Seperate the author name from content. create new element
        const innotation = document.createElement('nb-innotation')
        innotation.id = `nb-innotation-block-${this.thread.id}-${this.innoPos}`
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
        console.log("beforeUpdate nb-highlight-block")
        console.log(this.thread)
        console.log(val)
    },
    updated: function (val) {
        console.log("updated nb-highlight-block")
        console.log(this.thread)
        console.log(val)
    },
    beforeDestroy: function() {
        console.log("beforeDestroy nb-highlight-block")
        console.log(this.thread)
        console.log(this.innoPos)
        // remove elm if exists
        const elm = document.getElementById(`nb-innotation-block-${this.thread.id}-${this.innoPos}`)
        console.log('old inno:')
        console.log(elm)
        if (elm) elm.remove()
        

        // remove collection if no elm left in item
        const commonAncestor = this.thread.range.commonAncestor
        const innotationCollection = Array.from(commonAncestor.childNodes.values()).find( elm => { 
            return elm.nodeName.toLowerCase() === 'nb-innotation-collection' && elm.className.includes(`nb-${this.innoPos}`)
        })
        console.log(this.innoPos)
        console.log(innotationCollection)
        if(innotationCollection) {
            const hasOtherInnotations = Array.from(innotationCollection.childNodes.values()).find( elm => { 
                return elm.nodeName.toLowerCase() === 'nb-innotation'
            })

            if (!hasOtherInnotations) {
                innotationCollection.remove()
                commonAncestor.classList.remove(`nb-${this.innoPos}`)
            }
            
        }

        window.dispatchEvent(new Event('resize'))
    } 

     // TODO: add functions for manipulations
}
</script>