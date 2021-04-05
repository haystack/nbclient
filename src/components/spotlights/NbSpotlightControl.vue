<template>
    <div class='nb-spotlight-control'>
        <span v-on:click="onClick('X')"  v-bind:class="{ active: !thread.spotlight }">X</span>
        <span v-if="isInnotation" v-on:click="onClick('IN')"        v-bind:class="{ active: thread.spotlight && thread.spotlight.position === 'IN'}">~</span>
        <span v-if="isInnotation" v-on:click="onClick('ABOVE')"     v-bind:class="{ active: thread.spotlight && thread.spotlight.position === 'ABOVE'}">↑</span>
        <span v-if="isInnotation" v-on:click="onClick('BELLOW')"    v-bind:class="{ active: thread.spotlight && thread.spotlight.position === 'BELLOW'}">↓</span>
        <span v-if="isInnotation" v-on:click="onClick('LEFT')"      v-bind:class="{ active: thread.spotlight && thread.spotlight.position === 'LEFT'}">←</span>
        <span v-if="isInnotation" v-on:click="onClick('RIGHT')"     v-bind:class="{ active: thread.spotlight && thread.spotlight.position === 'RIGHT'}">→</span>
        <span v-if="isMarginalia" v-on:click="onClick('MARGIN')"    v-bind:class="{ active: thread.spotlight && thread.spotlight.position === 'MARGIN'}">Ɱ</span>
        <span v-if="isMarginalia||isInnotation" v-on:click="onClick('EM')"        v-bind:class="{ active: thread.spotlight && thread.spotlight.position === 'EM'}">❖</span>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'nb-spotlight-control',
    props: {
        thread: Object,
        isMarginalia: Boolean,
        isInnotation: Boolean,
    },
    methods: {
        onClick: async function (position) {
            if (!this.thread.spotlight && position === 'X') return
            if (this.thread.spotlight && this.thread.spotlight.position === position) return

            const token = localStorage.getItem("nb.user");
            const headers = { headers: { Authorization: 'Bearer ' + token }}

            if (!this.thread.spotlight) {
                const res = await axios.post(`/api/spotlights/spotlight/`, {
                    annotation_id: this.thread.id,
                    position: position
                }, headers)
                
                if (res.status === 200) this.thread.spotlight = res.data
            } else if (position === 'X') {
                const res = await axios.delete(`/api/spotlights/spotlight/${this.thread.spotlight.id}`, headers)

                if (res.status === 200) this.thread.spotlight = null
            } else {
                const res = await axios.put(`/api/spotlights/spotlight/${this.thread.spotlight.id}`, {
                    position: position
                }, headers)

                if (res.status === 200) {
                    this.thread.spotlight.position = position
                    this.thread.updatedDate = Date.now()
                }
            }

        },
    }
}
</script>
