import firebase from "nativescript-plugin-firebase";
import store from "../store";

export default {
  getProfile() {
    firebase.getCurrentUser().then(function(currentuser) {
      firebase.firestore.getDocument("users", currentuser.uid).then(docdata => {
        var userdata = {};
        userdata.id = currentuser.uid;
        if (docdata.exists) {
          var userData = docdata.data();
          userdata.name = userData.name;
          userdata.bio = userData.bio;
          userdata.profile_pic = userData.profile_pic;
          userdata.handle = userData.handle;
          userdata.xarma = userData.xarma;
          userdata.friends = userData.friends;
          userdata.brands = userData.brands;
          userdata.tags = userData.tags;
        } else {
          if (currentuser.photoURL) {
            userdata.profile_pic = currentuser.photoURL;
          } else {
            userdata.profile_pic = "";
          }
          if (currentuser.displayName) {
            userdata.name = currentuser.displayName;
          } else {
            userdata.name = "";
          }
          if (currentuser.email) {
            userdata.email = currentuser.email;
          } else {
            userdata.email = "";
          }
          userdata.bio = "";
          userdata.handle = "";
          userdata.xarma = 0;
          userdata.friends = [];
          userdata.brands = [];
          userdata.tags = [];
          firebase.firestore.set("users", currentuser.uid, {
            name: userdata.name,
            email: userdata.email,
            handle: userdata.handle,
            profile_pic: userdata.profile_pic,
            bio: userdata.bio,
            xarma: userdata.xarma,
            friends: userdata.friends,
            brands: userdata.brands,
            tags: userdata.tags
          });

        }
        store.commit("setProfile", userdata);
      });
    });
  }
};
