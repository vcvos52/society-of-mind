<template>
  <div id="app" class='horiz-center'>

    <div v-if="isSignedIn" class="nav">
      <input type="button" class="navButt" value="User Controls" v-on:click="displayUserControls">
      <h1>Fritter</h1>
      <input type="button" class="navButt" value="Freet Controls" v-on:click="displayFreetControls">
    </div>

    <div v-else class="header">
      <h1>Fritter</h1>
    </div>
    
    <UserSettings/>

    <div v-if="isSignedIn" class="user-display">
      <DisplayUsers/>
    </div>

    <div v-if="isSignedIn">
      <FreetControls/>
    </div>
    <div v-if="isSignedIn" class="freet-manager">
      <CreateFreetForm/>
      <FreetList/>
    </div>
  </div>
</template>

<script>
import UserSettings from "./components/UserSettings.vue";
import CreateFreetForm from "./components/CreateFreetForm.vue";
import FreetList from "./components/FreetList.vue";
import FreetControls from "./components/FreetControls.vue";
import DisplayUsers from "./components/DisplayUsers.vue";
import axios from "axios";
import { eventBus } from "./main";

export default {
  name: 'app',
  components: {
    UserSettings,
    CreateFreetForm,
    FreetList,
    FreetControls,
    DisplayUsers
  },
  
  data() {
    return{
      isSignedIn: false,
      csrfToken:''
    }
  },

  // Checks if the user is signed in on page load
  created: async function(){
    // await this.makeCSRF();

    // await this.getCSRF()
    
    // console.log(axios.defaults.headers['csrf-token']);

    //   axios.get('/api/users/isSignedIn')
    //     .then(() => {
    //         this.isSignedIn = true
    //     })
    //     .catch(() => {
    //         this.isSignedIn = false
    //     });
        

    // when sign in works, change HTML to load next part
    eventBus.$on("signin-success", () => {
      this.isSignedIn = true;
    });
    
    // when sign out works, re render sign in page
    eventBus.$on("signout-success", () => {
      this.isSignedIn = false;
    });

    // when sign out works, re render sign in page
    eventBus.$on("deletion-successful", () => {
      this.isSignedIn = false;
    });
  },

  

  methods:{


    // display drop down menu for user controls
    displayUserControls: function(){
      eventBus.$emit('display-user-controls', true);
    },

    // display drop down for freet controls
    displayFreetControls: function(){
      eventBus.$emit('display-freet-controls', true);
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}

:root{
  --main-text-color: grayscale;
}

body {
  background-color: #e9ebee;
  margin: 0px;
}

h1{
  color: grayscale;
}

h3{
  color: var(--main-text-color);
}

label{
  color: var(--main-text-color);
}

</style>

<style scoped>
.user-display{
  margin-top: 4em;
  float: left;
  overflow-y: auto;
  margin-right: auto;
}

.horiz-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.freet-manager{
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  width: 50%;
  justify-content: center;
  position: absolute;
  margin-top: 80px;
}

h1{
  margin-top: 0px;
  margin-bottom: 0px;
}

.nav{
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  background-color: rgb(255,255,255);
  margin-bottom: 0px;
  margin-left: 0px;
  border-bottom:2px solid #b2b2ab;
  position: fixed;
}

.header{
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: rgb(255,255,255);
  margin-bottom: 100px;
  margin-left: 0px;
  border-bottom:2px solid #b2b2ab;
}

input[type="button"].navButt{
  display: inline-block;
  text-align: center;
  width: 10%;
  background-color: #e9ebee;
  color: black;
  border: 2px solid #e7e7e7;
  font-size: 20px;
  padding: 10px 5px;
  transition-duration: 0.4s;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  border-bottom:2px solid #b2b2ab;
  flex-shrink: 0;
}

input[type="button"]:hover{
  background-color: #555555;
  color: white;
}
</style>
