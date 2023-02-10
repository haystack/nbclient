<template>
    <div class="list-view">
        <header class="card-header" v-tooltip="tooltipType" @click="isCollapsed = !isCollapsed">
            <p class="card-header-title">{{title}}</p>
            <a class="button card-header-icon collapse-button">
                <font-awesome-icon icon="chevron-up" v-if="!isCollapsed"/>
                <font-awesome-icon icon="chevron-down" v-if="isCollapsed"/>
            </a>
        </header>
        <div v-if="!isCollapsed">
            <div class="list-control">
                <div class="list-control-header">
                    <font-awesome-icon icon="eye" class="icon"></font-awesome-icon>
                </div>
                <div class="list-control-controls">
                    <span v-tooltip="showHighlights ? 'hide highlights' : 'show highlights'">
                        <font-awesome-icon icon="highlighter" class="icon"></font-awesome-icon>
                        <span @click="toggleHighlights">
                            <font-awesome-icon v-if="showHighlights" icon="toggle-on" class="icon toggle-on"></font-awesome-icon>
                            <font-awesome-icon v-else icon="toggle-off" class="icon"></font-awesome-icon>
                        </span>
                    </span>
                    <span v-tooltip="showSpotlights ? 'hide spotlights' : 'show spotlights'">
                        <font-awesome-icon icon="sun" class="icon"></font-awesome-icon>
                        <span @click="toggleSpotlights">
                            <font-awesome-icon v-if="showSpotlights" icon="toggle-on" class="icon toggle-on"></font-awesome-icon>
                            <font-awesome-icon v-else icon="toggle-off" class="icon"></font-awesome-icon>
                        </span>
                   </span>
                    <span v-tooltip="'redraw highlights'">
                        <span @click="onHandleRedrawHighlights">
                            <font-awesome-icon icon="redo" class="icon"></font-awesome-icon>
                        </span>
                   </span>

                </div>
            </div>
            <div class="list-header">
                <span class="count">
                    <span v-bind:class="{ 'filterdThreads': currentThreadsCount !== totalCount}" v-tooltip="currentThreadsCount !== totalCount ? 'Filter applied' : undefined">{{ currentThreadsCount }}</span> of {{ totalLabel }}
                </span>
                <span class="sort">
                    Sort by:
                    <select v-model="sortBy">
                        <option v-for="option in sortByOptions" :key="option.value" :value="option.value">
                            {{ option.text }}
                        </option>
                    </select>
                </span>
            </div>
            <div class="list-table" :style="style">
                <div v-if="stillGatheringThreads">
                    <p style="text-align: center;font-family: monospace;color: #666;">Fetching Annotations...</p>
                    <tile loading="true"></tile>
                </div>
                <list-row v-else
                    v-for="thread in sorted"
                    :key="thread"
                    :thread="thread"
                    :thread-selected="threadSelected"
                    :threads-hovered="threadsHovered"
                    :current-configs="currentConfigs"
                    :activeClass="activeClass"
                    :show-sync-features="showSyncFeatures"
                    :user="user"
                    :myfollowing="myfollowing"
                    @log-nb="onLogNb"
                    @select-thread="onSelectThread"
                    @hover-thread="$emit('hover-thread', thread)"
                    @unhover-thread="$emit('unhover-thread', thread)">
                </list-row>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import VueSpinners from 'vue-spinners'
import ListRow from './ListRow.vue'
import { compare, compareDomPosition } from '../../utils/compare-util.js'

Vue.use(VueSpinners)

/**
 * Component for the list of threads on the side bar.
 * Each thread is represented by the head of thread {@link NbComment}.
 *
 * @vue-prop {Array<NbComment>} threads=([]) - all visible threads
 * @vue-prop {Number} totalCount=0 - number of all threads (visible and hidden)
 * @vue-prop {NbComment} threadSelected - currently selected thread
 * @vue-prop {Array<NbComment>} threadsHovered=([]) - currently hovered threads
 * @vue-prop {Boolean} showHighlights=true - true if highlights are overlayed
 *   on text, false if collapsed to the side
 *
 * @vue-data {String} sortBy='position' - current sorting option value
 * @vue-data {Array<Object>} sortByOptions - all sorting options, each option
 *   is an object with two string props, text (for labels) and value
 *
 * @vue-computed {String} totalLabel - display label for number of all threads
 * @vue-computed {Array<NbComment>} sorted - all visible threads ordered by
 *   the current sorting option
 *
 * @vue-event {NbComment} select-thread - Emit currently selected thread
 *   when user selects a thread by clicking on the list row
 * @vue-event {NbComment} hover-thread - Emit the hovered thread
 *   when user starts hovering over the list row
 * @vue-event {NbComment} unhover-thread - Emit the unhovered thread
 *   when user stops hovering over the list row
 * @vue-event {Boolean} toggle-highlights - Emit the new highlight visibility
 *   upon change, true to show, false to collapse
 */
