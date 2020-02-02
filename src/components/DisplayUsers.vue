<template>
    <div class="user-list">  
    All Users: <br>
      <div v-if="users.length">
        <User
        v-for="user in users"
        v-bind:key="user.name"
        v-bind:user="user"
        />
      </div>

      <div v-else>
        <p>There are no users to display.</p>
      </div>
    </div>
</template>

<script>

import axios from "axios";
import User from "./User";

import { eventBus } from "../main";

export default {
    name: "DisplayUsers",

    components: { 
      User
    },

    data() {
        return{
            users: [],
        }
    },

    created: function(){

        this.loadUsers();
    },

    methods: {

        // Loads all user except the current logged in user
        loadUsers: function(){
            axios.get(`/api/users`, {})
                .then(res => this.users = res.data)
                .catch();
        }
    }
}

</script>

<style scoped>
    .user-list{
        background-color: aqua;
    }
</style>
