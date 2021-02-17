<template>
    
</template>

<script>
export default {
    name: 'nb-highlight-aside',
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

        //innotation bellow
        const wrapperDiv = document.createElement("div")
        const commonAncestor = this.thread.range.commonAncestor
        const parent = commonAncestor.parentNode
        const innotationDiv = document.createElement("div")
        parent.replaceChild(wrapperDiv, commonAncestor)
        wrapperDiv.append(commonAncestor)
        wrapperDiv.className = "nb-innotation-wrapper aside"
        innotationDiv.className = "nb-innotation"
        commonAncestor.className = "nb-common-ancestor"
        innotationDiv.innerText=(`${this.thread.text} - ${this.thread.authorName}`)
        commonAncestor.insertAdjacentElement('beforebegin', innotationDiv)
    
     }
}
</script>