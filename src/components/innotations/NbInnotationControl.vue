<template>
    <div class='nb-inno-control'>
        <span v-on:click="onClick('X')"     v-bind:class="{ active: !thread.innotation }">X</span>
        <span v-on:click="onClick('IN')"    v-bind:class="{ active: thread.innotation && thread.innotation.position === 'IN'}">~</span>
        <span v-on:click="onClick('ABOVE')"    v-bind:class="{ active: thread.innotation && thread.innotation.position === 'ABOVE'}">↑</span>
        <span v-on:click="onClick('BELLOW')"  v-bind:class="{ active: thread.innotation && thread.innotation.position === 'BELLOW'}">↓</span>
        <span v-on:click="onClick('LEFT')"  v-bind:class="{ active: thread.innotation && thread.innotation.position === 'LEFT'}">←</span>
        <span v-on:click="onClick('RIGHT')" v-bind:class="{ active: thread.innotation && thread.innotation.position === 'RIGHT'}">→</span>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'nb-innotation-control',
    props: {
        thread: Object,
    },
    methods: {
        onClick: async function (position) {
            if (!this.thread.innotation && position === 'X') return
            if (this.thread.innotation && this.thread.innotation.position === position) return

            const token = localStorage.getItem("nb.user");
            const headers = { headers: { Authorization: 'Bearer ' + token }}

            if (!this.thread.innotation) {
                const res = await axios.post(`/api/innotations/innotation/`, {
                    annotation_id: this.thread.id,
                    position: position
                }, headers)
                
                if (res.status === 200) this.thread.innotation = res.data
            } else if (position === 'X') {
                const res = await axios.delete(`/api/innotations/innotation/${this.thread.innotation.id}`, headers)

                if (res.status === 200) this.thread.innotation = null
            } else {
                const res = await axios.put(`/api/innotations/innotation/${this.thread.innotation.id}`, {
                    position: position
                }, headers)

                if (res.status === 200) {
                    this.thread.innotation.position = position
                    this.thread.updatedDate = Date.now()
                }
            }

        },
    }
}
</script>
