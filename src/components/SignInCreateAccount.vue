<template>
    <div class="form-group">

        <form id="create-account" class='component' v-on:submit.prevent="createAccount" method="post">
            <input v-model="csrfToken" type="hidden" name="_csrf">
            <h3>Create Account</h3>
            
            <label for='newUsername'>Username:</label>
            <input id='newUsername' v-model.trim='newUsername' type='text' name='username' required>
            <label for='newPassword'>Password:</label>
            <input id='newPassword' v-model.trim='newPassword' type='text' name='password' required>

            <input type='submit' value='Create Account'>
        </form>


        <form id="sign-in" class='component' v-on:submit.prevent="signIn" method="post">
          <input type="hidden" name="_csrf" value="{{ csrfToken }}">
            <h3>Sign in</h3>
            
            <label for='username'>Username:</label>
            <input id='username' v-model.trim='username' type='text' name='username' required>
            <label for='password'>Password:</label>
            <input id='password' v-model.trim='password' type='text' name='password' required>

            <input type='submit' value='Sign In'>
        </form>

        <p v-if="createError" class="errorMess">Cannot create account: {{createError}}</p>
        <p v-if="loginError" class="errorMess">Cannot log in: {{loginError}}</p>

    </div>
    
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "SignInCreateAccount",

  /**
   * Here is the Vue data used to render HTML dynamically
   */
  data() {
    return {
      createError: "",
      loginError: "",
      username: "",
      password: "",
      newUsername: "",
      newPassword: "",
      csrfToken: "",
    }
  },

  // mounted: async function(){
  //   this.csrfToken = axios.defaults.headers['csrf-token'];
  //   axios.defaults.headers['csrf-token'] = await this.getCSRF();
  // },


  methods: {
    /**
     * executes user sign in. Called when sign in button is clicked
     * uses POST to call API
     * sets error messages if needed and resets content of the form
     */
    signIn: function() {
      const bodyContent = { username: this.username, password: this.password};
        axios
          .post("/api/users/login", bodyContent)
          .then(() => {eventBus.$emit('signin-success', true);})
          .catch(err => {this.loginError = err.response.data;})
          .then(() => {
            // always executed
            this.resetForm();
            this.clearMessages();
          });
    },

    /**
     * executes user creation. Called when create button is clicked
     * uses POST to call API
     * sets error messages if needed and resets content of the form
     */
    createAccount: function() {
      const bodyContent = { username: this.newUsername, password: this.newPassword, csrfToken: this.csrfToken};
      // axios.defaults.headers['csrf-token'] = this.csrfToken;
        axios
          .post("/api/users", bodyContent)
          .then(() => {eventBus.$emit('signin-success', true);})
          .catch(err => {this.createError = err.response.data;})
          .then(() => {
            // always executed
            this.resetForm();
            this.clearMessages();
          });
    },

    /**
     * all of the input fields on the form are reset here for future use
     */
    resetForm: function() {
      this.username = "";
      this.password = "";
      this.newUsername = "";
      this.newPassword = "";
    },

    /**
     * This allows the error messages to be displayed for 5 seconds
     */
    clearMessages: function() {
      setTimeout(() => {
        this.loginError = "";
        this.createError = "";
      }, 5000);
    },


    // getCSRF: async function() {
    //     await axios.get('/api/users/csrf')
    //     .then((res) => {
    //       // this.csrfToken = res.data._csrf;
    //       this.csrfToken = "hi";
    //       return this.csrfToken;
    //     })
    //     .catch((err) => {

    //     });
    // },
  }
}

</script>

<style>
.form-group {
  width: 100%;
  display: flex;
  justify-content: space-around;
  flex-shrink: 1;
  flex-flow: row wrap;
}

label {
  align-content: left;
  text-align: left;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;

}

form {
  display:flex;
  flex-flow: column wrap;
  flex-shrink: 1;
  width: 30%;
  margin: 10%;
  margin-top: 0px;

}

input[type="text"]{
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
  border-radius: 10px;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    }

input[type="submit"]{
  width: 50%;
  justify-content: center;
  margin: auto;  
  background-color: white;
  color: black;
  border: 2px solid #e7e7e7;
  font-size: 13px;
  padding: 10px 5px;
  transition-duration: 0.4s;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;

}

input[type="submit"]:hover{
  background-color: #555555;
  color: white;
}

.errorMess{
  color:red;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}
</style>
