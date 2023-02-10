<template>
    <div
        class="list-row"
        v-bind:id = "thread.id"
        :style="rowStyle"
        :key="thread.id"
        @mouseenter="$emit('hover-thread', thread)"
        @mouseleave="$emit('unhover-thread', thread)"
        @click="onClick()">
        <div class="top-line">
             <span v-if="thread.text !== ''" :style="textStyle">
                {{ thread.text }}
            </span>
            <span v-else :style="textStyle">
                {{ thread.type }} by {{authorName}}
            </span>
        </div>
        <div class="bottom-line">
             <div class="flags">
                <div v-if="currentConfigs.isShowNumberOfReplies" class="icon-wrapper counter" :style="counterStyle">
                    {{ thread.countAllReplies() + 1 }}
                </div>
                <div v-if="isSpotlightEnabled">
                    <div v-if="isSpotlighted"  v-tooltip="'Spotlight comment'" class="icon-wrapper inno">
                        {{(spotlight.type === "IN" && "~")   ||
                        (spotlight.type === "ABOVE" && "↑")  ||
                        (spotlight.type === "BELLOW" && "↓") ||
                        (spotlight.type === "LEFT" && "←")  ||
                        (spotlight.type === "RIGHT" && "→") ||
                        (spotlight.type === "MARGIN" && "Ɱ") ||
                        (spotlight.type === "EM" && "❖")}}
                    </div>
                </div>
                <div v-if="currentConfigs.isShowIndicatorForInstructorComment">
                    <div v-if="thread.hasInstructorPost()" v-tooltip="'Comment by an instructor'" class="icon-wrapper instr">
                        i
                    </div>
                    <div v-else-if="thread.isEndorsed()" v-tooltip="'Endorsed by an instructor'" class="icon-wrapper instr-endorsed">
                        i
                    </div>
                </div>
                <div v-if="currentConfigs.isShowIndicatorForTAComment">
                    <div v-if="thread.hasTAPost()" v-tooltip="'Comment by a TA'" class="icon-wrapper ta">
                        TA
                    </div>
                </div>
                <div v-if="currentConfigs.isShowIndicatorForFollowComment">
                    <div v-if="isFollowing" v-tooltip="'Comment by an author you follow'" class="icon-wrapper follow">
                        <font-awesome-icon icon="user-check"></font-awesome-icon>
                    </div>
                    <div v-else class="placeholder follow"></div>
                </div>
                <div v-if="currentConfigs.isShowIndicatorForQuestionedThread">
                    <div v-if="thread.hasReplyRequests()" 
                    v-tooltip="'This comment has a reply request'"
                    class="icon-wrapper question">
                        <font-awesome-icon icon="question"></font-awesome-icon>
                    </div>
                    <div v-else class="placeholder question"></div>
                </div>
                <div v-if="currentConfigs.isShowIndicatorForNotifiedThread">
                    <div v-if="this.showSyncFeatures && thread.associatedNotification !== null" v-tooltip="'This comment has an associated notification'" class="icon-wrapper notification">
                        <font-awesome-icon icon="bell" class="icon"></font-awesome-icon>
                    </div>
                    <div v-else class="placeholder notification"></div>
                </div>
            </div>
            <span class="time" :style="timeStyle"><b>{{ authorName }}</b> <span v-if="currentConfigs.isShowIndicatorForTime">@ {{ ago }}</span></span>
            <div v-if="showSyncFeatures" class="typing">
                <span>
                    <avatar
                        v-for="user in thread.usersTyping" 
                        :key="user"
                        :fullname="user"
                        :size="14"
                    />
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'

/**
 * Component for each row per thread on the side bar list.
 * Each thread is represented by the head of thread {@link NbComment}.
 *
 * @vue-prop {NbComment} thread - thread for this row
 * @vue-prop {NbComment} threadSelected - currently selected thread
 * @vue-prop {Array<NbComment>} threadsHovered=([]) - currently hovered threads
 *
 * @vue-computed {String} rowStyle - additional CSS for row background/font
 *   color in case this is selected or hovered
 * @vue-computed {String} counterStyle - additional CSS for background/font
 *   color of thread length flag in case this is unseen
 * @vue-computed {String} iconStyle - additional CSS for icon color in case
 *   this is selected
 * @vue-computed {String} textStyle - additional CSS for excerpt font weight
 *   in case this is unseen
 *
 * @vue-event {NbComment} select-thread - Emit this thread when user clicks on
 *   this row
 * @vue-event {NbComment} hover-thread - Emit this thread when user starts
 *   hovering over this row
 * @vue-event {NbComment} unhover-thread - Emit this thread when user stops
 *   hovering over this row
 */
import Avatar from 'vue-avatar-component'
import { CommentAnonymity } from '../../models/enums.js'
import moment from 'moment'

