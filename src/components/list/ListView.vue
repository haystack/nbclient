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
            <div class="list-header">
                <div class="list-header-container">
                <span class="count">
                    {{ threads.length }} of {{ totalLabel }}
                </span>
                <span class="toggle-highlights" v-tooltip="showHighlights ? 'hide highlights' : 'show highlights'" @click="toggleHighlights">
                    <font-awesome-icon v-if="showHighlights" icon="eye" class="icon"></font-awesome-icon>
                    <font-awesome-icon v-else icon="eye-slash" class="icon"></font-awesome-icon>
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
                <div class="range">
                    <input type="range" min="1" max="100" value="50" id="myRange">
                    0 of 2 authors shown
                </div>
            </div>
            <div class="list-table">
                <div v-if="stillGatheringThreads">
                    <p>Fetching Annotations</p>
                    <tile loading="true"></tile>
                </div>
                <list-row
                    v-for="thread in sorted"
                    :key="thread"
                    :thread="thread"
                    :thread-selected="threadSelected"
                    :threads-hovered="threadsHovered"
                    :current-configs="currentConfigs"
                    :activeClass="activeClass"
                    :show-sync-features="showSyncFeatures"
                    :user="user"
                    @log-exp-spotlight="onLogExpSpotlight"
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
        }
    },
    data () {
        return {
            isCollapsed: false,
            sortBy: "position",
            sortByOptions: [
                { text: 'Default', value: 'position' },
                { text: 'Most Recent', value: 'recent' },
                { text: 'Longest Thread', value: 'comment' },
                { text: 'Reply Requests', value: 'reply_request' },
                { text: 'Upvotes', value: 'upvote' },
                { text: 'Unseen', value: 'unseen'}
            ]
        }
    },
    computed: {
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
    },
    methods: {
        toggleHighlights: function () {
            if( this.showHighlights ) {
                this.onLogExpSpotlight('HIDE_HIGHLIGHT')
            } else {
                this.onLogExpSpotlight('SHOW_HIGHLIGHT')
            }
            this.$emit('toggle-highlights', !this.showHighlights)
        },
        onSelectThread: function (thread, threadViewInitiator='NONE') {
            this.$emit('select-thread', thread, threadViewInitiator)
        },
        onLogExpSpotlight: async function (event = 'NONE', initiator = 'NONE', type = 'NONE', highQuality = false, annotationId = null, annotation_replies_count = 0) {
            this.$emit('log-exp-spotlight', event, initiator, type, highQuality, annotationId, annotation_replies_count)
        }
    },
    components: {
        ListRow
    }
}
</script>
