<template>
      <GridLayout backgroundColor="#4edcb6">
        <GridLayout class="form-content" rows="auto,*,auto,auto" >
            <StackLayout row="1" class="fields-section">
                <StackLayout>
                    <!-- <GridLayout class="username" ios:columns="auto,*" android:rows="auto, auto" verticalAlignment="top">
                        <Label col="1" colspan="1"/>
                        <Button v-show="!editable" text="Edit" class="update" @tap="toggleForm" col="0" colspan="1"/>
                    </GridLayout> -->
                    <!-- Username -->
                    <GridLayout class="username" ios:columns="auto,*" android:rows="auto, auto" verticalAlignment="top">
                        <TextField v-bind:class="{ editable: editable }" id="username" :editable="editable" v-model="origprofile.name" class="field" ios:col="1" android:row="1" tap="onTextInputTapped" />
                    </GridLayout>

                    <ScrollView class="scroll" orientation="vertical">
                      <StackLayout orientation="vertical">

                        <!-- Xarma -->
                        <GridLayout  ios:columns="auto,*" android:rows="auto, auto" verticalAlignment="top">
                            <Label class="label" text="Xarma" />
                            <Label id="xarma" :text="origprofile.xarma" class="field" ios:col="1" android:row="1"/>
                        </GridLayout >

                        <StackLayout class="line"/>

                        <!-- Friends -->
                        <GridLayout  ios:columns="auto,*" android:rows="auto, auto" verticalAlignment="top">
                            <Label class="label" text="Friends" />
                            <Label id="friends" :text="origprofile.friends.length" class="field" ios:col="1" android:row="1"/>
                        </GridLayout >

                        <StackLayout class="line"/>

                        <!-- Brands -->
                        <GridLayout  ios:columns="auto,*" android:rows="auto, auto" verticalAlignment="top">
                            <Label class="label" text="Brands" />
                            <Label id="brands" :text="origprofile.brands.length" class="field" ios:col="1" android:row="1"/>
                        </GridLayout >

                        <StackLayout class="line"/>

                        <!-- Interests -->
                        <GridLayout  ios:columns="auto,*" android:rows="auto, auto" verticalAlignment="top">
                            <Label class="label" text="Interests" />
                            <Label id="interest" :text="origprofile.tags.length" class="field" ios:col="1" android:row="1"/>
                        </GridLayout >

                        <StackLayout class="line"/>

                        <!-- Handle -->
                        <GridLayout  ios:columns="auto,*" android:rows="auto, auto" verticalAlignment="top">
                            <Label class="label" text="Handle" />
                            <TextField v-bind:class="{ editable: editable }" id="handle" :editable="editable" v-model="origprofile.handle" class="field" ios:col="1" android:row="1" tap="onTextInputTapped" />
                        </GridLayout>

                        <StackLayout class="line"/>

                        <!-- Email -->
                        <GridLayout  ios:columns="auto,*" android:rows="auto, auto" verticalAlignment="top">
                            <Label class="label" text="Email" />
                            <TextField id="email" :editable="editable" v-model="origprofile.email" class="field" ios:col="1" android:row="1" tap="onTextInputTapped"/>
                        </GridLayout >

                        <StackLayout class="line"/>

                        <!-- Bio -->
                        <StackLayout>
                            <Label class="label bio" text="Bio" />
                            <TextView v-bind:class="{ editable: editable }" id="bio" :editable="editable" v-model="origprofile.bio" android:hint="Add bio" ios:hint="Bio" class="field-multiline" tap="onTextInputTapped"/>
                        </StackLayout >

                        <StackLayout class="line"/>

                        <Button v-show="!editable" text="Edit" class="update" @tap="toggleForm" col="0" colspan="2"/>
                        <Button v-show="!editable" text="Log Out" class="update" @tap="logoutApp" col="0" colspan="2"/>

                        <StackLayout class="line"/>

                      </StackLayout>
                  </ScrollView>
                </StackLayout>
              </StackLayout>

            <GridLayout row="4" columns="*,*"  >
              <Button v-show="editable" text="Save" class="save" @tap="saveProfile" col="0"/>
              <Button v-show="editable" text="Cancel" class="cancel" @tap="saveCancel" col="1"/>
            </GridLayout>
       </GridLayout>
       <!-- Picture -->
       <Image id="image" :src="origprofile.profile_pic" class="profile-picture" v-bind:class="{'editable': editable }" @tap="onProfilePictureTapped"/>
      </GridLayout>
  </StackLayout>

</template>
<script>

import ProfilePicture from "./ProfilePicture.vue";
import Login from "./Login.vue";
import { mapState, mapGetters } from "vuex";
import firebase from "nativescript-plugin-firebase";
var LoadingIndicator = require("nativescript-loading-indicator")
  .LoadingIndicator;
