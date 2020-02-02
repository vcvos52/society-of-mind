<template>
    <div v-if="displayFreetControls" class="topBannerForDropDownRight">
        <form v-on:submit.prevent="updateFreet">
            <h3>Update Freet</h3>
            <label> ID of freet to edit:</label>
             <input class="edit" v-model.trim='id' type="text" name="id" placeholder="id" required>
             <label> New Freet Content:</label>
            <input class="edit" v-model.trim='content' type="text" name="content" placeholder="Updated Content" required>
            <input type="submit" value="update">
        </form>

        <p v-if="updateError">Error: {{updateError}}</p>

        <h3 v-if="displayUser"> Viewing Freets from {{userToDisplay}}.</h3>
        <button v-if="displayUser" v-on:click="displayAllFreets">View All Freets</button>

        <form v-on:submit.prevent="displayUserFreets" v-else>
            <label> Find all Freets from: </label>
            <input class="edit" v-model.trim='userToDisplay' type="text" name="userToDisplay" placeholder="user name" required>
            <input type="submit" value="Find 'em!">
        </form>

        <form v-on:submit.prevent="displayFollowersFreets" v-if="displayingAll">
            <label> View Followers' Freets: </label>
            <input type="submit" value="View Followers">
        </form>


        <p v-if="findUserFreetsError">Error: {{findUserFreetsError}}</p>
    </div>
</template>

<script>

import axios from "axios";

import { eventBus } from "../main";

export default {
  name: "FreetList",

  data() {
    return {
      freets: [],
      updateError: "",
      findUserFreetsError: "",
      content: "",
      id: "",
      displayUser: false,
      userToDisplay: "",
      displayFreetControls: false,
      displayingAll: true,
    };
  },

  created: function() {


    eventBus.$on("display-freet-controls", res => {
      if (this.displayFreetControls){
        this.displayFreetControls = false;
      } else {this.displayFreetControls = true}
    });

  },

  methods: {

    /**
     * updates a freet by calling API
     * handles all errors and displays
     */
    updateFreet: function() {
      const body = { content: this.content };
      axios.put(`/api/freets/edit/${this.id}`, body)
          .then((res) => {eventBus.$emit("update-freet-success", res);})
          .catch(err => {this.updateError = err.response.data;})
          .then(() => {
              this.clearMessages();
              this.content = "";
              this.id = "";
        });
    },


  /**
   * Displays the freets of a single user by calling API
   * handles all errors
   */
  displayUserFreets: function(){
    axios.get(`/api/users/exists/${this.userToDisplay}`).then(() => {
            this.displayUser = true;
            eventBus.$emit("display-user-only", this.userToDisplay);
            this.userToDisplay = "";
    }).catch(err => {
            this.findUserFreetsError = err.response.data;
            this.userToDisplay = "";
    }).then(this.clearMessages());

  },

  displayFollowersFreets: function(){
    this.displayingAll = false;
    // Set this to true to create way to get back to freets, and prevent double filtering
    this.displayUser = true;
    eventBus.$emit("display-followers-only");
    this.userToDisplay = "";

    // axios.get(`/api/users/displayFollowers`).then(() => {
    //         this.displayingAll = false;
    //         this.displayUser = true;
    //         eventBus.$emit("display-followers-only");
    //         this.userToDisplay = "";
    // }).catch(err => {
    //         this.findUserFreetsError = err.response.data;
    //         this.userToDisplay = "";
    // }).then(this.clearMessages());

  },

  /**
   * gives the user the option to go back and display all freets
   * if currently displaying one user
   */
  displayAllFreets: function(){
    this.displayUser = false;
    this.displayingAll = true;
    eventBus.$emit("display-all-freets", true);
    this.userToDisplay = "";
  },

    clearMessages: function() {
      setTimeout(() => {
        this.findUserFreetsError = "";
        this.updateError = "";
      }, 5000);
    }

}
};
</script>




<style scoped>
.topBannerForDropDownRight{
    margin-top: 40px;
    width:12%;
    display: flex;
    flex-flow: column wrap;
    right: 0px;
    position: fixed;
    margin-right: 40px;
    background-color: lightgray;
    padding: 20px;
    justify-content: center;
    top: 0;
}

p{
    color:red;
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
}

input[type="submit"]{
  display: inline-block !important;
  text-align: center !important;
  width: 100% !important;
}

form{
    width: 100%;
    margin-bottom: 20px;
    margin-right: 40px;
    margin-left:0px;
}
</style>