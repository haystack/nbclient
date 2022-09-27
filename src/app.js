import Vue from 'vue'
import VueQuill from 'vue-quill'
import VTooltip from 'v-tooltip'
import Notifications from 'vue-notification'
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { faChevronDown, faChevronUp, faUserCheck, faUserPlus, faCheckSquare } from '@fortawesome/free-solid-svg-icons'
import { createNbRange, deserializeNbRange } from './models/nbrange.js'
import NbComment from './models/nbcomment.js'
import CommentAnonymity  from './models/enums.js'
import NbNotification from './models/nbnotification.js'
import { isNodePartOf } from './utils/dom-util.js'
import { compare, compareDomPosition } from './utils/compare-util.js'
import NbInnotations from './components/spotlights/innotations/NbInnotations.vue'
import NbMarginalias from './components/spotlights/marginalias/NbMarginalias.vue'
import NbHighlights from './components/highlights/NbHighlights.vue'
import NbSidebar from './components/NbSidebar.vue'
import NbNotificationSidebar from './components/NbNotificationSidebar.vue'
import NbNoAccess from './components/NbNoAccess.vue'
import NbLogin from './components/NbLogin.vue'
import axios from 'axios'
import VueJwtDecode from "vue-jwt-decode";
import io from "socket.io-client";
import { Environments } from './environments'
import hash from 'hash.js'
import { max } from 'moment';

const currentEnv = Environments.dev

Vue.use(VueQuill)
Vue.use(VTooltip)
Vue.use(Notifications)
Vue.use(VueSweetalert2);
Vue.component('font-awesome-icon', FontAwesomeIcon)
library.add(fas, far, faChevronDown, faChevronUp, faUserCheck, faUserPlus, faCheckSquare)
const socket = io(currentEnv.baseURL, { reconnect: true })
axios.defaults.baseURL = `${currentEnv.baseURL}/`
export const PLUGIN_HOST_URL = currentEnv.pluginURL
export const BASE_HOST_URL = currentEnv.baseURL
axios.defaults.withCredentials = true

if ((document.attachEvent && document.readyState === 'complete') || (!document.attachEvent && document.readyState !== 'loading')) {
    embedNbApp()
} else {
    document.addEventListener('DOMContentLoaded', embedNbApp)
}

/**
 * Load a CSS stylesheet tag.
 * @param {string} url - Link to the stylesheet
 * @param {HTMLElement} [container = first <head> element] - DOM element to insert the link to
 */
function loadCSS(url, container = document.getElementsByTagName('HEAD')[0]) {
    let tag = document.createElement('link')
    tag.rel = 'stylesheet'
    tag.type = 'text/css'
    tag.href = url
    container.appendChild(tag)
}

/**
 * Load a JS embed tag.
 * @param {string} url - Link to the script
 */
function loadScript(url) {
    let tag = document.createElement('script')
    tag.src = url
    document.getElementsByTagName('HEAD')[0].appendChild(tag)
}

