<template>
<!-- the submit event will no longer reload the page -->
  <form id='create-freet' class='form-group' v-on:submit.prevent='createFreet' method='post'>
    <h3>Create Freet</h3>

    <form v-on:submit.prevent="createFreet">
      <label for='message'>Freet Message:</label>
      <input id='message' v-model.trim='message' type='text' name='message' required>

      <input type='submit' value='Create Freet'>
    </form>

    <p v-if="error">Error: {{error}}</p>

    <!-- <div v-if='error' class="error-message">
      <b>Please correct the following error(s):</b>
      <ul>
        <li v-for='error in errors' v-bind:key='error.id'>{{ error }}</li>
      </ul>
    </div> -->

  </form>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "CreateFreetForm",

  data() {
    return {
      error: "",
      success: "",
      message: "",
    };
  },

  methods: {
    /**
     * calls API to create a freet
     * handles rendering of freet, and errors
     */
    createFreet: function() {
        const bodyContent = { content: this.message };
        axios
          .post("/api/freets", bodyContent)
          .then(freet => {
            eventBus.$emit("create-freet-success", freet);
          })
          .catch(err => {
            // handle error
            this.error = err.response.data;
          })
          .then(() => {
            // always executed
            this.resetForm();
            this.clearMessages();
          });
    },

    // resets all messages
    resetForm: function() {
      this.message = "";
    },

    // clears all messages after 5 seconds
    clearMessages: function() {
      setTimeout(() => {
        this.error = "";
        this.success = "";
      }, 5000);
    }
  }
};

</script>

<style scoped>

p{
    color:red;
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
}

form{
  flex-flow: column wrap;
}

.form-group {
  width: 100%;
  display: flex;
  justify-content: center;
}

label {
  margin-bottom: 0px;
}

form {
  width: fit-content;
  margin: auto;
}

input[type="text"],
input[type="url"] {
  width: 15rem;
}

</style>
