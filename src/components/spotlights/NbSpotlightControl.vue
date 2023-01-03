<template>
    <div class='nb-spotlight-control' :style="style"  v-tooltip="tooltip">
        <span v-on:click="onClick('X')"  v-bind:class="{ active: !thread.spotlight }">X</span>
        <span v-if="currentConfigs.isInnotation" v-on:click="onClick('IN')"        v-bind:class="{ active: thread.spotlight && thread.spotlight.type === 'IN'}">~</span>
        <span v-if="currentConfigs.isInnotation" v-on:click="onClick('ABOVE')"     v-bind:class="{ active: thread.spotlight && thread.spotlight.type === 'ABOVE'}">↑</span>
        <span v-if="currentConfigs.isInnotation" v-on:click="onClick('BELLOW')"    v-bind:class="{ active: thread.spotlight && thread.spotlight.type === 'BELLOW'}">↓</span>
        <span v-if="currentConfigs.isInnotation" v-on:click="onClick('LEFT')"      v-bind:class="{ active: thread.spotlight && thread.spotlight.type === 'LEFT'}">←</span>
        <span v-if="currentConfigs.isInnotation" v-on:click="onClick('RIGHT')"     v-bind:class="{ active: thread.spotlight && thread.spotlight.type === 'RIGHT'}">→</span>
        <span v-if="currentConfigs.isMarginalia" v-on:click="onClick('MARGIN')"    v-bind:class="{ active: thread.spotlight && thread.spotlight.type === 'MARGIN'}">Ɱ</span>
        <span v-if="currentConfigs.isEmphasize"  v-on:click="onClick('EM')"        v-bind:class="{ active: thread.spotlight && thread.spotlight.type === 'EM'}">❖</span>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'nb-spotlight-control',
    props: {
        thread: Object,
        currentConfigs: {
            type: Object,
            default: () => {}
        },
    },
    computed: {
        style: function () {
            if (this.thread.spotlight && !this.thread.spotlight.id) {
                return `cursor: not-allowed; opacity: 0.4;`
            }
            return ``
        },
        tooltip: function () {
            if (this.thread.spotlight && !this.thread.spotlight.id) {
                return `The system overrides this thread spotlight`
            }
            return ``
        }
    },
    methods: {
        onClick: async function (type) {
            if (!this.thread.spotlight && type === 'X') return
            if (this.thread.spotlight && this.thread.spotlight.type === type) return

            const token = localStorage.getItem("nb.user");
            const headers = { headers: { Authorization: 'Bearer ' + token }}

            if (!this.thread.spotlight) {
                const res = await axios.post(`/api/spotlights/spotlight/`, {
                    annotation_id: this.thread.id,
                    type: type
                }, headers)
                
                if (res.status === 200) this.thread.spotlight = res.data
            } else if (type === 'X') {
                const res = await axios.delete(`/api/spotlights/spotlight/${this.thread.spotlight.id}`, headers)

                if (res.status === 200) {
                    this.thread.spotlight.type = 'NONE'
                    this.thread.updatedDate = Date.now()
                }
            } else {
                const res = await axios.put(`/api/spotlights/spotlight/${this.thread.spotlight.id}`, {
                    type: type
                }, headers)

                if (res.status === 200) {
                    this.thread.spotlight.type = type
                    this.thread.updatedDate = Date.now()
                }
            }

        },
    }
}
</script>
