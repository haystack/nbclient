<template>
    
</template>

<script>
import NbInnotationPosition from './NbInnotationPosition'

export default {
    name: 'nb-highlight-bellow',
    props: {
        thread: Object
    },
    created: function() {
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
    const innoPos = NbInnotationPosition.BOTTOM

    // build innotation item
    const innotation = document.createElement('nb-innotation')
    innotation.innerText = (`${this.thread.text} - ${this.thread.authorName}`)

    // check if there is a collection for the position?
    const innotationCollection = commonAncestor.childNodes.find( e => { return e.nodeType === 'nb-innotation-collection' && e.className.contains(`nb-${innoPos}`)})
    
    if (innotationCollection) {
        // if yes add the innotation
        innotationCollection.append(commonAncestor)
    } else {
        // if not create a collection, edit commonancestor css based on collection then add the innotation
        
    }
    
    

//------------------------------


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
   
     }
}
</script>