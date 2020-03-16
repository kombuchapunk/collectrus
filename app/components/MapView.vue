<template>
  <AbsoluteLayout width="100%" height="100%">

    <GridLayout class="mapbox">
      <!-- mapbox://styles/collectrus/ck7h3xizn0dfj1io9f0zt62j3 -->
      <Mapbox
          accessToken="pk.eyJ1IjoiY29sbGVjdHJ1cyIsImEiOiJjazdnbWc3OGQwMTZ2M2ZsbzRvOWJuN2ljIn0.WbIve4RP1m60YVdQjZC-EQ"
          mapStyle="mapbox://styles/collectrus/ck7h3xizn0dfj1io9f0zt62j3"
          hideCompass="false"
          hideLogo="true"
          :latitude="userLatitude"
          :longitude="userLongitude"
          zoomLevel="8"
          showUserLocation="true"
          disableZoom="false"
          disableRotation="false"
          disableScroll="false"
          disableTilt="false"
          @mapReady="onMapReady($event)">
      </Mapbox>
    </GridLayout>

    <GridLayout class="map-topbar">
      <StackLayout class="topbar-profile">
        <Label class="username" :text="profile.name"></Label>
        <Label class="handle" :text="'@'+profile.handle"></Label>
      </StackLayout>
    </GridLayout>

    <GridLayout class="map-toolbar-grid">
      <card-view class="map-toolbar" marginTop="140" backgroundColor="#fff" margin="10" elevation="40" radius="25">
        <FlexboxLayout class="button-row" columns="*, *, *">
          <Label v-bind:class="{ 'filter-btn food-btn selected': showFood, 'filter-btn food-btn': !showFood }" row="0" col="0" @tap="toggleFood()" text=""></Label>
          <Label v-bind:class="{ 'filter-btn clothes-btn selected': showClothes, 'filter-btn clothes-btn': !showClothes }" row="0" col="1" @tap="toggleClothes()" text=""></Label>
          <Label v-bind:class="{ 'filter-btn activities-btn selected': showActivities, 'filter-btn activities-btn': !showActivities }" row="0" col="2" @tap="toggleActivities()" text=""></Label>
        </FlexboxLayout>
      </card-view>
    </GridLayout>


  </AbsoluteLayout>
</template>

