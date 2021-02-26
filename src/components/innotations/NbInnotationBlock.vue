<template>
</template>

<script>
import NbInnotationPosition from './NbInnotationPosition'

export default {
    name: 'nb-highlight-block',
    props: {
        thread: Object,
        innotationBlockPosition: String,
        isInline: Boolean,
    },
    created: function() {
        // // remove elm if exists
        // const elm = document.getElementById(`nb-innotation-block-${this.thread.id}`)
        // if (elm) elm.remove()

        // if (this.isInline) return

        // console.log("=======NEW THREAD===========");
        // console.log(this.thread);
        // console.log(this.thread.text);
        // console.log(this.thread.authorName);
        // console.log("COMMON ANCESTOR");
        // console.log(this.thread.range.commonAncestor);
        // console.log("PARENT OF COMMON ANCERSTOR");
        // console.log(this.thread.range.commonAncestor.parentNode); 

        // const commonAncestor = this.thread.range.commonAncestor

        // // get pos of inno. (from db)
        // const innoPos = this.innotationBlockPosition

        // // build innotation item
        // const innotation = document.createElement('nb-innotation')
        // innotation.id = `nb-innotation-block-${this.thread.id}`
        // const text = this.thread.text.length > 200 ? `${this.thread.text.substring(0, 200)}...` : this.thread.text;
        // innotation.innerText = (`${text}\n\n${this.thread.authorName}`)

        // // check if there is a collection for the position?
        // console.log('commonAncestor.childNodes');
        // console.log(commonAncestor.childNodes);
        // console.log(commonAncestor.childNodes.values());
        // console.log(Array.from(commonAncestor.childNodes.values()));
        // const innotationCollection = Array.from(commonAncestor.childNodes.values()).find( elm => { 
        //     console.log('in find collection');
        //     console.log(elm.nodeName.toLowerCase());
        //     console.log(elm.className);
        //     console.log(elm);

        //     return elm.nodeName.toLowerCase() === 'nb-innotation-collection' && elm.className.includes(`nb-${innoPos}`)
        // })
        // console.log(innotationCollection);
        // if (innotationCollection) {
        //     console.log('there is a collection');
        //     // if yes add the innotation
        //     innotationCollection.appendChild(innotation)
        // } else {
        //     console.log('NO collection');

        //     // if not create a collection, edit commonancestor css based on collection then add the innotation
        //     commonAncestor.classList.add('nb-innotation-ancestor', `nb-${innoPos}`)
        //     const innotationCollection =  document.createElement('nb-innotation-collection')

        //     innotationCollection.className = `nb-${innoPos}`
        //     commonAncestor.appendChild(innotationCollection)
        //     innotationCollection.appendChild(innotation)
        // }


        //-----------------------------
        // const newDiv = document.createElement("div")
        // newDiv.className = "nb-innotation"
        // newDiv.innerText=(`${this.thread.text} - ${this.thread.authorName}`)
        // this.thread.range.commonAncestor.insertAdjacentElement('afterend', newDiv)


        // //innotation before
        // const newDiv = document.createElement("div")
        // newDiv.className = "nb-innotation"
        // newDiv.innerText=(`${this.thread.text} - ${this.thread.authorName}`)
        // this.thread.range.commonAncestor.insertAdjacentElement('beforebegin', newDiv)

        
        // this is for the insert right and left 
        // const commentsBlock = document.createElement("div")
        // const parent = commonAncestor.parentNode
        // const wrapperDiv = document.createElement("div")
        // parent.replaceChild(wrapperDiv, commonAncestor)
        // wrapperDiv.appendChild(commonAncestor)
        // wrapperDiv.appendChild(commentsBlock)
        // wrapperDiv.style.display="flex"
        // // wrapperDiv.className = "wrapperDiv"
        // // wrapperDiv.style.position="relative";
        // commentsBlock.style.display="block";
        // commonAncestor.style.display="inline"
        // commonAncestor.style.position="relative"
        
        // wrapperDiv.append(commonAncestor)

        // this.thread.range.commonAncestor.insertAdjacentElement('afterend', newDiv)
        // beforebegin
        // console.log("created FUNCTION"); 

        // console.log(this.thread.range.commonAncestor.nextElementSibling);
        // document.body.insertBefore(newDiv, this.thread.range.commonAncestor)
        // console.log(this.thread);
        // window.dispatchEvent(new Event('resize'))
    },computed:{
        combined(){
            return this.isInline || this.innotationBlockPosition
        }
    },
    watch: {
        combined: function(val) {
            // remove elm if exists
            const elm = document.getElementById(`nb-innotation-block-${this.thread.id}`)
            if (elm) elm.remove()

            if (this.isInline){
                const allAncestor = document.getElementsByClassName('nb-innotation-ancestor')
                const allCollections = document.getElementsByTagName('nb-innotation-collection')
                Array.from(allAncestor).forEach(elm => {
                    console.log(elm);
                    elm.classList.remove('nb-innotation-ancestor')
                    elm.classList.remove('nb-top')
                    elm.classList.remove('nb-bottom')
                    elm.classList.remove('nb-left')
                    elm.classList.remove('nb-right')
                })
                Array.from(allCollections).forEach(elm => elm.remove())
                window.dispatchEvent(new Event('resize'))
                return
            } 

            console.log("=======NEW THREAD===========");
            console.log(this.thread);
            console.log(this.thread.text);
            console.log(this.thread.authorName);
            console.log("COMMON ANCESTOR");
            console.log(this.thread.range.commonAncestor);
            console.log("PARENT OF COMMON ANCERSTOR");
            console.log(this.thread.range.commonAncestor.parentNode); 

            const commonAncestor = this.thread.range.commonAncestor

            // get pos of inno. (from db)
            const innoPos = this.innotationBlockPosition

            // build innotation item
            const innotation = document.createElement('nb-innotation')
            innotation.id = `nb-innotation-block-${this.thread.id}`
            const text = this.thread.text.length > 200 ? `${this.thread.text.substring(0, 200)}...` : this.thread.text;
            innotation.innerText = (`${text}\n\n${this.thread.authorName}`)

            // check if there is a collection for the position?
            console.log('commonAncestor.childNodes');
            console.log(commonAncestor.childNodes);
            console.log(commonAncestor.childNodes.values());
            console.log(Array.from(commonAncestor.childNodes.values()));
            const innotationCollection = Array.from(commonAncestor.childNodes.values()).find( elm => { 
                console.log('in find collection');
                console.log(elm.nodeName.toLowerCase());
                console.log(elm.className);
                console.log(elm);

                return elm.nodeName.toLowerCase() === 'nb-innotation-collection' && elm.className.includes(`nb-${innoPos}`)
            })
            console.log(innotationCollection);
            if (innotationCollection) {
                console.log('there is a collection');
                // if yes add the innotation
                innotationCollection.appendChild(innotation)
            } else {
                console.log('NO collection');

                // if not create a collection, edit commonancestor css based on collection then add the innotation
                commonAncestor.classList.add('nb-innotation-ancestor', `nb-${innoPos}`)
                const innotationCollection =  document.createElement('nb-innotation-collection')

                innotationCollection.className = `nb-${innoPos}`
                commonAncestor.appendChild(innotationCollection)
                innotationCollection.appendChild(innotation)
            }
            window.dispatchEvent(new Event('resize'))

        }
    }

     // TODO: add functions for manipulations
}
</script>