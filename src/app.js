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
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { createNbRange, deserializeNbRange } from './models/nbrange.js'
import NbComment from './models/nbcomment.js'
import NbNotification from './models/nbnotification.js'
import { isNodePartOf } from './utils/dom-util.js'
import { compareDomPosition } from './utils/compare-util.js'
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
// import * as Sentry from "@sentry/vue";
// import { Integrations } from "@sentry/tracing";

//prodcution log
// Sentry.init({
//   Vue,
//   dsn: "https://1a47ffe142234c9cb942cf7ddd6d4ec3@o564291.ingest.sentry.io/5722075",
//   integrations: [new Integrations.BrowserTracing()],

//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   // We recommend adjusting this value in production
//   tracesSampleRate: 1.0,
// });

const currentEnv = Environments.prod

Vue.use(VueQuill)
Vue.use(VTooltip)
Vue.use(Notifications)
Vue.use(VueSweetalert2);
Vue.component('font-awesome-icon', FontAwesomeIcon)
library.add(fas, far, faChevronDown, faChevronUp)
const socket = io(currentEnv.baseURL, { reconnect: true })
axios.defaults.baseURL = `${currentEnv.baseURL}/`
export const PLUGIN_HOST_URL = currentEnv.pluginURL
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
    document.body.setAttribute('style', 'position: initial !important; margin: 0 325px 0 0 !important;')
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
                    @log-exp-spotlight="onLogExpSpotlight"
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
                    :user="user"
                    :activeClass="activeClass"
                    :current-configs="currentConfigs"
                    :show-sync-features="showSyncFeatures"
                    :is-innotation-hover="isInnotationHover"
                    @log-exp-spotlight="onLogExpSpotlight"
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
                    :source-url="sourceURL"
                    :current-configs="currentConfigs"
                    :is-dragging="isDragging"
                    :sidebar-width="sidebarWidth"
                    :thread-view-initiator="threadViewInitiator"
                    :draggable-notifications-opened="draggableNotificationsOpened"
                    :sidebar-notifications-opened="sidebarNotificationsOpened"
                    :notifications-muted="notificationsMuted"
                    threadSelectedPane="allThreads"
                    :show-sync-features="showSyncFeatures"
                    :sync-config="syncConfig"
                    @log-exp-spotlight="onLogExpSpotlight"
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
                    @min-upvotes="onMinUpvotes"
                    @select-thread="onSelectThread"
                    @select-notification="onSelectNotification"
                    @hover-thread="onHoverThread"
                    @unhover-thread="onUnhoverThread"
                    @delete-thread="onDeleteThread"
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
            activeClass: {},
            users: {},
            hashtags: {},
            threads: [],
            threadSelected: null,
            threadsHovered: [], // in case of hover on overlapping highlights
            notificationSelected: null,
            stillGatheringThreads: true,
            draftRange: null,
            isEditorEmpty: true,
            isInnotationHover: false,
            filter: {
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
            },
            showHighlights: true,
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
                isShowIndicatorForSpotlitThread: true,
                isShowIndicatorForNotifiedThread: false,
                isShowIndicatorForQuestionedThread: true,
                isIgnoreSectionsInClass: false,
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
            onlineUsers: [],
            currentSectionId: "",
            notificationThreads: [],
            swalClicked: false,
            notificationsMuted: false,
            draggableNotificationsOpened: false,
            sidebarNotificationsOpened: false,
            playSoundNotification: true,
            isExpSpotlight: false,
            expSpotlight: {},
            expSpotlightOrder: 0,
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
                let items = this.threads
                let searchText = this.filter.searchText
                if (searchText.length > 0) {
                    if (this.filter.searchOption === 'text') {
                        items = items.filter(item => item.hasText(searchText))
                    }
                    if (this.filter.searchOption === 'author') {
                        items = items.filter(item => item.hasAuthor(searchText))
                    }
                }
                if (this.filter.bookmarks) {
                    items = items.filter(item => item.hasBookmarks())
                }
                let filterHashtags = this.filter.hashtags
                if (filterHashtags.length > 0) {
                    items = items.filter(item => {
                        for (let hashtag of filterHashtags) {
                            if (item.hasHashtag(hashtag)) return true
                        }
                        return false
                    })
                }
                let filterUserTags = this.filter.userTags
                if (filterUserTags.includes('me')) { // single option for now
                    items = items.filter(item => item.hasUserTag(this.user.id))
                }
                let filterComments = this.filter.comments
                if (filterComments.length > 0) {
                    items = items.filter(item => {
                        if (filterComments.includes('instructor') && item.hasInstructorPost()) {
                            return true
                        }
                        if (filterComments.includes('me') && item.hasUserPost(this.user.id)) {
                            return true
                        }
                        return false
                    })
                }
                let filterReplyReqs = this.filter.replyReqs
                if (filterReplyReqs.length > 0) {
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
                    items = items.filter(item => item.wordCount >= minWords)
                }
                let maxWords = this.filter.maxWords
                if (maxWords) {
                    items = items.filter(item => item.wordCount <= maxWords)
                }
                let minHashtags = this.filter.minHashtags
                if (minHashtags > 0) {
                    items = items.filter(item => item.hashtags.length >= minHashtags)
                }
                let maxHashtags = this.filter.maxHashtags
                if (maxHashtags) {
                    items = items.filter(item => item.hashtags.length <= maxHashtags)
                }
                let minReplies = this.filter.minReplies
                if (minReplies > 0) {
                    items = items.filter(item => item.countAllReplies() >= minReplies)
                }
                let minReplyReqs = this.filter.minReplyReqs
                if (minReplyReqs > 0) {
                    items = items.filter(item => item.countAllReplyReqs() >= minReplyReqs)
                }
                let minUpvotes = this.filter.minUpvotes
                if (minUpvotes > 0) {
                    items = items.filter(item => item.countAllUpvotes() >= minUpvotes)
                }
                return items.concat().sort(compareDomPosition) // sort now so we can go prev and next comment
            }
        },
        watch: {
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
                } else {
                    const sourceWithQuery = window.location.href // try the source with query params as well
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

                    if (document.location.href.includes('/nb_viewer.html')) {
                        this.currentConfigs.isMarginalia = configs['SPOTLIGHT_MARGIN'] === 'true' ? true : false
                        this.currentConfigs.isInnotation = false
                        this.syncConfig = configs['SYNC_FEATURES'] === 'true' ? true : false
                        this.showSyncFeatures = this.syncConfig
                    } else {
                        this.currentConfigs.isMarginalia = false
                        this.currentConfigs.isInnotation = configs['SPOTLIGHT_INNOTATION'] === 'true' ? true : false
                        this.syncConfig = configs['SYNC_FEATURES'] === 'true' ? true : false
                        this.showSyncFeatures = this.syncConfig
                    }


                    let source = window.location.origin + window.location.pathname
                    if (this.sourceURL.length > 0) {
                        source = this.sourceURL
                    }

                    const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: source, class: newActiveClass.id } }

                    // TODO: if instructor skip
                    const expSpotlight = await axios.get('/api/exp/spotlight', config)
                    if (expSpotlight.data) {
                        console.log('has exp')
                        this.expSpotlight.class = expSpotlight.data
                        const isExpSpotlightStarted = await axios.get('/api/exp/spotlight/source', config)

                        if (isExpSpotlightStarted.data.length > 0) {
                            console.log('started')
                            this.isExpSpotlight = true

                            if (this.expSpotlight.class.control.includes(this.user.id)) {
                                console.log('control')
                                this.expSpotlight.group = 'control'
                                this.currentConfigs.isShowIndicatorForSpotlitThread = false
                                this.currentConfigs.isEmphasize = false
                                this.currentConfigs.isMarginalia = false
                                this.currentConfigs.isInnotation = false
                            } else if (this.expSpotlight.class.treatment.includes(this.user.id)) {
                                console.log('treatment')
                                this.expSpotlight.group = 'treatment'
                                const assignment = await axios.get('/api/exp/spotlight/source/assignment', config)
                                this.expSpotlight.assignment = assignment.data
                            } else {
                                console.log('not in the exp')
                                this.isExpSpotlight = false
                            }

                        } else {
                            console.log('Did not start')
                            this.isExpSpotlight = false
                            this.currentConfigs.isShowIndicatorForSpotlitThread = false
                            this.currentConfigs.isEmphasize = false
                            this.currentConfigs.isMarginalia = false
                            this.currentConfigs.isInnotation = false
                        }

                    } else {
                        console.log('no exp')
                        this.isExpSpotlight = false
                    }

                    axios.get('/api/annotations/allUsers', config)
                        .then(res => {
                            this.users = res.data
                            this.$set(this.user, 'role', this.users[this.user.id].role)
                            this.onLogExpSpotlight('SESSION_START', 'NONE', 'NONE', false)

                            if (this.expSpotlight.class && this.users[this.user.id].role.toUpperCase() === 'INSTRUCTOR') {
                                console.log('INSTRUCTOR in expSpotlight')
                                this.currentConfigs.isShowIndicatorForSpotlitThread = true
                                this.currentConfigs.isEmphasize = true
                                this.currentConfigs.isMarginalia = false
                                this.currentConfigs.isInnotation = false
                            }

                            const configSessionStart = { headers: { Authorization: 'Bearer ' + token }, params: { url: this.sourceURL } }
                            axios.post(`/api/spotlights/log/session/start`, {
                                action: 'SESSION_START',
                                type: 'NONE',
                                class_id: this.activeClass.id,
                                role: this.users[this.user.id].role.toUpperCase()
                            }, configSessionStart)
                        })

                    axios.get('/api/annotations/myCurrentSection', config)
                        .then(res => {
                            socket.emit('left', { username: this.user.username, classId: oldActiveClass.id, sectionId: this.currentSectionId })
                            this.currentSectionId = res.data
                            socket.emit('joined', { username: this.user.username, classId: newActiveClass.id, sectionId: this.currentSectionId })
                        })

                    axios.get('/api/annotations/allTagTypes', config)
                        .then(res => {
                            this.hashtags = res.data
                        })

                    this.getAllAnnotations(source, newActiveClass) // another axios call put into a helper method
                }

            }
        },
        created: async function () {
            const token = localStorage.getItem("nb.user")
            if (token) {
                const decoded = VueJwtDecode.decode(token)
                this.user = decoded.user
            }

            // remove hypothesis
            const hypothesisSidebar = document.getElementsByTagName('hypothesis-sidebar')
            const hypothesisAdder = document.getElementsByTagName('hypothesis-adder')
            hypothesisSidebar && hypothesisSidebar[0] && hypothesisSidebar[0].remove()
            hypothesisAdder && hypothesisAdder[0] && hypothesisAdder[0].remove()

            socket.on('connections', (data) => {
                if (data.classId === this.activeClass.id && data.sectionId === this.currentSectionId) {
                    let onlineUsersSet = new Set(data.connections)
                    this.onlineUsers = [...onlineUsersSet]
                }
            })

            socket.on("new_thread", (data) => {
                let userIdsSet = new Set(data.userIds)
                if (data.authorId !== this.user.id && userIdsSet.has(this.user.id)) { // find if we are one of the target audiences w/ visibility + section permissions for this new_thread if current user, we already added new thread to their list
                    let classId = data.classId
                    if (this.activeClass) { // originally had a check here to see if currently signed in, then don't retrieve again
                        if (this.activeClass.id == classId && this.sourceURL === data.sourceUrl) {
                            this.getSingleThread(data.sourceUrl, classId, data.threadId, data.authorId, data.taggedUsers, true) // data contains info about the thread and if the new thread as posted by an instructor
                            console.log("new thread: gathered new annotations")
                        }
                    }
                }
            })

            socket.on('thread-typing', (data) => {
                let thread = this.threads.find(x => x.id === data.threadId)
                if (thread !== undefined) {
                    thread.usersTyping = data.usersTyping
                }
            })

            socket.on('new_reply', (data) => {
                if (data.authorId !== this.user.id) { // if current user, we already added new reply to their list
                    let classId = data.classId
                    if (this.activeClass) { // originally had a check here to see if currently signed in, then don't retrieve again
                        if (this.activeClass.id == classId && this.sourceURL === data.sourceUrl) {
                            this.threads = this.threads.filter(x => x.id !== data.headAnnotationId) // filter out the thread
                            this.getSingleThread(data.sourceUrl, classId, data.threadId, data.authorId, data.taggedUsers, false, data.newAnnotationId, data.headAnnotationId) // data contains info about the thread and if the new thread as posted by an instructor
                        }
                    }
                }
            })
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
                socket.emit('left', { username: this.user.username, classId: this.activeClass.id, sectionId: this.currentSectionId })
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

                        // get the specific annotation that was recently posted
                        let specificAnnotation = null
                        if (replyAnnotationId !== null) {
                            specificAnnotation = comment.getChildComment(replyAnnotationId)
                        }

                        // set any type of notification
                        let notification = null
                        if (taggedUsers.includes(this.user.id)) { // user tagged in post
                            notification = new NbNotification(comment, "tag", true, specificAnnotation, false)
                        } else if ((isNewThread && comment.hasReplyRequests()) || (specificAnnotation !== null && specificAnnotation.hasReplyRequests())) { // new thread with reply request or the reply had a reply request
                            notification = new NbNotification(comment, "question", false, specificAnnotation, false)
                        } else if (specificAnnotation && specificAnnotation.parent && specificAnnotation.parent.author === this.user.id) { // if this new comment is a reply to the user
                            notification = new NbNotification(comment, "reply", false, specificAnnotation, false)
                        } else if (this.users[authorId].role === "instructor") { // instructor comment
                            notification = new NbNotification(comment, "instructor", false, specificAnnotation, false)
                            // if (isNewThread) {
                            //     notification = new NbNotification(comment, "instructor", false, specificAnnotation, false)
                            // } else {
                            //     if (comment.getAllAuthors().has(this.user.id)) {
                            //         notification = new NbNotification(comment, "instructor", false, specificAnnotation, false)
                            //     }
                            // }
                        } else if (this.user.role === 'instructor' && isNewThread) { // instructors will get all new threads and posts
                            notification = new NbNotification(comment, "recent", false, specificAnnotation, false)
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
                    })
            },
            triggerPopupNotification: function (notification) {
                if (this.showSyncFeatures && notification.triggerPopup && !this.notificationsMuted) {
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
                        timer: 6000,
                    }).then((result) => {
                        if (result.value) {
                            this.swalClicked = true
                            this.onSelectNotification(notification)
                        }
                    })
                }
            },
            playNotificationSound: function (sound = new Audio("https://soundbible.com/mp3/Air Plane Ding-SoundBible.com-496729130.mp3")) {
                if (this.showSyncFeatures && this.playSoundNotification && !this.notificationsMuted) {
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

                axios.get('/api/annotations/new_annotation', config)
                    .then(async res => {
                        this.threads = []

                        for (const item of res.data.headAnnotations) {
                            try {
                                item.range = deserializeNbRange(item.range)
                            } catch (e) {
                                console.warn(`Could not deserialize range for ${item.id}`)
                                continue
                            }
                            // Nb Comment
                            let comment = new NbComment(item, res.data.annotationsData)
                            this.threads.push(comment)
                            let offlineNotification = this.newOfflineNotification(comment) // Either get back a notification to add or null
                            if (offlineNotification !== null) {
                                this.notificationThreads.push(offlineNotification)
                                comment.associatedNotification = offlineNotification
                            }
                        }

                        if (this.isExpSpotlight && this.expSpotlight.group === 'treatment') {
                            if (!this.expSpotlight.assignment.annotations) {
                                console.log('need to assign annotations')
                                const highQualityAnnotations = []
                                const otherAnnotations = []
                                const pickedAnnotationsIds = []
                                const blockPos = ['ABOVE', 'BELLOW', 'LEFT', 'RIGHT']

                                this.threads.forEach(t => {
                                    if (t.spotlight) {
                                        highQualityAnnotations.push(t.id)
                                    } else {
                                        otherAnnotations.push(t.id)
                                    }
                                })

                                const highQualityAnnotations2 = JSON.parse(JSON.stringify(highQualityAnnotations))

                                while (pickedAnnotationsIds.length < this.expSpotlight.assignment.quantity / 2
                                    && highQualityAnnotations.length > 0) {
                                    let index = Math.floor(Math.random() * highQualityAnnotations.length)
                                    const picked = highQualityAnnotations[index]
                                    if (!pickedAnnotationsIds.includes(picked)) {
                                        pickedAnnotationsIds.push(picked)
                                        highQualityAnnotations.splice(index, 1)
                                    }
                                }

                                while (pickedAnnotationsIds.length < this.expSpotlight.assignment.quantity
                                    && otherAnnotations.length > 0) {
                                    let index = Math.floor(Math.random() * otherAnnotations.length)
                                    const picked = otherAnnotations[index]
                                    if (!pickedAnnotationsIds.includes(picked)) {
                                        pickedAnnotationsIds.push(picked)
                                        otherAnnotations.splice(index, 1)
                                    }
                                }

                                const pickedAnnotations = pickedAnnotationsIds.map(id => {
                                    return {
                                        id: id,
                                        type: this.expSpotlight.assignment.type == 'BLOCK' ? blockPos[Math.floor(Math.random() * blockPos.length)] : this.expSpotlight.assignment.type,
                                        highQuality: highQualityAnnotations2.includes(id)
                                    }
                                })

                                const assignmentReqconfig = { headers: { Authorization: 'Bearer ' + token }, params: { assignment: this.expSpotlight.assignment.id } }
                                await axios.post('/api/exp/spotlight/source/assignment/annotations', pickedAnnotations, assignmentReqconfig)
                                this.expSpotlight.assignment.annotations = pickedAnnotations
                            } else {
                                this.expSpotlight.assignment.annotations = JSON.parse(this.expSpotlight.assignment.annotations)
                            }

                            const assignmentAnnotationsIds = this.expSpotlight.assignment.annotations.map(a => a.id)
                            console.log('Has assign annotations')

                            this.threads.forEach(t => {
                                if (assignmentAnnotationsIds.includes(t.id)) {
                                    for (const annotation of this.expSpotlight.assignment.annotations) {
                                        if (annotation.id === t.id) {
                                            t.spotlight = {
                                                type: annotation.type,
                                                highQuality: annotation.highQuality
                                            }
                                            break
                                        }
                                    }
                                } else {
                                    t.spotlight = null
                                }
                            })
                        } else if (this.isExpSpotlight && this.expSpotlight.group === 'control') {
                            this.threads.forEach(t => {
                                t.spotlight = null
                            })
                        }

                        this.stillGatheringThreads = false
                        this.notificationThreads = this.notificationThreads.concat().sort(function(a, b) { // sort notification order
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
            draftThread: function (range) {
                if (this.user) { // only if selection was after user log in
                    this.draftRange = createNbRange(range)
                }
            },
            onDeleteThread: function (thread) {
                if (this.threadSelected === thread) { this.threadSelected = null }
                let idx = this.threads.indexOf(thread)
                if (idx >= 0) { this.threads.splice(idx, 1) }
                if (thread.id) {
                    const token = localStorage.getItem("nb.user");
                    const headers = { headers: { Authorization: 'Bearer ' + token } }
                    axios.delete(`/api/annotations/annotation/${thread.id}`, headers)
                }
            },
            onNewThread: function (thread) {
                this.threads.push(thread)
                this.draftRange = null
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
            onFilterUserTags: function (filters) {
                if (this.threadSelected && filters.includes('me') && !this.threadSelected.hasUserTag(this.user.id)) {
                    this.threadSelected = null // reset selection if filtered
                }
                this.filter.userTags = filters
            },
            onFilterComments: function (filters) {
                if (this.threadSelected && filters.length > 0) {
                    let filtered = true
                    if (filters.includes('instructor') && this.threadSelected.hasInstructorPost()) {
                        filtered = false
                    }
                    if (filters.includes('me') && this.threadSelected.hasUserPost(this.user.id)) {
                        filtered = false
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
            onSelectThread: function (thread, threadViewInitiator = 'NONE') {
                this.threadViewInitiator = threadViewInitiator
                // console.log('threadViewInitiator: ' + this.threadViewInitiator)
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
                //console.log('threadViewInitiator: ' + this.threadViewInitiator)
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
                    this.onLogExpSpotlight('SESSION_END', 'NONE', 'NONE', false)

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
                this.threads = []
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
            },
            onLogExpSpotlight: async function (event = 'NONE', initiator = 'NONE', type = 'NONE', highQuality = false, annotationId = null, annotation_replies_count = 0) {
                if (this.isExpSpotlight) {
                    console.log(`onLogExpSpotlight \nevent: ${event} \ninitiator: ${initiator} \ntype: ${type} \nhighQuality: ${highQuality} \nannotationId: ${annotationId} \nannotation_replies_count: ${annotation_replies_count}`)
                    const token = localStorage.getItem("nb.user");
                    const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: this.sourceURL } }

                    axios.post(`/api/exp/spotlight/log`, {
                        class_id: this.activeClass.id,
                        annotation_id: annotationId,
                        event: event,
                        type: type,
                        order: this.expSpotlightOrder,
                        initiator: initiator,
                        highQuality: highQuality,
                        source_annotations_count: this.threads.length,
                        annotation_replies_count: annotation_replies_count,
                        exp_group: this.expSpotlight.group.toUpperCase(),
                        exp_type: this.expSpotlight.assignment ? this.expSpotlight.assignment.type : 'NONE',
                        exp_quantity: this.expSpotlight.assignment ? this.expSpotlight.assignment.quantity : 0,
                    }, config)

                    this.expSpotlightOrder = this.expSpotlightOrder + 1
                }
            }
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
