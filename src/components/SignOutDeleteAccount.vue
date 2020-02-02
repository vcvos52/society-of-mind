<template>
  <div id="sign-out" class="signout">
    <input type="submit" class="signoutBut" value="Sign Out" v-on:click="signOut">
    <input type="submit" class="signoutBut" value="Delete Account" v-on:click="deleteAccount">
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "SignOutDeleteAccount",
  
  methods: {
    /**
     * calls API to log out of an account
     */
    signOut: function() {
      axios.post('api/users/logout')
        .then(() => {
          // handle success
          eventBus.$emit('signout-success', true);
        })
        .catch(() => {
          // handle error
        })
    },

    /**
     * calls api to delete a user
     */
    deleteAccount: function(){
        axios.delete('api/users')
            .then(()=>{
                eventBus.$emit("deletion-successful", true);
            })
            .catch(() => {
          // handle error
           })
    }
  }
}
</script>

<style scoped>
  .signout{
    margin-top: 10%;
  }

  input[type="submit"]{
    width: 25%;
  }

  input.signoutBut{
    width: 100%;
  }
</style>