/** Embed NB sidebar. */
function embedNbApp() {
    loadCSS('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha1/katex.min.css')
    loadCSS('https://cdn.quilljs.com/1.3.6/quill.snow.css')
    loadCSS(`${PLUGIN_HOST_URL}/style/plugin.css`)
    loadCSS(`${PLUGIN_HOST_URL}/style/tooltip.css`)
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha1/katex.min.js')
    document.documentElement.setAttribute('style', 'overflow: overlay !important;')
    if (!window.location.search.includes('documap=true')) {
        document.body.setAttribute('style', 'position: initial !important; margin: 0 325px 0 0 !important;')
    } else {
        document.body.classList.add('nb-documap')
        document.getElementsByTagName('html')[0].setAttribute('style', 'height: 100%; background: #f4ad3e;')
    }
    let element = document.createElement('div')
    element.id = 'nb-app-wrapper'
    let child = document.createElement('div')
    child.id = 'nb-app'
    element.appendChild(child)
    document.body.appendChild(element)

    /**
     * User in NB.
     * @typedef {Object} NbUser
     * @property {String} id - user ID
     * @property {String} username - username
     * @property {String} role - role in the current course: null (not enrolled),
     *   'student', or 'instructor'
     * @property {Object} me.name - display names
     * @property {String} me.name.first - first name
     * @property {String} me.name.last - last name
     */

    /**
     * Hashtag in NB.
     * @typedef {Object} NbHashtag
     * @property {String} id - hashtag ID
     * @property {String} value - string labels
     * @property {String} emoji - unicode for emoji label
     */

    let app = new Vue({
        el: '#nb-app',
        template: `
        <div id="nb-app" :style="style" @mouseup="mouseUp" @mousemove="mouseMove">
            <div v-if="!user" class="nb-sidebar">
                <nb-login @login="setUser"></nb-login>
            </div>
            <div v-else-if="myClasses.length < 1">
                <nb-no-access :user="user" @logout="onLogout"></nb-no-acess>
            </div>
            <div v-else>
                <nb-innotations
                    v-if="currentConfigs.isInnotation"
                    :innotationsBlock="innotationsBlock"
                    :innotationsInline="innotationsInline"
                    :show-highlights="showHighlights"
                    :thread-selected="threadSelected"
                    :user="user"
                    :activeClass="activeClass"
                    @log-nb="onLogNb"
                    @select-thread="onSelectThread"
                    @unselect-thread="onUnselectThread"
                    @hover-innotation="onHoverInnotation"
                    @unhover-innotation="onUnhoverInnotation">
                </nb-innotations>
                <nb-marginalias
                    v-if="currentConfigs.isMarginalia"
                    :marginalias="marginalias"
                    :show-highlights="showHighlights"
                    :thread-selected="threadSelected"
                    :threads-hovered="threadsHovered"
                    :user="user"
                    :activeClass="activeClass"
                    @log-nb="onLogNb"
                    @select-thread="onSelectThread"
                    @unselect-thread="onUnselectThread"
                    @hover-thread="onHoverThread"
                    @unhover-thread="onUnhoverThread">
                </nb-marginalias>
                <notifications position="top left" group="recentlyAddedThreads" />
                <nb-highlights
                    :key="redrawHighlightsKey"
                    :threads="filteredThreads"
                    :thread-selected="threadSelected"
                    :threads-hovered="threadsHovered"
                    :draft-range="draftRange"
                    :show-highlights="showHighlights"
                    :heatmapMode="heatmapMode"
                    :user="user"
                    :activeClass="activeClass"
                    :current-configs="currentConfigs"
                    :show-sync-features="showSyncFeatures"
                    :is-innotation-hover="isInnotationHover"
                    :hashtags="hashtags"
                    @log-nb="onLogNb"
                    @select-thread="onSelectThread"
                    @unselect-thread="onUnselectThread"
                    @hover-thread="onHoverThread"
                    @unhover-thread="onUnhoverThread"
                    @new-recent-thread="onNewRecentThread">
                </nb-highlights>
                <nb-notification-sidebar
                    v-if="syncConfig"
                    :user="user"
                    :users="users"
                    :activeClass="activeClass"
                    :online-users="onlineUsers"
                    :still-gathering-threads="stillGatheringThreads"
                    :threads="filteredThreads"
                    :notification-selected="notificationSelected"
                    :thread-selected="threadSelected"
                    :notification-threads="notificationThreads"
                    :threads-hovered="threadsHovered"
                    :show-highlights="showHighlights"
                    :show-sync-features="showSyncFeatures"
                    :draggable-notifications-opened="draggableNotificationsOpened"
                    :notifications-muted="notificationsMuted"
                    @toggle-highlights="onToggleHighlights"
                    @select-notification="onSelectNotification"
                    @hover-thread="onHoverThread"
                    @unhover-thread="onUnhoverThread"
                    @toggle-mute-notifications="onToggleMuteNotifications"
                    @dock-draggable-notifications="onDockDraggableNotifications"
                    @close-draggable-notications="onCloseDraggableNotifications">
                </nb-notification-sidebar>
                <nb-sidebar
                    :user="user"
                    :users="users"
                    :online-users="onlineUsers"
                    :myClasses="myClasses"
                    :activeClass="activeClass"
                    :hashtags="hashtags"
                    :still-gathering-threads="stillGatheringThreads"
                    :total-threads="totalThreads"
                    :threads="filteredThreads"
                    :thread-selected="threadSelected"
                    :notification-selected="notificationSelected"
                    :notification-threads="notificationThreads"
                    :threads-hovered="threadsHovered"
                    :draft-range="draftRange"
                    :show-highlights="showHighlights"
                    :heatmapMode="heatmapMode"
                    :source-url="sourceURL"
                    :current-configs="currentConfigs"
                    :is-dragging="isDragging"
                    :sidebar-width="sidebarWidth"
                    :thread-view-initiator="threadViewInitiator"
                    :draggable-notifications-opened="draggableNotificationsOpened"
                    :sidebar-notifications-opened="sidebarNotificationsOpened"
                    :notifications-muted="notificationsMuted"
                    :show-sync-features="showSyncFeatures"
                    :sync-config="syncConfig"
                    :minThreads="minThreads"
                    :maxThreads="maxThreads"
                    :numberOfThreads="numberOfThreads"
                    :myfollowing="myfollowing"
                    :filter="filter"
                    @log-nb="onLogNb"
                    @add-author-section="onAddAuthorSection"
                    @remove-author-section="onRemoveAuthorSection"
                    @switch-class="onSwitchClass"
                    @show-sync-features="onShowSyncFeatures"
                    @toggle-mute-notifications="onToggleMuteNotifications"
                    @undock-draggable-notifications="onUndockDraggableNotifications"
                    @open-draggable-notifications="onOpenDraggableNotifications"
                    @open-sidebar-notifications="onOpenSidebarNotifications"
                    @close-sidebar-notifications="onCloseSidebarNotifications"
                    @thread-typing="onThreadTyping"
                    @thread-stop-typing="onThreadStopTyping"
                    @toggle-highlights="onToggleHighlights"
                    @search-option="onSearchOption"
                    @search-text="onSearchText"
                    @filter-bookmarks="onFilterBookmarks"
                    @filter-hashtags="onFilterHashtags"
                    @filter-threads-without-emojis="onFilterThreadsWithoutEmojis"
                    @filter-user-tags="onFilterUserTags"
                    @filter-comments="onFilterComments"
                    @filter-reply-reqs="onFilterReplyReqs"
                    @filter-upvotes="onFilterUpvotes"
                    @min-words="onMinWords"
                    @max-words="onMaxWords"
                    @min-hashtags="onMinHashtags"
                    @max-hashtags="onMaxHashtags"
                    @max-threads="onMaxThreads"
                    @min-replies="onMinReplies"
                    @min-reply-reqs="onMinReplyReqs"
                    @min-upvotes="onMinUpvotes"
                    @select-thread="onSelectThread"
                    @select-notification="onSelectNotification"
                    @hover-thread="onHoverThread"
                    @unhover-thread="onUnhoverThread"
                    @change-number-threads="onChangeNumberThreads"
                    @sort-by="onSortBy"
                    @delete-thread="onDeleteThread"
                    @change-heatmap-mode="changeHeatmapMode"
                    @new-thread="onNewThread"
                    @cancel-draft="onCancelDraft"
                    @editor-empty="onEditorEmpty"
                    @logout="onLogout"
                    @dragging="dragging"
                    @set-mouse-position="setMousePosition">
                    @prev-comment="onPrevComment"
                    @next-comment="onNextComment"
                    @logout="onLogout">
                </nb-sidebar>
            </div>
        </div>
        `,
        data: {
            user: null,
            myClasses: [],
            myfollowing: [],
            activeClass: {},
            users: {},
            orderedUsers: [],
            hashedUser: {},
            userNumber: 0,
            numberOfThreads: 1,
            startThreadNumber: 50,
            minThreads: 0,
            maxThreads: 0,
            hashtags: {},
            threads: [],
            usingFilter: false,
            allThreads: [],
            importantThreads: [],
            sortBy: 'init',
            allAuthorThreads: {},
            threadSelected: null,
            threadsHovered: [], // in case of hover on overlapping highlights
            notificationSelected: null,
            stillGatheringThreads: true,
            draftRange: null,
            isEditorEmpty: true,
            isDocumap: false,
            doucSettings: {},
            isInnotationHover: false,
            filter: {
                searchOption: 'text',
                searchText: '',
                bookmarks: false,
                threadsWithoutEmojis: true,
                startFilter: false,
                hashtags: [],
                userTags: [],
                comments: [],
                replyReqs: [],
                upvotes: [],
                minWords: 0,
                maxWords: null,
                minHashtags: 0,
                maxHashtags: null,
                minReplies: 0,
                minReplyReqs: 0,
                minUpvotes: 0,
                maxThreads: null,
                sectioning: null,
            },
            showHighlights: true,
            heatmapMode: "Default",
            sourceURL: '',
            threadViewInitiator: 'NONE', // what triggered the thread view open ['NONE', 'LIST', 'HIGHLIGHT', 'SPOTLIGHT']
            nbConfigs: {},
            currentConfigs: {
                isMarginalia: false,
                isInnotation: false,
                isEmphasize: false,
                isShowNumberOfReplies: true,
                isShowIndicatorForUnseenThread: true,
                isShowIndicatorForInstructorComment: true,
                isShowIndicatorForFollowComment: true,
                isShowIndicatorForSpotlitThread: true,
                isShowIndicatorForNotifiedThread: false,
                isShowIndicatorForQuestionedThread: true,
                isIgnoreSectionsInClass: false,
                isSyncNotificationAudio: false,
                isSyncNotificationPopup: false,
                isSyncSpotlightNewThread: false,
                isNbLog: false,
                nbLogEventsEnabled: [],
                syncSpotlightNewThreadConfig: {},
                nbLogScrollSpoConfig: 2000,
                isShowQuickEditor: false,
                sortByConfig: 'init',
                isFilterMaxThreads: false,
                filterMaxThreadsConfig: null,
                isShowSpotlightControls: false,
                syncNotificationPopupTimerConfig: 60000,
                isCommentMediaAudio: false,
            },
            syncConfig: false,
            isDragging: false, // indicates if there's a dragging happening in the UI
            sidebarWidth: 300,
            mousePosition: null,
            redrawHighlightsKey: Date.now(), // work around to force redraw highlights
            // redrawHighlightsOffset: window.pageYOffset,
            // canRedrawHighlights: true,
            // canRedrawHighlightsTimeout: null,
            recentlyAddedThreads: [],
            showSyncFeatures: true,
            onlineUsers: { ids: [], instructors: [], students: [] },
            currentSectionId: "",
            notificationThreads: [],
            swalClicked: false,
            notificationsMuted: false,
            draggableNotificationsOpened: false,
            sidebarNotificationsOpened: false,
            playSoundNotification: true,
            nbLogEventsOrder: 0,
            filterLogTimer: null,
            scrollLogTimer: null,
        },
        computed: {
            style: function () {
                if (this.isDragging) {
                    return `height: ${document.body.clientHeight}px; width: 100vw; z-index: 999999`
                }
                return `height: ${document.body.clientHeight}px`
            },
            totalThreads: function () {
                return this.threads.length
            },
            innotationsBlock: function () {
                return this.filteredThreads.filter(t => t.spotlight && ['ABOVE', 'BELLOW', 'LEFT', 'RIGHT'].includes(t.spotlight.type))
            },
            innotationsInline: function () {
                return this.filteredThreads.filter(t => t.spotlight && t.spotlight.type === 'IN')
            },
            marginalias: function () {
                return this.filteredThreads.filter(t => t.spotlight && t.spotlight.type === 'MARGIN')
            },
            filteredThreads: function () {
                let isFiltering = false
                let items = this.allThreads
                let searchText = this.filter.searchText
                if (searchText.length > 0) {
                    isFiltering  = true
                    if (this.filter.searchOption === 'text') {
                        items = items.filter(item => item.hasText(searchText))
                    }
                    if (this.filter.searchOption === 'author') {
                        items = items.filter(item => item.hasAuthor(searchText))
                    }
                }
                if (this.filter.bookmarks) {
                    isFiltering  = true
                    items = items.filter(item => item.hasBookmarks())
                }
                let filterHashtags = this.filter.hashtags
                if (filterHashtags.length > 0 || this.filter.startFilter) {
                    isFiltering  = true
                    items = items.filter(item => {
                        if (item.hashtags.length == 0) return true
                        for (let hashtag of filterHashtags) {
                            if (item.hasHashtag(hashtag)) return true
                        }
                        return false
                    })
                }
                if (!this.filter.threadsWithoutEmojis) {
                    items = items.filter(item => {
                        return item.hashtags.length != 0
                    })
                }
                let filterUserTags = this.filter.userTags
                if (filterUserTags.includes('me')) { // single option for now
                    isFiltering  = true
                    items = items.filter(item => item.hasUserTag(this.user.id))
                }
                let filterComments = this.filter.comments
                if (filterComments.length > 0) {
                    isFiltering  = true
                    items = items.filter(item => {
                        if (filterComments.includes('instructor') && (item.hasInstructorPost() || item.isEndorsed())) {
                            return true
                        }
                        if (filterComments.includes('me') && item.hasUserPost(this.user.id)) {
                            return true
                        }
                        if(filterComments.includes('following') && item.anonymity != 'ANONYMOUS'){
                            for(let i = 0; i < this.myfollowing.length; i++){
                                if (item.hasUserPost(this.myfollowing[i].follower_id)){
                                    return true
                                }
                            }
                        } 
                        return false
                    })
                }
                let filterReplyReqs = this.filter.replyReqs
                if (filterReplyReqs.length > 0) {
                    isFiltering  = true
                    items = items.filter(item => {
                        if (filterReplyReqs.includes('anyone') && item.hasReplyRequests()) {
                            return true
                        }
                        if (filterReplyReqs.includes('me') && item.hasMyReplyRequests()) {
                            return true
                        }
                        return false
                    })
                }
                let filterUpvotes = this.filter.upvotes
                if (filterUpvotes.length > 0) {
                    isFiltering  = true
                    items = items.filter(item => {
                        if (filterUpvotes.includes('anyone') && item.hasUpvotes()) {
                            return true
                        }
                        if (filterUpvotes.includes('me') && item.hasMyUpvotes()) {
                            return true
                        }
                        return false
                    })
                }
                let minWords = this.filter.minWords
                if (minWords > 0) {
                    isFiltering  = true
                    items = items.filter(item => item.wordCount >= minWords)
                }
                let maxWords = this.filter.maxWords
                if (maxWords) {
                    isFiltering  = true
                    items = items.filter(item => item.wordCount <= maxWords)
                }
                let minHashtags = this.filter.minHashtags
                if (minHashtags > 0) {
                    isFiltering  = true
                    items = items.filter(item => item.hashtags.length >= minHashtags)
                }
                let maxHashtags = this.filter.maxHashtags
                if (maxHashtags) {
                    isFiltering  = true
                    items = items.filter(item => item.hashtags.length <= maxHashtags)
                }
                let minReplies = this.filter.minReplies
                if (minReplies > 0) {
                    isFiltering  = true
                    items = items.filter(item => item.countAllReplies() >= minReplies)
                }
                let minReplyReqs = this.filter.minReplyReqs
                if (minReplyReqs > 0) {
                    isFiltering  = true
                    items = items.filter(item => item.countAllReplyReqs() >= minReplyReqs)
                }
                let minUpvotes = this.filter.minUpvotes
                if (minUpvotes > 0) {
                    isFiltering  = true
                    items = items.filter(item => item.countAllUpvotes() >= minUpvotes)
                }

                if(this.sortBy === 'init'){
                    this.sortBy =  this.currentConfigs.sortByConfig
                }
                let sortedItems = items
               
                let maxThreads = this.filter.maxThreads
                if (maxThreads) {
                    let hiddenItems = sortedItems.slice(maxThreads + 1)

                    let myHiddenItems = hiddenItems.filter(item => {
                        if (item.hasUserPost(this.user.id) || item.hasInstructorPost()) return true
                        return false
                    })

                    sortedItems = sortedItems.slice(0, maxThreads)
                    sortedItems = sortedItems.concat(myHiddenItems)
                }

                if(isFiltering){
                    this.minThreads = 0
                    this.maxThreads = sortedItems.length
                    if(this.filter.sectioning){
                        sortedItems = sortedItems.slice(0,this.filter.sectioning)
                    }
                    this.numberOfThreads = sortedItems.length
                    this.usingFilter = true
                } else {
                    // sortedItems = this.threads
                    this.numberOfThreads = this.threads.length
                    this.maxThreads = this.allThreads.length
                    this.filter.sectioning = null
                    this.usingFilter = false
                    return this.threads

                }
                return sortedItems
            }
        },
        watch: {
            filter: {
                handler() {
                    clearTimeout(this.filterLogTimer)
                    this.filterLogTimer = setTimeout(() => this.onLogNb('FILTER'), 5000)
                },
                deep: true
            },
            user: async function (newUser, oldUser) {
                if (!newUser) return // logged out
                if (newUser === oldUser) return // same user, do nothing

                const source = window.location.origin + window.location.pathname
                const token = localStorage.getItem("nb.user");
                const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: source } }
                const myClasses = await axios.get('/api/annotations/myClasses', config)
               
                if (myClasses.data.length > 0) {
                    this.myClasses = myClasses.data
                    if (this.myClasses.length === 1) {
                        this.activeClass = this.myClasses[0]
                    }
                    this.sourceURL = source
                } else if (window.location.href.includes('/nb_viewer.html?id=')) {
                    let searchParams = new URLSearchParams(window.location.search);
                    const sourceNbViewer = `${window.location.origin}${window.location.pathname}?id=${searchParams.get('id')}`
                    const configNbViewer = { headers: { Authorization: 'Bearer ' + token }, params: { url: sourceNbViewer } }
                    const myClassesNbViewer = await axios.get('/api/annotations/myClasses', configNbViewer)
                    if (myClassesNbViewer.data.length > 0) {
                        this.myClasses = myClassesNbViewer.data
                        if (this.myClasses.length === 1) {
                            this.activeClass = this.myClasses[0]
                        }
                        this.sourceURL = sourceNbViewer
                    } else {
                        console.log("Sorry you don't have access");
                    }

                } else {
                    const sourceWithQuery = window.location.href.replace('&documap=true', '') // try the source with query params as well
                    const configWithQuery = { headers: { Authorization: 'Bearer ' + token }, params: { url: sourceWithQuery } }
                    const myClassesWithQuery = await axios.get('/api/annotations/myClasses', configWithQuery)
                    if (myClassesWithQuery.data.length > 0) {
                        this.myClasses = myClassesWithQuery.data
                        if (this.myClasses.length === 1) {
                            this.activeClass = this.myClasses[0]
                        }
                        this.sourceURL = sourceWithQuery
                    } else {
                        console.log("Sorry you don't have access");
                    }
                }

            },
            activeClass: async function (newActiveClass, oldActiveClass) {
                if (newActiveClass != {} && this.user) {
                    const token = localStorage.getItem("nb.user");
                    const NbConfigReqconfig = { headers: { Authorization: 'Bearer ' + token }, params: { course: newActiveClass.id } }
                    const req = await axios.get('/api/nb/config', NbConfigReqconfig)
                    const configs = req.data
                    this.nbConfigs = configs

                    this.currentConfigs.isEmphasize = configs['SPOTLIGHT_EM'] === 'true' ? true : false
                    this.currentConfigs.isShowNumberOfReplies = configs['SHOW_NUMBER_OF_REPLIES'] === 'false' ? false : true
                    this.currentConfigs.isShowIndicatorForUnseenThread = configs['SHOW_INDICATOR_FOR_UNSEEN_THREAD'] === 'false' ? false : true
                    this.currentConfigs.isShowIndicatorForInstructorComment = configs['SHOW_INDICATOR_FOR_INSTRUCTOR_COMMENT'] === 'false' ? false : true
                    this.currentConfigs.isShowIndicatorForSpotlitThread = configs['SHOW_INDICATOR_FOR_SPOTLIT_THREAD'] === 'false' ? false : true
                    this.currentConfigs.isShowIndicatorForNotifiedThread = configs['SHOW_INDICATOR_FOR_NOTIFIED_THREAD'] === 'false' ? false : true
                    this.currentConfigs.isShowIndicatorForQuestionedThread = configs['SHOW_INDICATOR_FOR_QUESTIONED_THREAD'] === 'false' ? false : true
                    this.currentConfigs.isIgnoreSectionsInClass = configs['IGNORE_SECTIONS_IN_CLASS'] === 'true' ? true : false
                    this.currentConfigs.isSyncNotificationAudio = configs['SYNC_NOTIFICATION_AUDIO'] === 'true' ? true : false
                    this.currentConfigs.isSyncNotificationPopup = configs['SYNC_NOTIFICATION_POPUP'] === 'true' ? true : false
                    this.currentConfigs.isSyncSpotlightNewThread = configs['SYNC_SPOTLIGHT_NEW_THREAD'] === 'true' ? true : false
                    this.currentConfigs.isNbLog = configs['NB_LOG'] === 'true' ? true : false
                    this.currentConfigs.nbLogEventsEnabled = configs['CONFIG_NB_LOG_EVENTS_ENABLED'] ? JSON.parse(configs['CONFIG_NB_LOG_EVENTS_ENABLED']) : []
                    this.currentConfigs.syncSpotlightNewThreadConfig = configs['CONFIG_SYNC_SPOTLIGHT_NEW_THREAD'] ? JSON.parse(configs['CONFIG_SYNC_SPOTLIGHT_NEW_THREAD']) : {}
                    this.currentConfigs.nbLogScrollSpoConfig = configs['CONFIG_NB_LOG_SCROLL'] ? Number(configs['CONFIG_NB_LOG_SCROLL']) : 2000
                    this.currentConfigs.isShowQuickEditor = configs['SHOW_QUICK_EDITOR'] === 'true' ? true : false
                    this.currentConfigs.sortByConfig = configs['CONFIG_SORT_BY'] ? configs['CONFIG_SORT_BY'] : 'recent'
                    this.currentConfigs.isFilterMaxThreads = configs['FILTER_MAX_THREADS'] === 'true' ? true : false
                    this.currentConfigs.filterMaxThreadsConfig = configs['CONFIG_FILTER_MAX_THREADS'] ? configs['CONFIG_FILTER_MAX_THREADS'] : null
                    this.currentConfigs.isShowSpotlightControls = configs['SHOW_SPOTLIGHT_CONTROLS'] === 'false' ? false : true
                    this.currentConfigs.syncNotificationPopupTimerConfig = configs['CONFIG_SYNC_NOTIFICATION_POPUP_TIMER'] ? configs['CONFIG_SYNC_NOTIFICATION_POPUP_TIMER'] : 60000
                    this.currentConfigs.isCommentMediaAudio = configs['COMMENT_MEDIA_AUDIO_STUDENT'] === 'true' ? true : false

                    if (document.location.href.includes('/nb_viewer.html')) {
                        this.currentConfigs.isMarginalia = configs['SPOTLIGHT_MARGIN'] === 'true' ? true : false
                        this.currentConfigs.isInnotation = false
                        this.syncConfig = configs['SYNC_FEATURES'] === 'true' ? true : false
                        this.showSyncFeatures = this.syncConfig

                        if (this.currentConfigs.syncSpotlightNewThreadConfig.type && ['IN', 'ABOVE', 'BELLOW', 'LEFT', 'RIGHT'].includes(this.currentConfigs.syncSpotlightNewThreadConfig.type)) {
                            this.currentConfigs.syncSpotlightNewThreadConfig.type = 'MARGIN'
                        }

                    } else {
                        this.currentConfigs.isMarginalia = false
                        this.currentConfigs.isInnotation = configs['SPOTLIGHT_INNOTATION'] === 'true' ? true : false
                        this.syncConfig = configs['SYNC_FEATURES'] === 'true' ? true : false
                        this.showSyncFeatures = this.syncConfig

                        if (this.currentConfigs.syncSpotlightNewThreadConfig.type && ['MARGIN'].includes(this.currentConfigs.syncSpotlightNewThreadConfig.type)) {
                            this.currentConfigs.syncSpotlightNewThreadConfig.type = 'LEFT'
                        }

                    }

                    if (this.currentConfigs.isFilterMaxThreads) {
                        this.filter.maxThreads = this.currentConfigs.filterMaxThreadsConfig
                    }

                    let source = window.location.origin + window.location.pathname
                    if (this.sourceURL.length > 0) {
                        source = this.sourceURL
                    }

                    const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: source, class: newActiveClass.id } }

                    axios.get('/api/annotations/allUsers', config).then(res => {
                        this.users = res.data
                        this.createOrderedUsers(res.data)
                        this.$set(this.user, 'role', this.users[this.user.id].role)

                        if (this.user.role === 'instructor') {
                            this.currentConfigs.isCommentMediaAudio = configs['COMMENT_MEDIA_AUDIO_INSTRUCTOR'] === 'true' ? true : false
                        }

                        axios.get('/api/annotations/myCurrentSection', config).then(res => {
                            socket.emit('left', { id: this.user.id, username: this.user.username, classId: oldActiveClass.id, sectionId: this.currentSectionId, sourceURL: this.sourceURL, role: this.user.role })
                            this.currentSectionId = res.data
                            socket.emit('joined', { id: this.user.id, username: this.user.username, classId: newActiveClass.id, sectionId: this.currentSectionId, sourceURL: this.sourceURL, role: this.user.role })
                        })

                        const configSessionStart = { headers: { Authorization: 'Bearer ' + token }, params: { url: this.sourceURL } }
                        axios.post(`/api/spotlights/log/session/start`, {
                            action: 'SESSION_START',
                            type: 'NONE',
                            class_id: this.activeClass.id,
                            role: this.users[this.user.id].role.toUpperCase()
                        }, configSessionStart)
                    })

                    axios.get('/api/annotations/allTagTypes', config).then(res => {
                        this.hashtags = res.data
                    })

                    this.getAllAnnotations(source, newActiveClass)
                    window.removeEventListener('scroll', this.handleScroll);
                    window.addEventListener('scroll', this.handleScroll);
                }

            }
        },
        created: async function () {
            const token = localStorage.getItem("nb.user")
            if (token) {
                const decoded = VueJwtDecode.decode(token)
                this.user = decoded.user
            }
            axios.get(`/api/follow/user`, {headers: { Authorization: 'Bearer ' + token }})
            .then((res) => {
                this.myfollowing = res.data
            })
            
            
            // remove hypothesis
            const hypothesisSidebar = document.getElementsByTagName('hypothesis-sidebar')
            const hypothesisAdder = document.getElementsByTagName('hypothesis-adder')
            hypothesisSidebar && hypothesisSidebar[0] && hypothesisSidebar[0].remove()
            hypothesisAdder && hypothesisAdder[0] && hypothesisAdder[0].remove()

            socket.on('connections', (data) => {
                console.log(`NB: Socket.IO connections`)
                // console.log(data);
                let isInitConnection = this.onlineUsers.ids.length === 0
                this.onlineUsers = data.users

                if (!isInitConnection) {
                    this.onLogNb('SYNC_RECEIVED_CONNECTION')
                }
            })

            socket.on('disconnect', (reason) => {
                console.log(`NB: Socket.IO disconnect:  ${reason}`)
                if (reason === "io server disconnect") {
                    socket.connect();
                }
                setTimeout(() => {
                    socket.emit('joined', { id: this.user.id, username: this.user.username, classId: this.activeClass.id, sectionId: this.currentSectionId, sourceURL: this.sourceURL, role: this.user.role })
                }, 1000);

            })

            socket.on("connect_error", () => {
                console.log('NB: Socket.IO connect_error')
                setTimeout(() => {
                    socket.emit('joined', { id: this.user.id, username: this.user.username, classId: this.activeClass.id, sectionId: this.currentSectionId, sourceURL: this.sourceURL, role: this.user.role })
                }, 1000);
            });

            socket.on("new_thread", (data) => {
                console.log(`NB: Socket.IO new_thread`)
                // console.log(data);
                let userIdsSet = new Set(data.userIds)
                if (data.authorId !== this.user.id && userIdsSet.has(this.user.id)) { // find if we are one of the target audiences w/ visibility + section permissions for this new_thread if current user, we already added new thread to their list
                    if (this.activeClass && this.activeClass.id == data.classId && this.sourceURL === data.sourceUrl) {
                        this.getSingleThread(data.sourceUrl, data.classId, data.threadId, data.authorId, data.taggedUsers, true) // data contains info about the thread and if the new thread as posted by an instructor
                    }
                }
            })

            socket.on('thread-typing', (data) => {
                //                 console.log("***typing***");
                //                 console.log(data);
                let thread = this.threads.find(x => x.id === data.threadId)
                if (thread !== undefined) {
                    thread.usersTyping = data.usersTyping
                }
            })

            socket.on('new_reply', (data) => {
                console.log(`NB: Socket.IO new_reply`)
                // console.log(data);
                if (data.authorId !== this.user.id) { // if current user, we already added new reply to their list
                    if (this.activeClass && this.activeClass.id == data.classId && this.sourceURL === data.sourceUrl) {
                        const canISeeIt = this.threads.filter(t => t.id === data.headAnnotationId).length > 0
                        if (canISeeIt) {
                            this.getSingleThread(data.sourceUrl, data.classId, data.threadId, data.authorId, data.taggedUsers, false, data.newAnnotationId, data.headAnnotationId)
                        }
                    }
                }
            })
        },
        destroyed: function () {
            window.removeEventListener('scroll', this.handleScroll)
        },
        methods: {
            dragging: function (isDragging) {
                this.isDragging = isDragging
            },
            setMousePosition: function (position) {
                this.mousePosition = position
            },
            mouseUp: function (e) {
                if (this.isDragging) {
                    e.preventDefault()
                    this.isDragging = false
                }
            },
            mouseMove: function (e) {
                if (!this.isDragging) return
                e.preventDefault()
                const dx = this.mousePosition - e.x
                this.mousePosition = e.x
                let width = parseInt(this.sidebarWidth + dx)
                width = width < 300 ? 300 : width > 800 ? 800 : width
                this.sidebarWidth = width
            },
            setUser: function (user) {
                this.user = user
            },
            onUserLeft: function () {
                socket.emit('left', { username: this.user.username, classId: this.activeClass.id, sectionId: this.currentSectionId, sourceURL: this.sourceURL })
            },
            getSingleThread: function (sourceUrl, classId, threadId, authorId, taggedUsers, isNewThread, replyAnnotationId = null, oldHeadAnnotationId = null) { // get single thread and add it to the list
                const token = localStorage.getItem("nb.user");
                const config = { headers: { Authorization: 'Bearer ' + token }, params: { source_url: sourceUrl, class_id: classId, thread_id: threadId } }
                axios.get('/api/annotations/specific_thread', config)
                    .then(res => {
                        let item = res.data.headAnnotation
                        try {
                            item.range = deserializeNbRange(item.range)
                        } catch (e) {
                            console.warn(`Could not deserialize range for ${item.id}`)
                        }
                        if (oldHeadAnnotationId) { // if there exists an old thread we need to remove, then filter it out before adding a new one
                            this.threads = this.threads.filter(x => x.id !== oldHeadAnnotationId) // filter out the thread
                        }

                        // Nb Comment

                        let comment = new NbComment(item, res.data.annotationsData)
                        comment.hasSync = true

                        // if spotlight new sync thread
                        if (isNewThread && this.currentConfigs.isSyncSpotlightNewThread) {
                            comment.spotlight = this.currentConfigs.syncSpotlightNewThreadConfig
                        }

                        // get the specific annotation that was recently posted
                        let specificAnnotation = null
                        if (replyAnnotationId !== null) {
                            specificAnnotation = comment.getChildComment(replyAnnotationId)
                            specificAnnotation.isSync = true
                        }

                        // if this thread is open in the thread view, then refresh it
                        if (this.threadSelected && this.threadSelected.id === oldHeadAnnotationId) {
                            //this.threadSelected = comment
                            // console.log(this.threadSelected);
                            // console.log(comment);
                            // this.threadSelected.children = comment.children
                        }

                        // set any type of notification
                        let notification = null
                        if (taggedUsers.includes(this.user.id)) { // user tagged in post
                            notification = new NbNotification(comment, "tag", true, specificAnnotation, false)
                        } else if ((isNewThread && comment.hasReplyRequests()) || (specificAnnotation !== null && specificAnnotation.hasReplyRequests())) { // new thread with reply request or the reply had a reply request
                            notification = new NbNotification(comment, "question", true, specificAnnotation, false)
                        } else if (specificAnnotation && specificAnnotation.parent && specificAnnotation.parent.author === this.user.id) { // if this new comment is a reply to the user
                            notification = new NbNotification(comment, "reply", true, specificAnnotation, false)
                        } else if (this.users[authorId].role === "instructor") { // instructor comment
                            notification = new NbNotification(comment, "instructor", true, specificAnnotation, false)
                        } else if (this.user.role === 'instructor' && isNewThread) { // instructors will get all new threads and posts
                            notification = new NbNotification(comment, "recent", true, specificAnnotation, false)
                        }

                        if (notification !== null) {
                            this.notificationThreads.push(notification)
                            comment.associatedNotification = notification
                            this.triggerPopupNotification(notification)
                            this.playNotificationSound()
                        }
                        this.notificationThreads.forEach((n, i) => {
                            if (n.comment.id === comment.id) {
                                this.notificationThreads[i].comment = comment // replace comment for existing notifications referring to old version of comment
                            }
                        })

                        this.threads.push(comment)
                        let syncLogEvent = isNewThread ? 'SYNC_RECEIVED_ANNOTATION' : 'SYNC_RECEIVED_REPLY'
                        this.onLogNb(syncLogEvent, 'NONE', 'NONE', true, true, comment.associatedNotification ? comment.associatedNotification.trigger : 'NONE', replyAnnotationId || comment.id, comment.countAllReplies())
                    })
            },
            triggerPopupNotification: function (notification) {
                if (this.showSyncFeatures && notification.triggerPopup && this.currentConfigs.isSyncNotificationPopup && !this.notificationsMuted) {
                    let relevantComment = notification.specificAnnotation ? notification.specificAnnotation : notification.comment
                    let text = relevantComment.text.substring(0, 20)
                    if (relevantComment.text.length > 20) {
                        text += "..."
                    }
                    this.$swal({
                        title: '',
                        text: notification.readableType + ": " + text,
                        type: 'success',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Bring me there!',
                        toast: true,
                        position: 'top-start',
                        timer: this.currentConfigs.syncNotificationPopupTimerConfig,
                    }).then((result) => {
                        if (result.value) {
                            this.swalClicked = true
                            this.onSelectNotification(notification)
                        }
                    })
                }
            },
            playNotificationSound: function (sound = new Audio("https://soundbible.com/mp3/Air Plane Ding-SoundBible.com-496729130.mp3")) {
                if (this.showSyncFeatures && this.currentConfigs.isSyncNotificationAudio && this.playSoundNotification && !this.notificationsMuted) {
                    sound.play();
                    this.playSoundNotification = false
                    setTimeout(() => {
                        this.playSoundNotification = true // set back to allowing sound notifications after 30 seconds
                    }, 30000)
                }
            },
            newOfflineNotification: function (comment) {
                // if (this.notificationThreads.length < 5) { // limit to 5 initial notifications
                let taggedComment = comment.getUserTagPost(this.user.id)
                if (taggedComment !== null) {
                    return new NbNotification(comment, "tag", true, taggedComment, true)
                }

                let replyRequestResponseComment = comment.getReplyRequestResponsePost(this.user.id)
                if (replyRequestResponseComment !== null) {
                    return new NbNotification(comment, "question", true, replyRequestResponseComment, true)
                }

                let unreadReply = comment.getMyAuthorReplies(this.user.id)
                if (unreadReply) { // if thread has unseen comments that reply to this author
                    return new NbNotification(comment, "reply", false, unreadReply, true)
                }

                let instructorResponseComment = comment.getInstructorPost()
                if (instructorResponseComment !== null) {
                    return new NbNotification(comment, "instructor", false, instructorResponseComment, true)
                }

                return null
            },
            getAllAnnotations: async function (source, newActiveClass) {
                this.stillGatheringThreads = true
                const token = localStorage.getItem("nb.user");
                const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: source, class: newActiveClass.id, sectioned: !this.currentConfigs.isIgnoreSectionsInClass } }

                axios.get('/api/annotations/annotation', config).then(async res => {
                    this.threads = []
                    this.myfollowing = []

                    for (const item of res.data.headAnnotations) {

                        try {
                            item.range = deserializeNbRange(item.range)
                        } catch (e) {
                            console.warn(`Could not deserialize range for ${item.id}`)
                            continue
                        }

                        // Nb Comment
                        let comment = new NbComment(item, res.data.annotationsData)
                        this.maxThreads +=1
                        //put threads in dict{author: thread}
                        //get all authors for thread
                        let allAuthors = comment.getAllAuthors()
                        this.allThreads.push(comment)
                        allAuthors.forEach((author) => {
                            if (author in this.allAuthorThreads){
                                if(!this.allAuthorThreads[author].includes(comment)){
                                    this.allAuthorThreads[author].push(comment)
                                }
                                
                            } else {
                                this.allAuthorThreads[author] = [comment]
                            }
                            // if(author === this.user.id && !this.threads.includes(comment)){
                            //     // this.threads.push(comment)
                            //     this.minThreads += 1
                            // }
                        })
                        // if ((comment.hasInstructorPost() || comment.isEndorsed()) && !this.threads.includes(comment)){
                        //     // this.threads.push(comment)
                        //     this.minThreads+=1
                        // }


                        // TODO: check this code
                        let offlineNotification = this.newOfflineNotification(comment) // Either get back a notification to add or null
                        if (offlineNotification !== null) {
                            this.notificationThreads.push(offlineNotification)
                            comment.associatedNotification = offlineNotification
                        }
                    }
                    // for(let i= 0; i < this.myfollowing.length; i++){
                    //     if (this.myfollowing[i].follower_id in this.allAuthorThreads){
                    //         this.allAuthorThreads[this.myfollowing[i].follower_id].forEach((t) => {
                    //             if(t.anonymity === "IDENTIFIED"  && !this.threads.includes(t)){
                    //                 // this.threads.push(t)
                    //                 this.minThreads += 1
                    //             }
                    //         })
                    //     }
                    // }
                    this.numberOfThreads = this.maxThreads > this.startThreadNumber? this.startThreadNumber:this.maxThreads;
                    // this.minThreads = 0
                    const token = localStorage.getItem("nb.user");
                     const headers = { headers: { Authorization: 'Bearer ' + token } }
                     axios.get(`/api/follow/user`, {headers: { Authorization: 'Bearer ' + token }})
                     .then((res) => {
                         this.myfollowing = res.data
                         console.log("end api")
                     })
                     this.importantThreads = this.allThreads.filter((t) => t.hasInstructorPost() || t.hasUserPost(this.user.id) || t.isEndorsed())
                     for(let i= 0; i < this.myfollowing.length; i++){
                         if (this.myfollowing[i].follower_id in this.allAuthorThreads){
                             this.allAuthorThreads[this.myfollowing[i].follower_id].forEach((t) => {
                                 if(t.anonymity === "IDENTIFIED"  && !this.importantThreads.includes(t)){
                                     this.importantThreads.push(t)                            }
                             })
                         }
                     }
                     this.minThreads = this.importantThreads.length
                    this.onSortBy(this.currentConfigs.sortByConfig)
                    
                    this.numberOfThreads=this.threads.length

                    const token = localStorage.getItem("nb.user");
                      const headers = { headers: { Authorization: 'Bearer ' + token } }
                      axios.get(`/api/follow/user`, {headers: { Authorization: 'Bearer ' + token }})
                      .then((res) => {
                          this.myfollowing = res.data
                      })

                    this.stillGatheringThreads = false

                    this.sleep(300).then(() => this.onLogNb('SESSION_START'))

                    // TODO: check this
                    this.notificationThreads = this.notificationThreads.concat().sort(function (a, b) { // sort notification order
                        let aTimestamp = a.specificAnnotation ? a.specificAnnotation.timestamp : a.comment.timestamp
                        let bTimestamp = b.specificAnnotation ? b.specificAnnotation.timestamp : b.comment.timestamp
                        return new Date(aTimestamp) - new Date(bTimestamp)
                    })

                    let link = window.location.hash.match(/^#nb-comment-(.+$)/)
                    if (link) {
                        let id = link[1]
                        this.threadSelected = this.threads.find(x => x.id === id)
                    }
                })
            },
            addThreads: function(){
                if(this.sortBy === 'position' || (this.sortBy==='init' && this.currentConfigs.sortByConfig === 'position')){
                    let currentMaxThreads = (this.numberOfThreads-this.threads.length)/2
                    let counter = 0 
                    let currentNeighbor = this.userNumber+1

                    //loop through the right neihghbors
                    while(counter < currentMaxThreads && currentNeighbor!= this.userNumber){
                        let currentAuthor = this.hashedUser[this.orderedUsers[currentNeighbor]]
                        //loop through the threads of current neighbor
                        for(let t in this.allAuthorThreads[currentAuthor]){
                            if (!this.threads.includes(this.allAuthorThreads[currentAuthor][t])){
                                this.threads.push(this.allAuthorThreads[currentAuthor][t])
                                counter += 1
                                if (counter >= currentMaxThreads){
                                    break
                                }
                            }
                        }
                        currentNeighbor += 1
                        if (currentNeighbor >= this.orderedUsers.length){
                            currentNeighbor = 0
                        }
                    } 
                    
                    counter = 0
                    currentNeighbor = this.userNumber - 1
                    //loop through the left neihghbors
                    while(counter < currentMaxThreads  && currentNeighbor!= this.userNumber && this.threads.length < this.numberOfThreads){
                        //loop through the threads of current neighbor
                        let currentAuthor = this.hashedUser[this.orderedUsers[currentNeighbor]]
                        for(let t in this.allAuthorThreads[currentAuthor]){
                            if (!this.threads.includes(this.allAuthorThreads[currentAuthor][t])){

                                this.threads.push(this.allAuthorThreads[currentAuthor][t])
                                counter += 1
                                if (counter >= currentMaxThreads){
                                    break
                                }
                            }
                        }
                        currentNeighbor -= 1
                        if (currentNeighbor <= -1){
                            currentNeighbor = this.orderedUsers.length-1
                        }
                    }
            } else {
                let index = 0
                while (index < this.allThreads.length && this.threads.length < this.numberOfThreads){
                    if(!this.threads.includes(this.allThreads[index])){
                        this.threads.push(this.allThreads[index])
                    }
                    index += 1
                }                
            }  
            },
            removeThreads: function(){
                this.onSortBy(this.sortBy)
            },
            onAddAuthorSection: function(author){
                    if (author in this.allAuthorThreads){
                        this.allAuthorThreads[author].forEach((t) => {
                            if(t.anonymity === "IDENTIFIED"  && !this.threads.includes(t)){
                                this.threads.push(t)                          
                            }
                            if(t.anonymity === "IDENTIFIED" && !t.isEndorsed() && !t.hasInstructorPost()){
                                this.minThreads += 1
                            }  
                        })  
                    }
            },
            onRemoveAuthorSection: function(author){
                if (author in this.allAuthorThreads){
                    this.allAuthorThreads[author].forEach((t) => {
                        if(t.anonymity === "IDENTIFIED" && !t.isEndorsed() && !t.hasInstructorPost()){
                            this.minThreads -= 1
                        }  
                    })  
                } 
            },
            draftThread: function (range) {
                if (this.user) { // only if selection was after user log in
                    this.draftRange = createNbRange(range)
                }
            },
            onDeleteThread: function (thread) {
                if (this.threadSelected === thread) { this.threadSelected = null }
                let idx = this.threads.indexOf(thread)
                if (idx >= 0) { this.threads.splice(idx, 1) }
                let idx2 = this.allThreads.indexOf(thread)
                if (idx2 >= 0) { this.allThreads.splice(idx2, 1) }
                let idx3 = this.allAuthorThreads[thread.author].indexOf(thread)
                if (idx3 >= 0) { this.allAuthorThreads[thread.author].splice(idx3, 1) }
                if (thread.id) {
                    const token = localStorage.getItem("nb.user");
                    const headers = { headers: { Authorization: 'Bearer ' + token } }
                    axios.delete(`/api/annotations/annotation/${thread.id}`, headers)
                    if((thread.anonymity === "IDENTIFIED" && this.myfollowing.includes(thread.author))|| !thread.isEndorsed() || !thread.hasInstructorPost() || thread.author == this.user.id){
                        this.minThreads -= 1
                    }                     
                    this.numberOfThreads -= 1
                    this.maxThreads -=1
                }
            },
            changeHeatmapMode: function (mode) {
                this.heatmapMode = mode
            },
            onNewThread: function (thread) {
                this.threads.push(thread)
                this.allThreads.push(thread)
                if(!(thread.author in this.allAuthorThreads)){
                    this.allAuthorThreads[thread.author] = []
                } 
                this.allAuthorThreads[thread.author].push(thread)
                this.draftRange = null
                this.maxThreads += 1
                this.numberOfThreads += 1
                if((thread.anonymity === "IDENTIFIED" && this.myfollowing.includes(thread.author))|| !thread.isEndorsed() || !thread.hasInstructorPost() || thread.author == this.user.id){
                    this.minThreads += 1
                }  
            },
            onCancelDraft: function () {
                this.draftRange = null
            },
            onEditorEmpty: function (isEmpty) {
                this.isEditorEmpty = isEmpty
            },
            onSearchOption: function (option) {
                this.filter.searchOption = option
                this.onSearchUpdate()
            },
            onSearchText: function (text) {
                this.filter.searchText = text
                this.onSearchUpdate()
            },
            onSearchUpdate: function () {
                if (this.threadSelected && this.filter.searchText.length > 0) {
                    if (this.filter.searchOption === 'text' && !this.threadSelected.hasText(this.filter.searchText)) {
                        this.threadSelected = null // reset selection if filtered
                    }
                    if (this.filter.searchOption === 'author' && !this.threadSelected.hasAuthor(this.filter.searchText)) {
                        this.threadSelected = null // reset selection if filtered
                    }
                }
            },
            onFilterBookmarks: function (filter) {
                if (this.threadSelected && filter && !this.threadSelected.hasBookmarks()) {
                    this.threadSelected = null // reset selection if filtered
                }
                this.filter.bookmarks = filter
            },
            onFilterHashtags: function (hashtags) {
                if (this.threadSelected && hashtags.length > 0) {
                    let filtered = true
                    for (let hashtag of hashtags) {
                        if (this.threadSelected.hasHashtag(hashtag)) {
                            filtered = false
                            break
                        }
                    }
                    if (filtered) {
                        this.threadSelected = null // reset selection if filtered
                    }
                }
                this.filter.hashtags = hashtags
            },
            onFilterThreadsWithoutEmojis: function (flag) {
                if(this.threadSelected && this.threadSelected.hashtags.length == 0 && !flag) {
                    this.threadSelected = null
                }
                this.filter.threadsWithoutEmojis = flag
            },
            onFilterUserTags: function (filters) {
                if (this.threadSelected && filters.includes('me') && !this.threadSelected.hasUserTag(this.user.id)) {
                    this.threadSelected = null // reset selection if filtered
                }
                this.filter.userTags = filters
            },
            onFilterComments: function (filters) {
                if (this.threadSelected && filters.length > 0) {
                    let filtered = true
                    if (filters.includes('instructor') && (this.threadSelected.hasInstructorPost() || this.threadSelected.isEndorsed())) {
                        filtered = false
                    }
                    if (filters.includes('me') && this.threadSelected.hasUserPost(this.user.id)) {
                        filtered = false
                    }
                    if (filters.includes('following') && this.threadSelected.anonymity != 'ANONYMOUS'){
                        const token = localStorage.getItem("nb.user")
                        axios.get(`/api/follow/user`, {headers: { Authorization: 'Bearer ' + token }})
                        .then((res) => {
                            this.myfollowing = res.data
                        })
                        for(let i = 0; i < this.myfollowing.length; i++){
                            if (this.threadSelected.hasUserPost(this.myfollowing[i].follower_id)){
                                filtered = false
                            }
                        }
                    } 
                    if (filtered) {
                        this.threadSelected = null // reset selection if filtered
                    }
                }
                this.filter.comments = filters
            },
            onFilterReplyReqs: function (filters) {
                if (this.threadSelected && filters.length > 0) {
                    let filtered = true
                    if (filters.includes('anyone') && this.threadSelected.hasReplyRequests()) {
                        filtered = false
                    }
                    if (filters.includes('me') && this.threadSelected.hasMyReplyRequests()) {
                        filtered = false
                    }
                    if (filtered) {
                        this.threadSelected = null // reset selection if filtered
                    }
                }
                this.filter.replyReqs = filters
            },
            onFilterUpvotes: function (filters) {
                if (this.threadSelected && filters.length > 0) {
                    let filtered = true
                    if (filters.includes('anyone') && this.threadSelected.hasUpvotes()) {
                        filtered = false
                    }
                    if (filters.includes('me') && this.threadSelected.hasMyUpvotes()) {
                        filtered = false
                    }
                    if (filtered) {
                        this.threadSelected = null // reset selection if filtered
                    }
                }
                this.filter.upvotes = filters
            },
            onMinWords: function (min) {
                if (this.threadSelected && this.threadSelected.wordCount < min) {
                    this.threadSelected = null // reset selection if filtered
                }
                this.filter.minWords = min
            },
            onMaxWords: function (max) {
                if (this.threadSelected && this.threadSelected.wordCount > max) {
                    this.threadSelected = null // reset selection if filtered
                }
                this.filter.maxWords = max
            },
            onMinHashtags: function (min) {
                if (this.threadSelected && this.threadSelected.hashtags.length < min) {
                    this.threadSelected = null // reset selection if filtered
                }
                this.filter.minHashtags = min
            },
            onMaxHashtags: function (max) {
                if (this.threadSelected && this.threadSelected.hashtags.length > max) {
                    this.threadSelected = null // reset selection if filtered
                }
                this.filter.maxHashtags = max
            },
            onMaxThreads: function (max) {
                if (this.threadSelected) {
                    this.threadSelected = null
                }
                this.filter.maxThreads = max
            },
            onMinReplies: function (min) {
                if (this.threadSelected && this.threadSelected.countAllReplies() < min) {
                    this.threadSelected = null // reset selection if filtered
                }
                this.filter.minReplies = min
            },
            onMinReplyReqs: function (min) {
                if (this.threadSelected && this.threadSelected.countAllReplyReqs() < min) {
                    this.threadSelected = null // reset selection if filtered
                }
                this.filter.minReplyReqs = min
            },
            onMinUpvotes: function (min) {
                if (this.threadSelected && this.threadSelected.countAllUpvotes() < min) {
                    this.threadSelected = null // reset selection if filtered
                }
                this.filter.minUpvotes = min
            },
            onSortBy: function(sortBy) {
                this.threads = [...this.importantThreads]

                this.sortBy = sortBy
             
                console.log("first sort")
                switch (sortBy) {
                    case 'position':
                        console.log("before adding threads")
                        this.addThreads()
                        console.log("after adding threads and before sorting")
                        this.threads = this.threads.concat().sort(compareDomPosition)
                        console.log("after sorting")
                        break
                    case 'recent':
                        this.allThreads = this.allThreads.concat().sort(compare('timestamp', 'key', false))
                        console.log("before adding threads")
                        this.addThreads()
                        console.log("after adding threads and before sorting")
                        this.threads = this.threads.concat().sort(compare('timestamp', 'key', false))
                        console.log("after sorting")
                        break                        
                    case 'comment':
                        this.allThreads = this.allThreads.concat().sort(compare('countAllReplies', 'func', false))
                        console.log("before adding threads")
                        this.addThreads()
                        console.log("after adding threads and before sorting")
                        this.threads = this.threads.concat().sort(compare('countAllReplies', 'func', false))
                        console.log("after sorting")
                        break
                    case 'reply_request':
                        this.allThreads = this.allThreads.concat().sort(compare('countAllReplyReqs', 'func', false))
                        console.log("before adding threads")
                        this.addThreads()
                        console.log("after adding threads and before sorting")
                        this.threads = this.threads.concat().sort(compare('countAllReplyReqs', 'func', false))
                        console.log("after sorting")
                        break
                    case 'upvote':
                        this.allThreads = this.allThreads.concat().sort(compare('countAllUpvotes', 'func', false))
                        console.log("before adding threads")
                        this.addThreads()
                        console.log("after adding threads and before sorting")
                        this.threads = this.threads.concat().sort(compare('countAllUpvotes', 'func', false))
                        console.log("after sorting")
                        break
                    case 'unseen':
                        this.allThreads = this.allThreads.concat().sort(compare('isUnseen', 'func', false))
                        console.log("before adding threads")
                        this.addThreads()
                        console.log("after adding threads and before sorting")
                        this.threads = this.threads.concat().sort(compare('isUnseen', 'func', false))
                        console.log("after sorting")
                        break
                    default:
                        console.log("before adding threads")
                        this.addThreads()
                        console.log("after adding threads and before sorting")
                        this.threads = this.threads.concat().sort(compareDomPosition)
                        console.log("after sorting")
                        break
                }
                console.log("")
            },
            onSelectThread: function (thread, threadViewInitiator = 'NONE') {
                this.threadViewInitiator = threadViewInitiator
                if (this.threadSelected) {
                    socket.emit('thread-stop-typing', { threadId: this.threadSelected.id, username: this.user.username }) // selecting new thread so stop typing on this thread
                }
                if (thread.associatedNotification !== null) {
                    thread.associatedNotification.setIsUnseen(false)
                }
                this.threadSelected = thread
                thread.markSeenAll()
            },
            onSelectNotification: function (notification) {
                this.notificationSelected = notification
                notification.setIsUnseen(false)
                this.onSelectThread(notification.comment)
            },
            onUnselectThread: function (thread) {
                if (this.isDragging) return

                this.threadViewInitiator = 'NONE'
                if (!this.isInnotationHover) {
                    this.threadSelected = null
                }
                if (this.draftRange && this.isEditorEmpty) {
                    this.onCancelDraft()
                }
                if (this.threadSelected) {
                    socket.emit('thread-stop-typing', { threadId: this.threadSelected.id, username: this.user.username }) // selecting no thread so stop typing
                }
                if (this.swalClicked) {
                    this.swalClicked = false // don't unselect if this was a popup notification click
                } else { // otherwise, it was a valid unselect thread click
                    if (!this.isInnotationHover) {
                        this.threadSelected = null
                    }
                    if (this.draftRange && this.isEditorEmpty) {
                        this.onCancelDraft()
                    }
                }

                this.threadViewInitiator = 'NONE'
                // console.log('threadViewInitiator: ' + this.threadViewInitiator)

            },
            onHoverThread: function (thread) {
                //console.log('onHoverThread in app')
                if (this.isDragging) return

                if (!this.threadsHovered.includes(thread)) {
                    this.threadsHovered.push(thread)
                }
            },
            onHoverInnotation: function (thread) {
                //console.log('onHoverInnotation in app')
                if (this.isDragging) return

                this.isInnotationHover = true
                if (!this.threadsHovered.includes(thread)) {
                    this.threadsHovered.push(thread)
                }
            },
            onUnhoverThread: function (thread) {
                if (!this.isInnotationHover) {
                    //console.log('onUnhoverThread in app')
                    let idx = this.threadsHovered.indexOf(thread)
                    if (idx >= 0) this.threadsHovered.splice(idx, 1)
                }
            },
            onChangeNumberThreads: function(num){
                this.onLogNb('SLIDER_CHANGE')
                this.filter.sectioning = num
                if(!this.usingFilter){
                    if (num > this.numberOfThreads){
                        this.numberOfThreads = num
                        // this.addThreads()
                    } else {
                        this.numberOfThreads = num
                        // this.removeThreads()
                    }
                    this.onSortBy(this.sortBy)
                }
            },
            onUnhoverInnotation: function (thread) {
                // console.log('onUnhoverInnotation in app')
                this.isInnotationHover = false
                let idx = this.threadsHovered.indexOf(thread)
                if (idx >= 0) this.threadsHovered.splice(idx, 1)
            },
            onNewRecentThread: function (thread) {
                let mostRecentThread = thread.getMostRecentPost() // get the most recent thread to see if we should notify about it
                if (mostRecentThread.author !== this.user.id && thread.associatedNotification === null) { // if not this author and no notifications for this thread yet
                    let notification = new NbNotification(thread, "recent", false, mostRecentThread, false) // associated annotation is the most recent one
                    this.notificationThreads.push(notification)
                    thread.associatedNotification = notification
                }
            },
            onToggleHighlights: function (show) {
                this.showHighlights = show
            },
            handleRedrawHighlights: function () {
                // if (this.canRedrawHighlightsTimeout) {
                //     clearTimeout(this.canRedrawHighlightsTimeout)
                // }

                // this.canRedrawHighlights = false
                this.redrawHighlightsKey = Date.now()
                // this.redrawHighlightsOffset = window.pageYOffset
                // this.canRedrawHighlightsTimeout = setTimeout(() => {
                //     this.canRedrawHighlights = true
                // }, 5000)
            },
            onSwitchClass: function (newClass) {
                this.activeClass = newClass
            },
            onShowSyncFeatures: function (showSyncFeatures) {
                showSyncFeatures ? this.onLogNb('NOTIFICATION_ON') : this.onLogNb('NOTIFICATION_OFF')
                this.showSyncFeatures = showSyncFeatures
            },
            onThreadTyping: function (threadId) {
                if (threadId) {
                    socket.emit('thread-typing', { threadId: threadId, username: this.user.username })
                }
            },
            onThreadStopTyping: function (threadId) {
                if (threadId) {
                    socket.emit('thread-stop-typing', { threadId: threadId, username: this.user.username })
                }
            },
            onPrevComment: function () {
                let idx = this.filteredThreads.findIndex(x => x.id === this.threadSelected.id)
                let prevIdx = idx - 1
                if (prevIdx >= 0 && prevIdx < this.filteredThreads.length) {
                    this.onSelectThread(this.filteredThreads[prevIdx])
                }
            },
            onNextComment: function () {
                let idx = this.filteredThreads.findIndex(x => x.id === this.threadSelected.id)
                let nextIdx = idx + 1
                if (nextIdx >= 0 && nextIdx < this.filteredThreads.length) {
                    this.onSelectThread(this.filteredThreads[nextIdx])
                }
            },
            onToggleMuteNotifications: function () {
                this.notificationsMuted = !this.notificationsMuted
            },
            onCloseDraggableNotifications: function () {
                this.draggableNotificationsOpened = false;
            },
            onDockDraggableNotifications: function () {
                this.draggableNotificationsOpened = false;
                this.sidebarNotificationsOpened = true;
            },
            onUndockDraggableNotifications: function () {
                this.draggableNotificationsOpened = true;
                this.sidebarNotificationsOpened = false;
            },
            onOpenDraggableNotifications: function () {
                this.draggableNotificationsOpened = true;
            },
            onCloseSidebarNotifications: function () {
                this.sidebarNotificationsOpened = false;
            },
            onOpenSidebarNotifications: function () {
                this.sidebarNotificationsOpened = true;
            },
            onSessionEnd: async function () {
                if (this.activeClass.id) {
                    this.onLogNb('SESSION_END')

                    const token = localStorage.getItem("nb.user");
                    const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: this.sourceURL } }
                    await axios.post(`/api/spotlights/log/session/end`, {
                        action: 'SESSION_END',
                        type: 'NONE',
                        class_id: this.activeClass.id,
                        role: this.user.role.toUpperCase()
                    }, config)
                }
            },
            onLogout: async function () {
                await this.onSessionEnd()
                this.onUserLeft()
                localStorage.removeItem("nb.user")
                this.user = null
                this.myClasses = []
                this.activeClass = {}
                this.users = {}
                this.hashtags = {}
                this.threads = {}
                this.threadSelected = null
                this.threadsHovered = []
                this.draftRange = null
                this.isEditorEmpty = true
                this.filter = {
                    searchOption: 'text',
                    searchText: '',
                    bookmarks: false,
                    hashtags: [],
                    userTags: [],
                    comments: [],
                    replyReqs: [],
                    upvotes: [],
                    minWords: 0,
                    maxWords: null,
                    minHashtags: 0,
                    maxHashtags: null,
                    minReplies: 0,
                    minReplyReqs: 0,
                    minUpvotes: 0
                }
                this.showHighlights = true
                window.removeEventListener('scroll', this.handleScroll)
            },
            onLogNb: async function (event = 'NONE', initiator = 'NONE', spotlightType = 'NONE', isSyncAnnotation = false, hasSyncAnnotation = false, notificationTrigger = 'NONE', annotationId = null, countAnnotationReplies = 0, endorsed = false, followed = false) {
                if (this.currentConfigs.isNbLog && this.currentConfigs.nbLogEventsEnabled.includes(event)) {
                    // console.log(`onLogNb \nevent: ${event} \ninitiator: ${initiator} \nspotlightType: ${spotlightType} \nisSyncAnnotation: ${isSyncAnnotation} \nhasSyncAnnotation: ${hasSyncAnnotation} \nnotificationTrigger: ${notificationTrigger} \nannotationId: ${annotationId} \nannotation_replies_count: ${countAnnotationReplies}`)
                    const token = localStorage.getItem("nb.user");
                    const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: this.sourceURL } }
                    const pageYOffset = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0)
                    const pageHeight = (document.documentElement.scrollHeight - document.documentElement.clientHeight)

                    axios.post(`/api/log/nb`, {
                        class_id: this.activeClass.id,
                        annotation_id: annotationId,
                        event: event.toUpperCase(),
                        spotlight_type: spotlightType.toUpperCase(),
                        order: this.nbLogEventsOrder,
                        initiator: initiator,
                        is_sync_annotation: isSyncAnnotation,
                        has_sync_annotation: hasSyncAnnotation,
                        notification_trigger: notificationTrigger,
                        count_source_annotations: this.threads.length,
                        count_annotation_replies: countAnnotationReplies,
                        count_online_students: this.onlineUsers.students.length,
                        count_online_instructors: this.onlineUsers.instructors.length,
                        page_position: this.calculatePagePosition(pageYOffset, pageHeight).toUpperCase(),
                        page_y_offset: parseInt(pageYOffset, 10),
                        page_height: parseInt(pageHeight, 10),
                        role: this.users[this.user.id].role.toUpperCase(),
                        applied_filter: JSON.stringify(this.filter),
                        applied_sort: this.currentConfigs.sortByConfig,
                        comment_endorsed: endorsed,
                        comment_followed: followed,
                        slider_value: this.numberOfThreads
                    }, config)

                    this.nbLogEventsOrder = this.nbLogEventsOrder + 1
                }
            },
            createOrderedUsers: function(allUsers){
                for (const u in allUsers){
                    this.hashedUser[(hash.sha1().update(u).digest('hex'))] = u
                }
                this.orderedUsers = Object.keys(this.hashedUser)
                this.orderedUsers.sort()
                this.userNumber = this.orderedUsers.indexOf(hash.sha1().update(this.user.id).digest('hex'))
            },
            calculatePagePosition: function (pageYOffset, pageHeight) {
                const quarterLength = pageHeight / 4

                if (pageYOffset <= quarterLength) {
                    return '1/4'
                } else if (pageYOffset <= (quarterLength * 2)) {
                    return '2/4'
                } else if (pageYOffset <= (quarterLength * 3)) {
                    return '3/4'
                } else {
                    return '4/4'
                }
            },
            sleep: function (ms) {
                return new Promise(resolve => setTimeout(resolve, ms))
            },
            handleScroll: function (e) {
                if (this.currentConfigs.nbLogEventsEnabled.includes('SCROLL')) {
                    clearTimeout(this.scrollLogTimer)
                    this.scrollLogTimer = setTimeout(() => this.onLogNb('SCROLL'), this.currentConfigs.nbLogScrollSpoConfig)
                }
            },
        },
        components: {
            NbInnotations,
            NbMarginalias,
            NbHighlights,
            NbSidebar,
            NbLogin,
            NbNoAccess,
            NbNotificationSidebar
        }
    })

    document.body.addEventListener('mouseup', _ => {
        let selection = window.getSelection()
        if (selection.isCollapsed) { return }

        let sidebar = document.querySelector('#nb-app-wrapper')
        let range = selection.getRangeAt(0)
        if ( // check selection does not overlap sidebar
            !isNodePartOf(range.startContainer, sidebar) &&
            !isNodePartOf(range.endContainer, sidebar)
        ) {
            app.draftThread(range)
            // Selection will be removed in highlight-util.eventsProxyMouse
            // because 'click' is triggered after 'mouseup'
        }
    })

    document.body.addEventListener('touchend', _ => {
        let selection = window.getSelection()
        if (selection.isCollapsed) { return }

        let sidebar = document.querySelector('#nb-app-wrapper')
        let range = selection.getRangeAt(0)
        if ( // check selection does not overlap sidebar
            !isNodePartOf(range.startContainer, sidebar) &&
            !isNodePartOf(range.endContainer, sidebar)
        ) {
            app.draftThread(range)
            // Selection will be removed in highlight-util.eventsProxyMouse
            // because 'click' is triggered after 'mouseup'
        }
    })

    document.addEventListener('keyup', e => {
        if (e.key === 'Escape') {
            app.onUnselectThread()
        }
    })

    window.addEventListener('resize', _ => {
        app.handleRedrawHighlights()
    })

    // window.addEventListener('scroll', _ => {
    //     if (app.canRedrawHighlights && Math.abs(window.pageYOffset - app.redrawHighlightsOffset) > 200) {
    //         console.log(`handleRedrawHighlights`)
    //         app.handleRedrawHighlights()
    //     }
    // })

    // window.addEventListener('click', _ => {
    //     app.handleRedrawHighlights()
    // })

    window.addEventListener('beforeunload', async function (e) {
        e.preventDefault()
        await app.onSessionEnd()
        return
    })

    window.onbeforeunload = () => {
        app.onUserLeft()
    }

    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutationRecord) {
            app.handleRedrawHighlights()
        })
    })

    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })
}
