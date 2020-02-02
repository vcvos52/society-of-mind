<template>
  <div>
    <h3>All Freets</h3>
    <div v-if='success' class="success-message">
      {{ success }}
    </div>
    <div v-if='error' class="error-message">
      {{ error }}
    </div>

    <input v-if="sortByOrder" type="submit" id="ordering" value="Sort by Time" v-on:click="unSort()">
    <input v-else type="submit" id="ordering" value="Sort by votes" v-on:click="orderFreets()">


    <div class="short-list">  

      <div v-if="freets.length">
        <Freet
        v-for="freet in freets"
        v-bind:key="freet.id"
        v-bind:freet="freet"
        />
      </div>

      <div v-else>
        <p>There are no freets to display. Create one today!</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Freet from "./Freet";

import { eventBus } from "../main";

export default {
  name: "FreetList",

  components: { 
      Freet
   },

  data() {
    return {
      error: "",
      success: "",
      freets: [],
      content: "",
      id: "",
      displayUser: false,
      userToDisplay: "",
      displayFreetControls: false,
      sortByOrder: false,
      displayFollowers: false,
    };
  },

  created: function() {

    this.loadFreets();

    /**
     * These on event listeners are used to set messages,
     * display different parts of the HTML, and to reload freets
     */

    eventBus.$on("display-user-only", res => {
        this.displayUser = true;
        this.userToDisplay = res;
        this.loadFreets();
    });

    eventBus.$on("display-all-freets", res => {
        this.displayFollowers = false;
        this.displayUser = false;
        this.userToDisplay = "";
        this.loadFreets();
    });

    eventBus.$on("display-followers-only", res => {
        this.displayFollowers = true;
        this.loadFreets();
    });

    eventBus.$on("display-freet-controls", res => {
      if (this.displayFreetControls){
        this.displayFreetControls = false;
      } else {this.displayFreetControls = true}
    });

    eventBus.$on("reload", res => {
      this.loadFreets();
    });

    eventBus.$on("create-freet-success", res => {
        this.freets.push(res.data);
    });

    eventBus.$on("update-freet-success", res => {
        this.loadFreets();
    });

    eventBus.$on("vote-freet-success", res => {
        this.loadFreets();
    });

    eventBus.$on("delete-freet-success", res => {
        this.loadFreets();
    });

    eventBus.$on("vote-freet-error", res => {
        this.error = `Error voting freet ${res}`;
        this.clearMessages();    
    });

    eventBus.$on("delete-freet-error", res => {
        this.error = `Error deleting freet ${res}`;
        this.clearMessages();
        this.loadFreets();
    });
  },

  methods: {

    /**
     * Ordering the freets by decreasing order.
     */
    orderFreets: function(){
      this.freets.sort(function(a, b) {
        return b.votes - a.votes;
      });
      this.sortByOrder = true;
    },

    /**
     * Gives the user the ability to unsort the freets
     */
    unSort: function(){
      this.sortByOrder = false;
      this.loadFreets();
    },

    /**
     * Reloads the freets
     * This is used to make sure changes to the freets are rendered
     */
    loadFreets: function() {
        // only display single user freets
        if (this.displayUser){
            axios.get(`/api/users/${this.userToDisplay}/freets`, {})
                .then(res => {this.freets = res.data})
                .catch(err => {this.error = `Error loading user's freets: ${err}`});
            this.clearMessages();
            // shorts the freet if need be
            if (this.sortByOrder){this.orderFreets()}
            return;
        } else if (this.displayFollowers){
            axios.get('/api/users/followers')
                  .then(res => {this.freets = res.data})
                  .catch(err => {this.error = `Error loading followers' freets: ${err}`});
              this.clearMessages();
              // shorts the freet if need be
              if (this.sortByOrder){this.orderFreets()}
              return;
        }
        axios.get("/api/freets").then(response => {
            this.freets = response.data;
            // shorts freets if needed
            if (this.sortByOrder){this.orderFreets()}
      });
    },

    clearMessages: function() {
      setTimeout(() => {
        this.success = "";
        this.error = "";
      }, 5000);
    },
}
};
</script>

<style scoped>
.short-list {
  display: flex;
  flex-wrap: wrap;
}

.short-list > * {
  margin: 0.5rem;
}

.topBannerForDropDownRight{
    margin-top: 40px;
    width:12%;
    display: flex;
    flex-flow: column wrap;
    right: 0px;
    position: absolute;
}
</style>
