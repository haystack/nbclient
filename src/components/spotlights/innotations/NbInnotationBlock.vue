<template>
</template>

<script>
import NbInnotationPosition from './NbInnotationPosition'
import axios from 'axios'

const INNO_WIDTH = 180
const INNO_HEIGHT = 120

export default {
    name: 'nb-highlight-block',
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
            innoPos: null
        }
    },
    created: function() {
        this.innoPos = this.thread.spotlight.type.toLowerCase()

        // remove elm if exists
        const elm = document.getElementById(`nb-innotation-block-${this.thread.id}-${this.innoPos}`)
        if (elm) elm.remove()

        const commonAncestor = this.thread.range.commonAncestor

        // build innotation item
        // TODO: Seperate the author name from content. create new element
        const innotation = document.createElement('nb-innotation')
        innotation.id = `nb-innotation-block-${this.thread.id}-${this.innoPos}`
        const text = this.thread.text.length > 400 ? `${this.thread.text.substring(0, 400)}...` : this.thread.text;
        innotation.innerText = (`${text}`)
        innotation.addEventListener('mouseenter', this.onMouseEnter)
        innotation.addEventListener('mouseleave', this.onMouseLeave)
        innotation.addEventListener('click', this.onClick)


        // check if there is a collection for the position?
        const innotationCollection = Array.from(commonAncestor.childNodes.values()).find( elm => { 
            return elm.nodeName.toLowerCase() === 'nb-innotation-collection' && elm.className.includes(`nb-${this.innoPos}`)
        })
        
        if (innotationCollection) {
            // if yes add the innotation
            innotationCollection.appendChild(innotation)
        } else {
            // if not create a collection, edit commonancestor css based on collection then add the innotation
            commonAncestor.classList.add('nb-innotation-ancestor', `nb-${this.innoPos}`)
            const innotationCollection =  document.createElement('nb-innotation-collection')
            innotationCollection.className = `nb-${this.innoPos}`
            commonAncestor.appendChild(innotationCollection)
            innotationCollection.appendChild(innotation)
            //this.realignInnotationCollections()
        }
        
        window.dispatchEvent(new Event('resize'))
        window.addEventListener('resize', _ => {
            this.realignInnotationCollections()
        })
    },
    beforeDestroy: function() {
        // remove elm if exists
        const elm = document.getElementById(`nb-innotation-block-${this.thread.id}-${this.innoPos}`)
        if (elm) elm.remove()
        
        // remove collection if no elm left in item
        const commonAncestor = this.thread.range.commonAncestor
        const innotationCollection = Array.from(commonAncestor.childNodes.values()).find( elm => { 
            return elm.nodeName.toLowerCase() === 'nb-innotation-collection' && elm.className.includes(`nb-${this.innoPos}`)
        })

        if(innotationCollection) {
            const hasOtherInnotations = Array.from(innotationCollection.childNodes.values()).find( elm => { 
                return elm.nodeName.toLowerCase() === 'nb-innotation'
            })

            if (!hasOtherInnotations) {
                innotationCollection.remove()
                commonAncestor.classList.remove(`nb-${this.innoPos}`)
            }
        }

       // this.realignInnotationCollections()
        window.dispatchEvent(new Event('resize'))
    },
    watch: {
        threadSelected: function (val) {
            const elm = document.getElementById(`nb-innotation-block-${this.thread.id}-${this.innoPos}`)
            this.thread !== val ? elm.classList.remove('active') : elm.classList.add('active')
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
        realignInnotationCollections: function () {
            const commonAncestor = this.thread.range.commonAncestor
            let innotationCollectionHeight = commonAncestor.offsetHeight
            let innotationCollectionWidth = commonAncestor.offsetWidth
            let hasTop = false
            let hasLeft = false

            // Calculate the width and height
            Array.from(commonAncestor.childNodes.values()).forEach( elm => { 
                if (elm.nodeName.toLowerCase() === 'nb-innotation-collection') {
                    elm.className.includes(`nb-above`) || elm.className.includes(`nb-bellow`) ? innotationCollectionHeight -= INNO_HEIGHT : innotationCollectionWidth -= INNO_WIDTH
                    elm.className.includes(`nb-above`) ? hasTop = true : ''
                    elm.className.includes(`nb-left`) ? hasLeft = true : ''
                }
            })

            Array.from(commonAncestor.childNodes.values()).forEach( elm => { 
                if (elm.nodeName.toLowerCase() === 'nb-innotation-collection') {
                    if ( elm.className.includes(`nb-above`) || elm.className.includes(`nb-bellow`)) {
                        elm.style.width = `${innotationCollectionWidth}px`
                        hasLeft ? elm.style.marginInlineStart = `${INNO_WIDTH}px` :elm.style.marginInlineStart = `0px`
                    } else {
                        elm.style.height = `${innotationCollectionHeight}px`
                        hasTop ? elm.style.marginBlockStart = `${INNO_HEIGHT}px` : elm.style.marginBlockStart = `0px`
                    }
                }
            })
        }
    }

     // TODO: add functions for manipulations
}
</script>