import Vue from 'nativescript-vue'
import Main from './components/Main'
import Login from './components/Login'
import { Mapbox } from 'nativescript-mapbox'
import BackendService from './services/BackendService'
import AuthService from './services/AuthService'

//shared among components
export const backendService = new BackendService()
export const authService = new AuthService()

import store from './store'

Vue.prototype.$authService = authService
Vue.prototype.$backendService = backendService

Vue.prototype.$store = store

// import VueDevtools from 'nativescript-vue-devtools'

if(TNS_ENV !== 'production') {
  // Vue.use(VueDevtools)
}

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

const timerModule = require("tns-core-modules/timer")

var firebase = require("nativescript-plugin-firebase");

firebase
  .init({
    onAuthStateChanged: data => {
        console.log((data.loggedIn ? "Logged in to firebase" : "Logged out from firebase") + " (firebase.init() onAuthStateChanged callback)");
        if (data.loggedIn) {
          backendService.token = data.user.uid
          console.log("uID: " + data.user.uid)
          store.commit('setIsLoggedIn', true)
        }
        else {
          store.commit('setIsLoggedIn', false)
        }
    }
  })
  .then(
    function(instance) {
      console.log("firebase.init done");
    },
    function(error) {
      console.log("firebase.init error: " + error);
    }
);

Vue.registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);

Vue.registerElement(
  'CardView',
  () => require('@nstudio/nativescript-cardview').CardView
);

new Vue({
  store,
  render: h => h('frame', [h(Login)])
}).$start()
