<template>
    <div class="nb-audio-editor">
        <template v-if="showError">
            <span>Your browser doesn’t support audio recording or you’ve blocked microphone access.</span>
        </template>
        
        <template v-else>
            <vue-dictaphone @stop="handleRecording($event)" @error="handleError" mime-type="audio/mp3" v-slot="{ isRecording, startRecording, stopRecording, deleteRecording }">
                <button v-if="!isRecording" @click="startRecording"><font-awesome-icon icon="circle" class="ae-icon"></font-awesome-icon></button>
                <button v-if="isRecording" @click="stopRecording"><font-awesome-icon icon="stop" class="ae-icon"></font-awesome-icon></button>
                <vue-dictaphone-spectrum-analyser v-if="isRecording"/>
            </vue-dictaphone>
            <template v-if="isRecorded">
                <audio :src="audioSource" controls></audio>
            </template>
            <button v-if="false &&!isRecording && isRecorded" @click="handleDeleteRecording"><font-awesome-icon icon="trash" class="ae-icon"></font-awesome-icon></button>
        </template>

    </div>
</template>

<script>
import Vue from 'vue'
import VueDictaphone from "vue-dictaphone";

Vue.use(VueDictaphone);

export default {
    name: 'audio-editor',
    props: {
        
    },
    data () {
        return {
            isRecorded: false,
            audioSource: null,
            mediaBlob: null,
            showError: false,
        }
    },
    methods: {
        handleRecording({ blob, src }) {
            this.isRecorded = true
            this.audioSource = src;
            this.mediaBlob = blob
            this.$emit("audio-stop", blob)
        },
        handleDeleteRecording() {
            if (window.confirm("Are you sure?")) {
                // this.audioSource = null
                // this.mediaBlob = null
                this.isRecorded = false
                console.log('delete now')
            }
        },
        handleError() {
            this.showError = true;
        },
    }
}
</script>

<style>
.nb-audio-editor {
    background: #f9f5f5;
    height: 75px;
    margin: 15px 0;
    display: flex;
    align-content: center;
    justify-content: flex-start;
    align-items: center;
    border: 1px solid #d5d5d5;
}

.nb-audio-editor div {
    display: flex;
    align-items: center;
    align-content: center;
}

.nb-audio-editor div canvas {
    width: calc(100% - 50px);
}

.nb-audio-editor button {
    line-height: initial;
    height: 40px;
    width: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #efefef;
    border: 1px solid #969696;
    border-radius: 0;
    margin: 10px;
}

.nb-audio-editor audio {
    margin: 0 10px;
    width: 100%;
}

.nb-audio-editor .ae-icon {
    
}
</style>
