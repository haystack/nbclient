class NbNotification {
    constructor (title, comment, type, triggerPopup=false){
        this.title = title
        this.comment = comment 
        this.unseen = true
        this.type = type // "question", "instructor", "recent", "tag"
        this.triggerPopup = triggerPopup
    }

    setIsUnseen(val) {
        this.unseen = val
    }
}

export default NbNotification