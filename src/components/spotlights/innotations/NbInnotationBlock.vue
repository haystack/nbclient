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
            innoPos: null,
        }
    },
    created: function() {
        this.innoPos = this.thread.spotlight.type.toLowerCase()

        // remove elm if exists
        const elm = document.getElementById(`nb-innotation-block-${this.thread.id}-${this.innoPos}`)
        if (elm) elm.remove()

        const commonAncestor = this.getCommonAncestor()

        // build innotation item
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
            // there's a collection add the innotation
            innotationCollection.appendChild(innotation)
        } else {
            // no collection, create a collection, edit commonancestor css based on collection then add the innotation
            commonAncestor.classList.add('nb-innotation-ancestor', `nb-${this.innoPos}`, `nb-innotation-ancestor-for-${this.thread.id}`)
            const innotationCollection =  document.createElement('nb-innotation-collection')
            innotationCollection.className = `nb-${this.innoPos}`
            commonAncestor.appendChild(innotationCollection)
            innotationCollection.appendChild(innotation)
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
       const commonAncestor = this.getCommonAncestor()
       //commonAncestor.classList.remove(`nb-innotation-ancestor-for-${this.thread.id}`)

        const innotationCollection = Array.from(commonAncestor.childNodes.values()).find( elm => { 
            return elm.nodeName.toLowerCase() === 'nb-innotation-collection' && elm.className.includes(`nb-${this.innoPos}`)
        })

        if (innotationCollection) {
            const hasOtherInnotations = Array.from(innotationCollection.childNodes.values()).find( elm => { 
                return elm.nodeName.toLowerCase() === 'nb-innotation'
            })

            if (!hasOtherInnotations) {
                innotationCollection.remove()
                commonAncestor.classList.remove(`nb-${this.innoPos}`)
            }
        }

        window.dispatchEvent(new Event('resize'))
    },
    watch: {
        threadSelected: function (val) {
            const elm = document.getElementById(`nb-innotation-block-${this.thread.id}-${this.innoPos}`)
            this.thread !== val ? elm.classList.remove('active') : elm.classList.add('active')
        }
    },
    methods: {
        getCommonAncestor: function () {
            return document.getElementsByClassName(`nb-innotation-ancestor-for-${this.thread.id}`)[0] || this.getOptimalCommonAncestor(this.thread.range.commonAncestor)
        },
        getOptimalCommonAncestor: function (element) {
            let commonAncestor = element
            const isBlockElement = (element.currentStyle || window.getComputedStyle(element, "")).display === 'block'
            
            // if the element is block with at least height of 50, return it
            if (isBlockElement && commonAncestor.offsetHeight > 50) {
                return commonAncestor
            }

            // if the element is not block or with height less than 50, use nearst parent block
            return this.getOptimalCommonAncestor(commonAncestor.parentElement)
        },
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
            // TODO: check if commonAncestor need to be changed
            const commonAncestor = this.getCommonAncestor()

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
}
</script>