<script >
  import axios from 'axios';
  import couponsJSON from '../assets/coupons.json'
  import { mapState, mapGetters } from "vuex";
  import { MapboxMarker } from "nativescript-mapbox";
  import {isFloat, toDegrees, toRadians, recursiveConvert, pointAtDistance, pointInCircle, distanceBetween, getRandomDistance} from "../distance.js";

  export default {
    name: 'MapView',
    data() {
      return {
        coupons: [],
        textFieldValue: "",
        userLatitude: "45.523521",
        userLongitude: "-122.663811",
        markers: {},
        map: null,
        showFood: true,
        showActivities: true,
        showClothes: true
      }
    },
    computed: {...mapGetters(["profile"])},
    methods: {
      onMapReady(args) {
          let self = this;
          this.map = args.map;
          args.map.getUserLocation().then(
            function(userLocation) {
              console.log("Current user location: " +  userLocation.location.lat + ", " + userLocation.location.lng);
              console.log("Current user speed: " +  userLocation.speed);
              self.userLatitude = userLocation.location.lat;
              self.userLongitude = userLocation.location.lng;
            }
          );
          args.map.trackUser({
            mode: "FOLLOW_WITH_HEADING", // "NONE" | "FOLLOW" | "FOLLOW_WITH_HEADING" | "FOLLOW_WITH_COURSE"
            animated: true
          });

          // args.map.setTilt({
          //   tilt: 60,
          //   duration: 1000
          // });

          setTimeout(function () {
            args.map.animateCamera(
              {
                target: {
                  lat: self.userLatitude,
                  lng: self.userLongitude
                },
                tilt: 60,
                zoomLevel: 10,
                altitude: 150,
                duration: 6000
              }
            );
          }, 1000);

          args.map.addMarkers(self.markers.food);
          args.map.addMarkers(self.markers.clothes);
          args.map.addMarkers(self.markers.activities);

      },
      toggleFood() {
        let self = this;
        if (this.showFood === true) {
          this.markers.food.forEach(function(marker) {
            console.log(marker.id)
            self.map.removeMarkers(marker.id);
          });
          this.showFood = false;
        } else {
          this.map.addMarkers(this.markers.food);
          this.showFood = true;
        }
      },
      toggleActivities() {
        let self = this;
        if (this.showActivities === true) {
          this.markers.activities.forEach(function(marker) {
            console.log(marker.id)
            self.map.removeMarkers(marker.id);
          });
          this.showActivities = false;
        } else {
          this.map.addMarkers(this.markers.activities);
          this.showActivities = true;
        }
      },
      toggleClothes() {
        let self = this;
        if (this.showClothes === true) {
          this.markers.clothes.forEach(function(marker) {
            console.log(marker.id)
            self.map.removeMarkers(marker.id);
          });
          this.showClothes = false;
        } else {
          this.map.addMarkers(this.markers.clothes);
          this.showClothes = true;
        }
      }
    },
    created: function() {
      this.coupons = couponsJSON;
    },
    mounted: function() {
      let randomCoordinates = [];
      let self = this;
      let temp_markers = [];

      self.markers.clothes = [];
      self.markers.food = [];
      self.markers.activities = [];

      for (let i=0; i<this.coupons.length; i++) {
        let coords = pointAtDistance({longitude: this.userLongitude, latitude: this.userLatitude}, getRandomDistance(50, 40000));
        randomCoordinates.push(coords)
      }
      for (let i=0; i<this.coupons.length; i++) {
        let marker = {};
        marker.id = this.coupons[i].offer_id;
        marker.lat = randomCoordinates[i].latitude;
        marker.lng = randomCoordinates[i].longitude;
        marker.title = this.coupons[i].store;
        marker.subtitle = this.coupons[i].title;
        marker.selected = false;
        if (this.coupons[i].categories === "clothes") {
          marker.icon = "https://firebasestorage.googleapis.com/v0/b/collectrus-e4435.appspot.com/o/markers%2Fdiamond-2%400.75x.png?alt=media&token=6fb28971-592b-4cee-8fa2-6d1b5456c1f4";
          self.markers.clothes.push(marker);
        } else if (this.coupons[i].categories === "food") {
          marker.icon = "https://firebasestorage.googleapis.com/v0/b/collectrus-e4435.appspot.com/o/markers%2Fdiamond-1%400.75x.png?alt=media&token=64fc9f23-974a-421c-9a1f-a4681f58ac7d";
          self.markers.food.push(marker);
        } else if (this.coupons[i].categories === "activities") {
          marker.icon = "https://firebasestorage.googleapis.com/v0/b/collectrus-e4435.appspot.com/o/markers%2Fdiamond-3%400.75x.png?alt=media&token=a34b9003-f9f4-4c34-a5ff-04a3236bfa7b";
          self.markers.activities.push(marker);
        }
        console.log(marker.lng + ' ' + marker.lat)
      }

      // console.log('MARKERS 1 NUMBER: ' + self.markers[0].length)
      // console.log('MARKERS 2 NUMBER: ' + self.markers[1].length)
      // console.log('MARKERS 3 NUMBER: ' + self.markers[2].length)
    }
  }
</script>

<style scoped>

  .map-topbar {
    border-radius: 15;
    height: 120;
    width: 100%;
    margin-top: 0;
    background-image: url('~/assets/images/gradient.png');
    background-size: cover;
  }
  .topbar-profile {
    margin-top: 25;
  }
  .map-toolbar-grid {
    width: 50%;
    height: 50;
    margin-top: 95;
    margin-left: 25%;
    margin-right: 25%;
  }
  .map-toolbar {
    width: 100%;
    height: 100%;
    margin-top: 140;
  }
  .filter-btn {
    background-repeat: no-repeat;
    background-size: 40 33;
    background-position: center;
    width: 70;
    text-align: center;
    border-width: 0;
    opacity: 0.5;
  }
  .filter-btn.selected {
    opacity: 1;
  }
  .button-row {
    width: 100%;
    height: 35;
  }
  .food-btn {
    background-image: url('~/assets/images/icons/markers/2x/diamond-1@2x.png');
  }
  .clothes-btn {
    background-image: url('~/assets/images/icons/markers/2x/diamond-2@2x.png');
    border-width: 0 1 0 1;
    border-color: #1e2d7e;
  }
  .activities-btn {
    background-image: url('~/assets/images/icons/markers/2x/diamond-3@2x.png');
    background-size: 32 35;
  }
  .mapbox {
    height: 100%;
    width: 100%;
    margin-top: -100;
  }
  .marker {
    width: 5;
    height: 5;
  }
  .username {
    color: #fff;
    font-size: 26;
    text-align: center;
  }
  .handle {
    text-align: center;
    color: #00202f;
  }
</style>
