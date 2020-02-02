<template>
  <div class="user-display">

    <div>
      <p class="id">Name: {{ user.name }}</p>
    </div>
    <button v-if="followed" v-on:click="unfollow">Unfollow</button>
    <button v-else v-on:click="follow">Follow</button>

  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "User",

  props: {
    user: Object
  },

  data() {
      return {
        followed: false,
      };
  },

  created: function(){

      this.checkFollowedStatus();

  },

  methods: {

      // follows a user
      follow: function(){
          axios.post(`/api/users/follow/${this.user.name}`)
            .then(() => {
                this.followed = true;
            })
      },

      // unfollows a user
      unfollow: function(){
          axios.delete(`/api/users/unfollow/${this.user.name}`)
            .then(() => {
                this.followed = false;
            })
      },

      // Goes through and checks us a user is following another user
      checkFollowedStatus: function(){
          axios.get(`/api/users/checkFollowed/${this.user.name}`)
            .then(() => {
                this.followed = true;
            }).catch(() => {
                this.followed = false;
            });
      }
  }
}

</script>

<style scoped>
    .user-display{
        display: flex;
        flex-flow: row wrap;
        border: 4px solid black;
        justify-content: space-between;
    }
</style>