export default {
    name: 'list-view',
    props: {
        threads: {
            type: Array,
            default: () => []
        },
        totalCount: { // number of total threads before filter
            type: Number,
            default: 0
        },
        threadSelected: Object,
        threadsHovered: {
            type: Array,
            default: () => []
        },
        showHighlights: {
            type: Boolean,
            default: true
        },
        showSpotlights: {
            type: Boolean,
            default: true
        },
        isEditorVisible: {
            type: Boolean,
            default: false
        },
        stillGatheringThreads: {
            type: Boolean,
            default: true
        },
        user: Object,
        activeClass: {
            type: Object,
            default: () => {}
        },
        currentConfigs: {
            type: Object,
            default: () => {}
        },
        showSyncFeatures: {
            type: Boolean,
            default: false,
        },
        myfollowing: {
            type: Object,
            default: () => []
        },
        filter: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            isCollapsed: false,
            sortBy: "init",
            sortByOptions: [
                { text: 'Most Recent', value: 'recent' },
                { text: 'Location', value: 'position' },
                { text: 'Longest Thread', value: 'comment' },
                { text: 'Reply Requests', value: 'reply_request' },
                { text: 'Upvotes', value: 'upvote' },
                { text: 'Unseen', value: 'unseen'}
            ]
        }
    },
    created: async function () {
        this.sortBy = this.currentConfigs.sortByConfig
    },
    computed: {
        style: function () {
            if (this.threadSelected || this.isEditorVisible) {
                return 'height: 16px;'
            }

            return ''
        },
        currentThreadsCount: function () {
            return this.threads.length
        },
        totalLabel: function () {
            if (this.totalCount === 1) {
                return '1 thread'
            } else {
                return `${this.totalCount} threads`
            }
        },
        sorted: function () {
            switch (this.sortBy) {
                case 'position':
                    return this.threads.concat().sort(compareDomPosition)
                case 'recent':
                    return this.threads.concat().sort(compare('timestamp', 'key', false))
                case 'comment':
                    return this.threads.concat().sort(compare('countAllReplies', 'func', false))
                case 'reply_request':
                    return this.threads.concat().sort(compare('countAllReplyReqs', 'func', false))
                case 'upvote':
                    return this.threads.concat().sort(compare('countAllUpvotes', 'func', false))
                case 'unseen':
                    return this.threads.concat().sort(compare('isUnseen', 'func', false))
                default:
                    return this.threads
            }
        },
        tooltipType: function () {
            return 'See all your threads after applying some filters.'
        },
        title: function () {
            return 'All Threads'
        },
        sortByConfig: function () {
            return this.currentConfigs.sortByConfig
        }
    },
    watch: {
        sortBy: function(newSortBy, oldSortBy) {
            this.currentConfigs.sortByConfig = this.sortBy
            if(oldSortBy !== 'init') {
                this.onLogNb('SORT')
            }
        },
        sortByConfig: function() {
            if(this.sortBy !== this.currentConfigs.sortByConfig) {
                this.sortBy = this.currentConfigs.sortByConfig
            }
            
        }
    },
    methods: {
        onHandleRedrawHighlights: function () {
            this.$emit('handle-redraw-highlights')
        },
        toggleHighlights: function () {
            if( this.showHighlights ) {
                this.onLogNb('HIDE_HIGHLIGHT')
            } else {
                this.onLogNb('SHOW_HIGHLIGHT')
            }
            this.$emit('toggle-highlights', !this.showHighlights)
        },
        toggleSpotlights: function () {
            if( this.showSpotlights ) {
                this.onLogNb('HIDE_SPOTLIGHT')
            } else {
                this.onLogNb('SHOW_SPOTLIGHT')
            }
            this.$emit('toggle-spotlights', !this.showSpotlights)
        },
        onSelectThread: function (thread, threadViewInitiator='NONE') {
            this.$emit('select-thread', thread, threadViewInitiator)
        },
        onLogNb: async function (event='NONE', initiator='NONE', comment = undefined) {
            this.$emit('log-nb', event, initiator, comment)
        }
    },
    components: {
        ListRow
    }
}
</script>
<style>
#nb-app-wrapper .filterdThreads {
    background: yellow;
    border: 2px red dotted;
    border-radius: 3px;
    font-weight: bold;
    font-style: italic;
    padding: 0 5px;
}

#nb-app-wrapper .list-control {
    display: flex;
    position: relative;
    background: #eee;
    border: 1px solid #ccc;
    padding: 2px 5px;
    margin: 4px 0 0px 0;
    align-items: center;
    height: 16px;
    justify-content: center;
}

#nb-app-wrapper .list-control-header {
    float: left;
    position: absolute;
    left: 0;
    background: #ccc;
    top: 0;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    color: #999;
}

#nb-app-wrapper .list-control-controls {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 100%;
    height: 100%;
    margin-left: 24px;
}

#nb-app-wrapper .list-control-controls span {
    display: flex;
    width: 50px;
    justify-content: space-evenly;
    cursor: pointer;
}

#nb-app-wrapper .list-control-controls span .toggle-on {
    color: #4a2270;
}

#nb-app-wrapper .spinner>div {
    background-color: #4a2270;
}
</style>
