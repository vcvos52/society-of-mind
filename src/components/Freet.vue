<template>
  <div class="Freet">
    <div class="message">
      <p>Message: {{ freet.message }}</p>
    </div>
    <div class="freetInfo">
      <p class="id">ID: {{ freet.id }}</p>
      <p class="author">Created by: {{ freet.author }}</p>
      <p class="votes">Votes: {{freet.votes}}</p>
      <p v-if="freet.refreeterID">Refreeted By: {{freet.refreeterID}}</p>
    </div>
    <div class="freetButt">
      <button v-if="isUsers" v-on:click="deleteFreet">Delete</button>
      <button v-on:click="upvote" v-bind:class="{alreadyVoted : alreadyUpvoted}">Upvote</button>
      <button v-on:click="downvote" v-bind:class="{alreadyVoted : alreadyDownvoted}">Downvote</button>
      <button v-if="!isUsers" v-on:click="refreet">Refreet</button>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "Freet",

  props: {
    freet: Object
  },

  data() {
    return {
      content: "",
      alreadyUpvoted: false,
      alreadyDownvoted: false,
      isUsers: false
    };
  },

  created: function() {

    axios.get(`/api/freets/isowner/${this.freet.author}`)
      .then(() => {
        this.isUsers = true;
      });

    // Check if upvoted
    axios.get(`/api/freets/checkUpvote/${this.freet.id}`, {})
      .then(() => {
        this.alreadyUpvoted = true;
      });


    // Check if downvoed
    axios.get(`/api/freets/checkDownvote/${this.freet.id}`, {})
      .then(() => {
        this.alreadyDownvoted = true;
      });
  },

  methods: {

    /**
     * The emit method on these function links to FreetList actions
     */

    deleteFreet: function() {
      axios
        .delete(`/api/freets/delete/${this.freet.id}`, {})
        .then(() => {
          eventBus.$emit("delete-freet-success", this.freet);
        })
        .catch(err => {
          eventBus.$emit("delete-freet-error", err);
        })
    },

    // Upvotes a freet and prevents double votes
    upvote: function(){
        // Nothing is voted - add upvote
        if (!this.alreadyUpvoted && !this.alreadyDownvoted){
          let body = {id : this.freet.id};
          axios.post('/api/freets/upvote', body)
              .then(() => {eventBus.$emit("vote-freet-success", this.freet)})
              .catch(err => {eventBus.$emit("vote-freet-error", this.freet)});
          this.alreadyUpvoted = true;
        } 
        // Get rid of the upvote
        else if (this.alreadyUpvoted && !this.alreadyDownvoted){
          let body = {id : this.freet.id};
          axios.post('/api/freets/downvote', body)
              .then(() => {eventBus.$emit("vote-freet-success", this.freet)})
              .catch(err => {eventBus.$emit("vote-freet-error", this.freet)});
          this.alreadyUpvoted = false;
        } 
        // downvoted - get rid of down vote, and then upvote (SWITCH)
        else if (!this.alreadyUpvoted && this.alreadyDownvoted){
          let body = {id : this.freet.id};
          axios.post('/api/freets/upvote', body)
              .then(() => {eventBus.$emit("vote-freet-success", this.freet)})
              .catch(err => {eventBus.$emit("vote-freet-error", this.freet)});
          this.alreadyDownvoted = false;
          axios.post('/api/freets/upvote', body)
              .then(() => {eventBus.$emit("vote-freet-success", this.freet)})
              .catch(err => {eventBus.$emit("vote-freet-error", this.freet)});
          this.alreadyUpvoted = true;
        }
    },

    // Downvotes a freet and prevents double voting
    downvote: function(){
        if (!this.alreadyDownvoted && !this.alreadyUpvoted){
          let body = {id : this.freet.id};
          axios.post('/api/freets/downvote', body)
              .then(() => {eventBus.$emit("vote-freet-success", this.freet)})
              .catch(err => {eventBus.$emit("vote-freet-error", this.freet)});
          this.alreadyDownvoted = true;
        } else if (this.alreadyDownvoted && !this.alreadyUpvoted){
            let body = {id : this.freet.id};
            axios.post('/api/freets/upvote', body)
                .then(() => {eventBus.$emit("vote-freet-success", this.freet)})
                .catch(err => {eventBus.$emit("vote-freet-error", this.freet)});
            this.alreadyDownvoted = false;
        }
        // upvoted - get rid of up vote, and then down vote (SWITCH)
        else if (this.alreadyUpvoted && !this.alreadyDownvoted){
          let body = {id : this.freet.id};
          axios.post('/api/freets/downvote', body)
              .then(() => {eventBus.$emit("vote-freet-success", this.freet)})
              .catch(err => {eventBus.$emit("vote-freet-error", this.freet)});
          this.alreadyUpvoted = false;
          axios.post('/api/freets/downvote', body)
              .then(() => {eventBus.$emit("vote-freet-success", this.freet)})
              .catch(err => {eventBus.$emit("vote-freet-error", this.freet)});
          this.alreadyDownvoted = true;
        }
    },

    // refreets a freet and prevents user from refreet own freets
    refreet: function(){
        const body = {id : this.freet.id, author: this.freet.author, message: this.freet.message};
        axios.post(`/api/freets/refreet/${this.freet.id}`, body)
            .then(() => {eventBus.$emit("vote-freet-success", this.freet)})
            .catch(err => {eventBus.$emit("vote-freet-error", this.freet)});
    },
  }
};
</script>



<style scoped>

.Freet{
  background-color: white;
  width: 400px;
  min-height: 250px;
  display: flex;
  flex-flow: column wrap;
  margin-bottom: 20px;
  margin-top: 10px;
}

button.alreadyVoted{
  background-color: yellow;
}

.message{
  display: block;
  width: 100%;
  height: 40%;
  word-wrap: break-word;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif
}

.freetInfo{
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  margin-left: 5%;
  margin-right: 5%;
  margin-top: 9%;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

.freetButt{
  display: flex;
  justify-content: end;
  align-content: flex-end;
  margin-top: auto;
  margin-bottom: 0;
  bottom: 0;
  justify-content: space-between;
}

.freetButt > *{
  width: 120px;
  height: 60px;
  background-color: rgb(219, 241, 234);
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif
  }

.freetButt > *:hover{
  background-color: black;
  color: aliceblue;
}

</style>