var loader = new LoadingIndicator();

export default {
  name: "ProfileView",
  data() {
    return {
      editable: false,
      origprofile: {}
    };
  },
  components: { Login, ProfilePicture },
  computed: {
  },
  created() {
    this.origprofile = Object.assign({}, this.$store.state.profile);
  },
  methods: {
    logoutApp() {
      console.log('pressed')
      this.$authService.logout();
      this.$navigateTo(Login, {clearHistory: true});
    },
    toggleForm() {
      this.editable = !this.editable;
    },
    onProfilePictureTapped() {
      if (this.editable) {
        this.$navigateTo(ProfilePicture);
      }
    },
    saveCancel() {
      this.origprofile = Object.assign({}, this.$store.state.profile);
      this.editable = false;
    },
    saveProfile() {
      //in case we updated profile pic and returned to this page
      this.origprofile.profile_pic = this.$store.state.profile.profile_pic
      loader.show();
      const profDoc = firebase.firestore
        .collection("users")
        .doc(this.origprofile.id);
      profDoc
        .set(this.origprofile, { merge: true })
        .then(
          res => {
            this.$store.commit("setProfile", this.origprofile);
            this.editable = false;
            loader.hide();
            return res;
          },
          err => {
            console.error(err);
            loader.hide();
            alert("Unable to save profile, try again later!");
          }
        )
        .catch(function(error) {
          alert("Unable to save profile, try again later!");
          loader.hide();
          console.error("Error writing firestore document: ", error);
        });
    }
  }
};
</script>

<style scoped>
.profile-picture {
  width: 80;
  height: 80;
  border-radius: 40; /*
  border-width: 3;
  border-color: #fff; */
  margin-top: 16;
  vertical-align: top;
  horizontal-align: center;
  opacity: 0;
  animation-name: picture;
  animation-fill-mode: forwards;
  animation-duration: 0.6;
  animation-delay: 1;
}

.scroll {
  margin-left: 20;
}

@keyframes picture {
  from {
    opacity: 0;
    animation-timing-function: ease-in;
  }
  to {
    opacity: 1;
  }
}

.top-border {
  height: 3;
  background-color: #fff;
  margin-bottom: 40;
}

@keyframes play {
  from {
    opacity: 0.3;
    transform: scale(0.6, 0.6);
  }
  60% {
    opacity: 0.6;
    transform: scale(1.1, 1.1);
    animation-timing-function: ease-in;
  }
  to {
    opacity: 1;
    transform: scale(1, 1);
  }
}

.profile-card {
  margin-top: 20;
}

.username {
  margin-top: -10;
}

.username TextField {
  color: #00202f;
  text-align: center;
  font-size: 20;
}

.form-content {
  background-color: #fff;
  margin-top: 60;
  margin-left: 0;
  margin-right: 0;
  margin-bottom: 0;
  border-radius: 15;
  opacity: 0.6;
  transform: scale(0.8, 0.8);
  animation-name: play;
  animation-fill-mode: forwards;
  animation-duration: 0.6;
}

.fields-section {
  margin-left: 12;
  margin-right: 12;
  margin-top: 50;
}

.field-title,
.field-switch-title {
  horizontal-align: left;
  font-size: 14;
  color: #737373;
  padding: 10 0;
}

.field {
  horizontal-align: stretch;
  text-align: right;
  font-size: 14;
  color: #1e2d7e;
  padding: 10 0;
  border-width: 0;
}

Label.field {
  margin-right: 20;
}

.field-multiline {
  min-height: 60;
  font-size: 14;
  color: #1e2d7e;
  margin: 10 0;
}

.field-switch {
  vertical-align: center;
  horizontal-align: right;
  margin: 10 0;
}

.label {
  font-size: 13;
  color: #1e2d7e;
}

.label.bio {
  margin-top: 15;
}

.editable {
  background-color: #eceaea;
}
.edit-picture {
  width: 80;
  height: 80;
  border-radius: 40;
  margin-top: 16;
  vertical-align: top;
  horizontal-align: center;
  background-color: #faf9f9;
}

.line {
  background-color: #eceaea;
  height: 1;
  margin: 0;
}

.checkbox {
  width: 18;
  height: 18;
  margin: 10 10 10 0;
}

.update {
  horizontal-align: stretch;
  text-align: center;
  color: white;
  margin-left: 0;
  background-color: #00202f;
  height: 36;
}
.save {
  horizontal-align: stretch;
  text-align: center;
  color: white;
  background-color: #4edcb6;
  height: 36;
}

.cancel {
  horizontal-align: stretch;
  text-align: center;
  color: white;
  background-color: #1b1c1d;
  height: 36;
}
</style>
