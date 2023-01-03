class NbNotification {
    constructor (comment, type, triggerPopup=false, specificAnnotation=null, isOfflineNotification=false){
        this.comment = comment 
        this.unseen = true
        this.type = type // "question", "instructor", "recent", "tag"
        this.triggerPopup = triggerPopup
        this.specificAnnotation = specificAnnotation
        this.isOfflineNotification = isOfflineNotification
        this.trigger = 'NONE'
        // this.trigger is used to tell the spotlight logs what type of notification the user clicked on
        // ('NONE', 'INSTRUCTOR_COMMENTED', 'REPLY_REQUESTED', 'USER_TAGGED', 'USER_SAW_RECENT_ACTIVITY')
        let triggerMap = {"tag": 'USER_TAGGED', "instructor": 'INSTRUCTOR_COMMENTED', "question": 'REPLY_REQUESTED', "recent": 'USER_SAW_RECENT_ACTIVITY', "reply": "USER_COMMENT_REPLIED_TO", "follow": "AUTHOR_I_FOLLOW_COMMENTED", "endorsed": "INSTRUCTOR_ENDORSED"}
        if (this.type in triggerMap) {
            this.trigger = triggerMap[this.type]
        }

        this.readableType = ''
        let readableTypeMap = {"tag": "you've been tagged", "instructor": "instructor comment", "question": "reply requested", "recent": "recent comment nearby", "reply": "comment reply", "follow": "author you follow commented", "endorsed": "instructor endorsed"}
        if (this.type in readableTypeMap) {
            this.readableType = readableTypeMap[this.type]
        }
    }

    setIsUnseen(val) {
        this.unseen = val
    }
}

export default NbNotification