<template>
    <div class="drop-down">

        <form id="change-username" class="component" v-on:submit.prevent="changeUsername" method="put">
            
            <label for='newUsername'>New Username:</label>
            <input id='newUsername' v-model.trim='newUsername' type='text' name='username' placeholder="New Username" required>

            <input type='submit' value='Change Username'>
        </form>


        <form id="change-password" class='component' v-on:submit.prevent="changePassword" method="put">
            
            <label for='password'>New Password:</label>
            <input id='password' v-model.trim='newPassword' type='text' name='password' placeholder="New Password" required>

            <input type='submit' value='Change Password'>
        </form>

        <div v-if='message' class="success-message">
            {{ message }}
        </div>

        <p v-if="errors" class="errorMess">Error: {{errors}}</p>
    </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "ChangeUsernamePassword",

  data() {
    return {
      errors: "",
      message: "",
      newUsername: "",
      newPassword: ""
    }
  },

  methods: {
    /**
     * Changes user name by calling API
     * if failed, displays error.
     * If success, displays success message
     */
    changeUsername: function() {
      const bodyContent = { username: this.newUsername };
        axios
          .put(`/api/users/${this.newUsername}/username`, bodyContent)
          .then(() => {
            eventBus.$emit('reload', true);
            this.message = "You have changed your username to " + this.newUsername + ".";
          })
          .catch(err => {this.errors = err.response.data;})
          .then(() => {
            // always executed
            this.resetForm();
            this.clearMessages();
          });
    },

    /**
     * Changes password by calling API
     * if failed, displays error.
     * If success, displays success message
     */
    changePassword: function() {
      const bodyContent = { username: this.newUsername, password: this.newPassword };
        axios
          .put("/api/users/password", bodyContent)
          .then(() => {
            // handle success
            this.message = "You have changed your password to" + this.newPassword + ".";
          })
          .catch(err => {
            console.log(err);
            this.errors = err.response.data;
          })
          .then(() => {
            // always executed
            this.resetForm();
            this.clearMessages();
          });
    },

    /**
     * resets error messages
     */
    resetForm: function() {
      this.newUsername = "";
      this.newPassword = "";
    },

    clearMessages: function() {
      setTimeout(() => {
        this.message = "";
        this.errors = "";
      }, 5000);
    }

  }
}
</script>

<style scoped>
input[type="submit"]{
  display: inline-block !important;
  text-align: center !important;
  width: 100% !important;
  
}

.component{
  width:100%;
  margin-bottom: 20px;
  margin-left: 0px;
}

.errorMess{
  color:red;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}
</style>
