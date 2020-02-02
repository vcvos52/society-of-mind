<template>
  <div v-bind:class="{topBannerForDropDownLeft : isSignedIn}">
    <div v-if="isSignedIn && displayUserSettings" class="user-settings-drop-down">
        <h3>User Controls</h3>
        <ChangeUsernamePassword/>
        <SignOutDeleteAccount/> 
    </div>

    <div v-if="!isSignedIn" id="user-settings">
        <div class="input-fields">
        <SignInCreateAccount/>
        </div>
    </div>

    <div v-if='deleted' class="success-message">
    {{ deleted }}
    </div>
  </div>
</template>

<script>
import axios from "axios";
import SignInCreateAccount from "./SignInCreateAccount.vue";
import SignOutDeleteAccount from "./SignOutDeleteAccount.vue";
import ChangeUsernamePassword from "./ChangeUsernamePassword";
import { eventBus } from "../main";

export default {
  name: "UserSettings",

  components: {
    SignInCreateAccount,
    SignOutDeleteAccount,
    ChangeUsernamePassword
  },

  data() {
    return {
      isSignedIn: false,
      deleted: "",
      displayUserSettings: false,
      csrf: this.csrfToken
    };
  },



  created: function() {   
    
    /**
     * Checks if the user is currently signed in
     * This decided what HTML elements to render
     */
    axios.get('/api/users/isSignedIn')
        .then(() => {
            this.isSignedIn = true;
        })
        .catch(res => {
            this.isSignedIn = false;
        });

    // Changes sign in status on success
    eventBus.$on("signin-success", () => {
        this.isSignedIn = true;
    });

    // renders or hides user controls
    eventBus.$on('display-user-controls', () => {
        if (this.displayUserSettings){
            this.displayUserSettings = false;
        } else {this.displayUserSettings = true}
    });
    
    // signs you out
    eventBus.$on("signout-success", () => {
        this.isSignedIn = false;
    });

    // signs you out of account on deletion
    eventBus.$on("deletion-successful", () => {
        this.deleted = "You have successfully deleted your account, and have been Logged out";
        this.isSignedIn = false;
        this.clearMessages();
    });
  }, 

  methods: {
    clearMessages: function() {
        setInterval(() => {
            this.deleted = "";
        }, 5000);
    }
  }
};

</script>

<style scoped>

.topBannerForDropDownLeft{
    margin-top: 40px;
    width:12%;
    display: flex;
    flex-flow: column wrap;
    left: 0px;
    position: fixed;
}

.user-settings-drop-down{
    width: 100%;
    margin-left:40px;
    background-color: lightgrey;
    padding: 20px;
}

#user-settings {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  background-color: rgb(255, 255, 255);
  width: 800px;
  justify-content: center;
  flex-shrink: 1;
}

#user-settings > * {
  margin: 0.5rem;
flex-shrink: 1;

}

.input-fields{
    width: 30%;
    height:100%;
    margin: 0%;
    padding: 0%;
    flex: 1 1 auto;
}
</style>