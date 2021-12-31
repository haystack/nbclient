<template>
    <div id="nb-sidebar" class="nb-sidebar" v-bind:class="{ draggable: isDraggable || editor.visible, 'animatable-width': !isDragging }" @mousedown="mouseDown" :style="style">
        <nav-bar :me="user" @logout="$emit('logout')"></nav-bar>
        <div class="nb-menu" v-if="myClasses.length > 1">
            <nb-menu 
                :myClasses="myClasses" 
                :activeClass="activeClass"
                @switch-class="onSwitchClass">
            </nb-menu>
        </div>
        <nb-online
            v-if="syncConfig"
            :online-users="onlineUsers"
            :show-sync-features="showSyncFeatures"
            :nb-menu-showing="myClasses.length > 1"
            :number-notifications-unseen="numberNotificationsUnseen"
            :notifications-muted="notificationsMuted"
            @show-sync-features="onShowSyncFeatures"
            @toggle-mute-notifications="onToggleMuteNotifications"
            @open-draggable-notifications="onOpenDraggableNotifications"
            @open-sidebar-notifications="onOpenSidebarNotifications">
        </nb-online>
        <filter-view
            :me="user"
            :users="sortedUsers"
            :hashtags="sortedHashtags"
            :sync-config="syncConfig"
            @search-option="onSearchOption"
            @search-text="onSearchText"
            @filter-bookmarks="onFilterBookmarks"
            @filter-hashtags="onFilterHashtags"
            @filter-user-tags="onFilterUserTags"
            @filter-comments="onFilterComments"
            @filter-reply-reqs="onFilterReplyReqs"
            @filter-upvotes="onFilterUpvotes"
            @min-words="onMinWords"
            @max-words="onMaxWords"
            @min-hashtags="onMinHashtags"
            @max-hashtags="onMaxHashtags"
            @min-replies="onMinReplies"
            @min-reply-reqs="onMinReplyReqs"
            @min-upvotes="onMinUpvotes">
        </filter-view>
        <list-view
            :threads="threads"
            :total-count="totalThreads"
            :thread-selected="threadSelected"
            :threads-hovered="threadsHovered"
            :show-highlights="showHighlights"
            :still-gathering-threads="stillGatheringThreads"
            :current-configs="currentConfigs"
            :activeClass="activeClass"
            :user="user"
            :show-sync-features="showSyncFeatures"
            @log-nb="onLogNb"
            @toggle-highlights="onToggleHighlights"
            @select-thread="onSelectThread"
            @hover-thread="onHoverThread"
            @unhover-thread="onUnhoverThread">
        </list-view>
        <notification-view
            v-if="showSyncFeatures && sidebarNotificationsOpened"
            :notifications="notificationThreads"
            :total-count="notificationThreads.length"
            :thread-selected="threadSelected"
            :notification-selected="notificationSelected"
            :threads-hovered="threadsHovered"
            :show-highlights="showHighlights"
            :still-gathering-threads="stillGatheringThreads"
            :draggable-notifications-opened="draggableNotificationsOpened"
            :notifications-muted="notificationsMuted"
            :activeClass="activeClass"
            :user="user"
            @toggle-highlights="onToggleHighlights"
            @select-notification="onSelectNotification"
            @hover-thread="onHoverThread"
            @unhover-thread="onUnhoverThread"
            @toggle-mute-notifications="onToggleMuteNotifications"
            @undock-draggable-notifications="onUndockDraggableNotifications"
            @close-sidebar-notifications="onCloseSidebarNotifications"
        >
        </notification-view>
        <thread-view
            v-if="threadSelected"
            :thread="threadSelected"
            :me="user"
            :replyToComment="replyToComment"
            :current-configs="currentConfigs"
            :activeClass="activeClass"
            :thread-view-initiator="threadViewInitiator"
            @log-nb="onLogNb"
            @edit-comment="onEditComment"
            @delete-comment="onDeleteComment"
            @draft-reply="onDraftReply"
            @submit-small-comment="onSubmitSmallComment"
            @prev-comment="onPrevComment"
            @next-comment="onNextComment">
        </thread-view>
        <editor-view
            :author="user"
            :key="editor.key"
            :visible="editor.visible"
            :header="editor.header"
            :initial-content="editor.initialContent"
            :initial-visibility="editor.initialSettings.visibility"
            :initial-anonymity="editor.initialSettings.anonymity"
            :initial-reply-request="editor.initialSettings.replyRequested"
            :users="sortedUsers"
            :hashtags="sortedHashtags"
            @editor-empty="onEditorEmpty"
            @submit-comment="onSubmitComment"
            @cancel-comment="onCancelComment"
            @thread-typing="onThreadTyping"
            @thread-stop-typing="onThreadStopTyping">
        </editor-view>
    </div>