export default {
    name: 'list-view',
    props: {
        thread: Object,
        threadSelected: Object,
        threadsHovered: {
            type: Array,
            default: () => []
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
            default: false
        },
        myfollowing: {
            type: Object,
            default: () => []
        },
    },
    data () {
        return {
            ago: '',
            time: '',
            interval:null
        }
    },
    created: function() {
        if (this.currentConfigs.isShowIndicatorForTime) {
            this.time = this.thread.timestamp
            this.interval = setInterval(() => {
                this.ago = moment(this.time).fromNow();
            }, 1000)
        }
    },
    destroyed: function() {
        if (this.currentConfigs.isShowIndicatorForTime) {
            clearInterval(this.interval)
        }
    },
    methods: {
        onClick: function () {
            this.$emit('log-nb', 'CLICK', 'LIST', this.thread)

            const source = window.location.pathname === '/nb_viewer.html' ? window.location.href : window.location.origin + window.location.pathname
            const token = localStorage.getItem("nb.user");
            const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: source } }

            try {
                axios.post(`/api/spotlights/log`, {
                    spotlight_id: null,
                    action: 'CLICK', 
                    type: 'LIST', 
                    annotation_id: this.thread.id, 
                    class_id: this.activeClass.id,
                    role: this.user.role.toUpperCase() 
                }, config)
            } catch (error) {}

            this.$emit('select-thread', this.thread, 'LIST')
        },
    },
    computed: {
        spotlight: function () {
            return this.thread.systemSpotlight ? this.thread.systemSpotlight : this.thread.spotlight
        },
        isFollowing: function(){
            if(this.thread.anonymity !== CommentAnonymity.ANONYMOUS){
                if(this.thread.author !== this.user.id){
                    for(let i = 0; i < this.myfollowing.length; i++){
                        if (this.thread.author === this.myfollowing[i].follower_id){
                            return true
                        }
                    }
                }
            }
            for (let child of this.thread.children) {
                if(child.anonymity !== CommentAnonymity.ANONYMOUS){
                    if(child.author !== this.user.id){
                        for(let i = 0; i < this.myfollowing.length; i++){
                            if (child.author === this.myfollowing[i].follower_id){
                                return true
                            }
                        }
                    }
                }
            }
            
            return false
        },
        isSpotlighted: function () {
            if (this.thread.isSpotlighted()) {
                if (['ABOVE', 'BELLOW', 'LEFT', 'RIGHT', 'IN'].includes(this.spotlight.type) && this.currentConfigs.isInnotation) return true
                if (this.spotlight.type === 'EM' && this.currentConfigs.isEmphasize) return true
                if (this.spotlight.type === 'MARGIN' && this.currentConfigs.isMarginalia) return true
            }

            return false
        },
        isSpotlightEnabled: function () {
            return this.currentConfigs.isShowIndicatorForSpotlitThread && (this.currentConfigs.isMarginalia || this.currentConfigs.isInnotation || this.currentConfigs.isEmphasize)
        },
        rowStyle: function () {
            if (this.threadSelected && this.thread === this.threadSelected) {
                return 'background-color: #70a0f0; color: #fff'
            }
            if (this.threadsHovered.includes(this.thread)) {
                return 'background-color: #ccddf9'
            }
            return null
        },
        counterStyle: function () {
            if (this.thread.isUnseen() && this.currentConfigs.isShowIndicatorForUnseenThread) {
                return 'background-color: #ffff70; color: #7070ff;'
            }
            return null
        },
        textStyle: function () {
            if (this.thread.isUnseen() && this.currentConfigs.isShowIndicatorForUnseenThread) {
                return 'font-weight: bold;'
            }

            if (this.thread.type === 'audio') {
                return 'color: #7a7a7a; font-style: italic; font-size: small;'
            }

            return null
        },
        timeStyle: function () {
            if (this.threadSelected && this.threadSelected.id === this.thread.id) {
                return 'color: #eee;'
            } 
            return ''
        },
        authorName: function () {
            if ((this.thread.anonymity === CommentAnonymity.ANONYMOUS) || this.thread.author === null ) {
                    return 'Anonymous'
            }
            return this.thread.authorName
        },
    },
    watch: {
        /**
        * When the currently selected thread changes, check if the list row is
        * in the view. If not, scroll down/up the list to center the row.
        */
        threadSelected: function (val) {
            if (this.thread !== val) { return }
             setTimeout(() => {
                let el = this.$el
                let elTop = el.offsetTop
                let elHeight = el.clientHeight
                let view = el.parentNode
                let viewTop = view.scrollTop
                let viewHeight = view.clientHeight
                if (elTop < viewTop || (elTop + elHeight) > (viewTop + viewHeight)) {
                    view.scrollTo({
                        top: elTop + (elHeight / 2) - (viewHeight / 2), // bring to center
                        left: 0,
                        behavior: 'smooth'
                    })
                }
            }, 300)
        }
    },
    components: {
        Avatar
    }
}
</script>