</template>

<script>
import htmlToText from 'html-to-text'
import { compare } from '../utils/compare-util.js'
import { CommentVisibility, CommentAnonymity } from '../models/enums.js'
import NbComment from '../models/nbcomment.js'
import NavBar from './NavBar.vue'
import FilterView from './filters/FilterView.vue'
import ListView from './list/ListView.vue'
import NotificationView from './list/NotificationView.vue'
import ThreadView from './thread/ThreadView.vue'
import EditorView from './editor/EditorView.vue'
import NbMenu from './NbMenu.vue'
import NbOnline from './NbOnline.vue'

const SIDEBAR_BORDER_SIZE = 8;
const SIDEBAR_MIN_WIDTH = 300

export default {
    name: 'nb-sidebar',
    props: {
        user: {
            type: Object,
            default: () => {}
        },
        users: {
            type: Object,
            default: () => {}
        },
        onlineUsers: {
          type: Object,
          default: () => {}
      },
        myClasses: {
            type: Array,
            default: () => []
        },
        activeClass: {
            type: Object,
            default: () => {}
        },
        hashtags: {
            type: Object,
            default: () => {}
        },
        totalThreads: { // count of total threads before filter
            type: Number,
            default: 0
        },
        stillGatheringThreads: {
            type: Boolean,
            default: true
        },
        currentConfigs: {
            type: Object,
            default: () => {}
        },
        threads: { // threads after filter
            type: Object,
            default: () => {}
        },
        threadSelected: Object,
        notificationSelected: Object,
        threadsHovered: {
            type: Array,
            default: () => []
        },
        draftRange: Object,
        showHighlights: {
            type: Boolean,
            default: true
        },
        sourceUrl: {
            type: String,
            default: ""
        },
        activeClass: Object,
        threadViewInitiator: String,
        isDragging: Boolean,
        sidebarWidth: Number,
        notificationThreads: {
          type: Array,
          default: () => []
        },
        showSyncFeatures: {
          type: Boolean,
          default: false
        },
        notificationsMuted: {
          type: Boolean,
          default: false
        },
        draggableNotificationsOpened: {
          type: Boolean,
          default: false
        },
        sidebarNotificationsOpened: {
          type: Boolean,
          default: false
        },
        syncConfig: {
          type: Boolean,
          default: false
        },
    },
    data () {
        return {
            replyToComment: null,
            edittingComment: null,
            editor: {
                key: Date.now(),
                visible: false,
                header: '',
                initialContent: null,
                initialSettings: {
                    visibility: CommentVisibility.EVERYONE,
                    anonymity: CommentAnonymity.IDENTIFIED,
                    replyRequested: false
                },
                isEmpty: true,
                isDraggable: false,
            },
        }
    },
    computed: {
        sortedUsers: function () {
            let items = Object.values(this.users)
            for (let item of items) {
                Object.assign(item, { value: `${item.name.first} ${item.name.last}` })
            }
            return items.sort(compare('value'))
        },
        sortedHashtags: function () {
            return Object.values(this.hashtags).sort(compare('value'))
        },
        numberNotificationsUnseen: function () {
          return this.notificationThreads.filter(n => n.unseen).length
        },
        style: function () {
            if (this.threadSelected || this.editor.visible) {
                return `width: ${this.sidebarWidth}px`
            }
            return `width: ${SIDEBAR_MIN_WIDTH}px`
        }
    },
    watch: {
        draftRange: function (val, oldVal) {
            if (val) {
                if (this.replyToComment || this.edittingComment) {
                    alert("You're already working on another comment. Please save or cancel it first.")
                    this.$emit('cancel-draft', this.draftRange)
                    return
                }
                if (!oldVal) { // Init editor only if it's not open yet.
                    this.initEditor('New Comment', null, {}, true)
                }
            } else {
                // No new thread, not replying or editting
                if (!this.replyToComment && !this.edittingComment) {
                    this.editor.visible = false
                }
            }
        },
        threadSelected: function (val) {
            if (!val && this.replyToComment && this.editor.isEmpty) {
                // When thread is unselected, cancel reply if editor is empty.
                this.editor.visible = false
                this.replyToComment = null
            }

            val ? this.isDraggable = true : this.isDraggable = false
        }
    },
    methods: {
        mouseDown: function (e) {
            if (e.offsetX < SIDEBAR_BORDER_SIZE && (this.threadSelected || this.editor.visible)) {
                e.preventDefault()
                this.mousePosition = e.x
                this.$emit('set-mouse-position', e.x)
                this.$emit('dragging', true)
            }
        },
        onSwitchClass: function (newClass) {
            this.$emit('switch-class', newClass)
        },
        onShowSyncFeatures: function (showSyncFeatures) {
          this.$emit('show-sync-features', showSyncFeatures)
        },
        onToggleHighlights: function (show) {
            this.$emit('toggle-highlights', show)
        },
        onSearchOption: function (option) {
            this.$emit('search-option', option)
        },
        onSearchText: function (text) {
            this.$emit('search-text', text)
        },
        onFilterBookmarks: function (filter) {
            this.$emit('filter-bookmarks', filter)
        },
        onFilterHashtags: function (hashtags) {
            this.$emit('filter-hashtags', hashtags)
        },
        onFilterUserTags: function (filters) {
            this.$emit('filter-user-tags', filters)
        },
        onFilterComments: function (filters) {
            this.$emit('filter-comments', filters)
        },
        onFilterReplyReqs: function (filter) {
            this.$emit('filter-reply-reqs', filter)
        },
        onFilterUpvotes: function (filter) {
            this.$emit('filter-upvotes', filter)
        },
        onMinWords: function (min) {
            this.$emit('min-words', min)
        },
        onMaxWords: function (max) {
            this.$emit('max-words', max)
        },
        onMinHashtags: function (min) {
            this.$emit('min-hashtags', min)
        },
        onMaxHashtags: function (max) {
            this.$emit('max-hashtags', max)
        },
        onMinReplies: function (min) {
            this.$emit('min-replies', min)
        },
        onMinReplyReqs: function (min) {
            this.$emit('min-reply-reqs', min)
        },
        onMinUpvotes: function (min) {
            this.$emit('min-upvotes', min)
        },
        onSelectThread: function (thread, threadViewInitiator='NONE') {
            this.$emit('select-thread', thread, threadViewInitiator)
        },
        onSelectNotification: function (notification) {
          this.$emit('select-notification', notification)
        },
        onHoverThread: function (thread) {
            this.$emit('hover-thread', thread)
        },
        onUnhoverThread: function (thread) {
            this.$emit('unhover-thread', thread)
        },
        onEditComment: function (comment) {
            if (this.draftRange || this.replyToComment) {
                alert("You're already working on another comment. Please save or cancel it first.")
                return
            }
            let settings = {
                visibility: comment.visibility,
                anonymity: comment.anonymity,
                replyRequested: comment.replyRequestedByMe
            }
            this.edittingComment = comment
            this.initEditor('Edit Comment', comment.html, settings, true)
        },
        onDeleteComment: function (comment) {
            if (comment.parent) { // reply
                comment.parent.removeChild(comment)
            } else { // head of thread
                this.$emit('delete-thread', comment)
            }
        },
        onDraftReply: function (comment) {
            if (this.draftRange || this.edittingComment) {
                alert("You're already working on another comment. Please save or cancel it first.")
                return
            }
            this.replyToComment = comment
            this.initEditor(`re: ${comment.text}`, null, {}, true)
        },
        onEditorEmpty: function (isEmpty) {
            this.editor.isEmpty = isEmpty
            this.$emit('editor-empty', isEmpty)
        },
        onSubmitSmallComment: function (data) {
            let comment = new NbComment({
                id: null, // will be updated when submitAnnotation() is called
                range: null, // null if this is reply
                parent: data.replyToComment.parent, // null if this is the head of thread
                timestamp: null,
                author: this.user.id,
                authorName: `${this.user.name.first} ${this.user.name.last}`,
                instructor: this.user.role === 'instructor',
                html: data.html,
                hashtags: [],
                people: [],
                visibility: CommentVisibility.EVERYONE,
                anonymity: CommentAnonymity.IDENTIFIED,
                replyRequestedByMe: false,
                replyRequestCount: 0,
                upvotedByMe: false,
                upvoteCount: 0,
                seenByMe: true,
            })
            let source = this.sourceUrl.length > 0 ? this.sourceUrl : window.location.href.split('?')[0]
            comment.submitAnnotation(this.activeClass.id, source, this.threadViewInitiator, data.replyToComment, this.activeClass, this.user, this.onLogNb)
            if (data.replyToComment.parent) {
                data.replyToComment.parent.children.push(comment)
            }
        },
        onSubmitComment: function (data) {
            this.editor.visible = false
            if (this.edittingComment) {
                this.edittingComment.saveUpdates(data)
                this.edittingComment = null
                return
            }
            let comment = new NbComment({
                id: null, // will be updated when submitAnnotation() is called
                range: this.draftRange, // null if this is reply
                parent: this.replyToComment, // null if this is the head of thread
                timestamp: null,
                author: this.user.id,
                authorName: `${this.user.name.first} ${this.user.name.last}`,
                instructor: this.user.role === 'instructor',
                html: data.html,
                hashtags: data.mentions.hashtags,
                people: data.mentions.users,
                visibility: data.visibility,
                anonymity: data.anonymity,
                replyRequestedByMe: data.replyRequested,
                replyRequestCount: data.replyRequested ? 1 : 0,
                upvotedByMe: false,
                upvoteCount: 0,
                seenByMe: true
            })
            let source = this.sourceUrl.length > 0 ? this.sourceUrl : window.location.href.split('?')[0]
            comment.submitAnnotation(this.activeClass.id, source, this.threadViewInitiator, this.replyToComment, this.activeClass, this.user, this.onLogNb)
            if (this.draftRange) {
                this.$emit('new-thread', comment)
            } else if (this.replyToComment) {
                this.replyToComment.children.push(comment)
                this.replyToComment = null
            }
        },
        onCancelComment: function () {
            this.editor.visible = false
            if (this.draftRange) {
                this.$emit('cancel-draft', this.draftRange)
            } else if (this.replyToComment) {
                this.replyToComment = null
            } else if (this.edittingComment) {
                this.edittingComment = null
            }
        },
        initEditor: function (header, content, settings, visible) {
            this.editor.key = Date.now() // work around to force redraw editor
            this.editor.header = header
            this.editor.initialContent = content

            let plaintext = htmlToText.fromString(content, { wordwrap: false })
            this.editor.isEmpty = (plaintext === '')
            this.$emit('editor-empty', this.editor.isEmpty)

            let defaultSettings = {
              visibility: CommentVisibility.EVERYONE,
              anonymity: CommentAnonymity.IDENTIFIED,
              replyRequested: false
            }
            this.editor.initialSettings = Object.assign(defaultSettings, settings)
            this.editor.visible = visible
        },
        onThreadTyping: function(val) {
            if (this.threadSelected) {
                this.$emit('thread-typing', this.threadSelected.id)
            }
        },
        onThreadStopTyping: function(val) {
            if (this.threadSelected) {
                this.$emit('thread-stop-typing', this.threadSelected.id)
            }
        },
        onPrevComment: function () {
            this.$emit('prev-comment')
        },
        onNextComment: function () {
            this.$emit('next-comment')
        },
        onToggleMuteNotifications: function () {
            this.$emit('toggle-mute-notifications')
        },
        onUndockDraggableNotifications: function () {
            this.$emit('undock-draggable-notifications')
        },
        onOpenDraggableNotifications: function () {
            this.$emit('open-draggable-notifications')
        },
        onOpenSidebarNotifications: function () {
            this.$emit('open-sidebar-notifications')
        },
        onCloseSidebarNotifications: function () {
            this.$emit('close-sidebar-notifications')
        },
        onLogNb: async function (event='NONE', initiator='NONE', spotlightType='NONE', isSyncAnnotation=false, hasSyncAnnotation = false, annotationId=null, countAnnotationReplies=0) {
            this.$emit('log-nb', event, initiator, spotlightType, isSyncAnnotation, hasSyncAnnotation, annotationId, countAnnotationReplies)
        }
    },
    components: {
        NavBar,
        FilterView,
        ListView,
        ThreadView,
        EditorView,
        NbMenu,
        NotificationView,
        NbOnline,
    }
}
</script>
