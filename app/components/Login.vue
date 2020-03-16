<template>
	<Page class="page-background">
		<ScrollView>
			<FlexboxLayout class="page">
				<StackLayout v-bind:class="getClass()" >
					<StackLayout class="form">
						<Image class="logo" src="~/assets/images/logo.png" />
						<Label class="header" text="COLLECTRUS" />

						<StackLayout v-show="!isInitialized">
		          <ActivityIndicator busy="true" class="activity-indicator white-indicator"/>
		        </StackLayout>

						<StackLayout v-show="isInitialized" class="input-field" marginBottom="25">
							<TextField class="input" hint="Email" keyboardType="email" autocorrect="false" autocapitalizationType="none" v-model="user.email"
							 returnKeyType="next" @returnPress="focusPassword" fontSize="18" />
							<StackLayout class="hr-light" />
						</StackLayout>

						<StackLayout v-show="isInitialized" class="input-field" marginBottom="25">
							<TextField ref="password" class="input" hint="Password" secure="true" v-model="user.password" :returnKeyType="isLoggingIn ? 'done' : 'next'"
							 @returnPress="focusConfirmPassword" fontSize="18" />
							<StackLayout class="hr-light" />
						</StackLayout>

						<StackLayout v-show="(isInitialized && !isLoggingIn)" class="input-field">
							<TextField ref="confirmPassword" class="input" hint="Confirm password" secure="true" v-model="user.confirmPassword" returnKeyType="done"
							 fontSize="18" />
							<StackLayout class="hr-light" />
						</StackLayout>

						<Button v-show="(isLoggingIn && isInitialized)" :text="isLoggingIn ? 'Log In' : 'Sign Up'" @tap="submit" class="btn btn-primary m-t-20" />
						<Button v-show="(isLoggingIn && isInitialized)" :text="'Login with Facebook'" @tap="loginFacebook" class="fab btn fb-btn" />
						<Label v-show="(isLoggingIn && isInitialized)" text="Forgot your password?" class="login-label" @tap="forgotPassword" />
					</StackLayout>

					<Label v-show="isInitialized" class="login-label sign-up-label" @tap="toggleForm">
		        <FormattedString>
		          <Span :text="isLoggingIn ? 'Don’t have an account? ' : 'Back to Login'" />
		          <Span :text="isLoggingIn ? 'Sign up' : ''" class="bold" />
		        </FormattedString>
		      </Label>
				</StackLayout>
			</FlexboxLayout>
		</ScrollView>
	</Page>
</template>
<script>
import firebase from "nativescript-plugin-firebase";
import Main from './Main';
import { mapState } from "vuex";

var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var loader = new LoadingIndicator();
export default {
  data() {
    return {
      isLoggingIn: true,
			isInitialized: false,
      user: {
        email: "",
        password: "",
        confirmPassword: ""
      }
    };
  },
	computed: {
    ...mapState(["isLoggedIn","profile"])
	},
	mounted() {
		this.$store.dispatch("fetchProfile");
		if (this.$store.state.isLoggedIn!=null){
			this.isInitialized = true;
		} else if (this.$store.state.isLoggedIn === true) {
			this.$store.dispatch("fetchProfile");
		}
	},
	watch: {
		isLoggedIn: function(val) {
      if (!val) {
        this.isInitialized = true;
      }else {
				console.log('Jackpot')
        this.$store.dispatch("fetchProfile");
      }
		},
    profile: function(val) {
      if (!val) {
      } else{
        this.$navigateTo(Main, { clearHistory: true });
      }
    }
  },
  methods: {
    toggleForm() {
      this.isLoggingIn = !this.isLoggingIn;
    },
    submit() {
      if (!this.user.email || !this.user.password) {
        this.alert("Please provide both an email address and password.");
        return;
      }
      loader.show();
      if (this.isLoggingIn) {
        this.login();
      } else {
        this.register();
      }
    },
    login() {
			console.log(this.isLoggedIn)
			console.log(this.profile)
			this.$authService
        .login(this.user)
        .then(() => {
          loader.hide();
          this.$store.commit('setIsLoggedIn', true)
        })
        .catch(err => {
          console.error(err);
          loader.hide();
          this.alert(err);
        });
    },
		loginFacebook() {
      //loader.show();//Don't use this for facebook logins, as the popup covers the UI on IOS
      this.$authService
        .loginFacebook(this.user)
        .then(() => {
          //if (isIOS) this.isInitialized = true; //leave this up to avoid weird animation
          loader.hide();
          this.$store.commit('setIsLoggedIn', true)
        })
        .catch(err => {
          loader.hide();
          console.error(err);
          this.alert(err);
        });
    },
    register() {
			if (this.user.password != this.user.confirmPassword) {
	        loader.hide();
	        this.alert("Your passwords do not match.");
	        return;
	      }
	      if (this.user.password.length < 6) {
	        loader.hide();
	        this.alert("Your password must at least 6 characters.");
	        return;
	      }
	      var validator = require("email-validator");
	      if (!validator.validate(this.user.email)) {
	        loader.hide();
	        this.alert("Please enter a valid email address.");
	        return;
	      }
	      this.$authService
	        .register(this.user)
	        .then(() => {
	          loader.hide();
	          this.alert("Your account was successfully created.");
	          this.isLoggingIn = true;
	        })
	        .catch(err => {
	          console.error(err);
	          loader.hide();
	          this.alert(err);
	        });
    },
    forgotPassword() {
			prompt({
	        title: "Forgot Password",
	        message:
	          "Enter the email address you used to register for Collectrus to reset your password.",
	        inputType: "email",
	        defaultText: "",
	        okButtonText: "Ok",
	        cancelButtonText: "Cancel"
	      }).then(data => {
	        if (data.result) {
	          loader.show();
	          this.$authService
	            .resetPassword(data.text.trim())
	            .then(() => {
	              loader.hide();
	              this.alert(
	                "Your password was successfully reset. Please check your email for instructions on choosing a new password."
	              );
	            })
	            .catch(err => {
	              loader.hide();
	              this.alert(err);
	            });
	        }
	      });
    },
    focusPassword() {
      this.$refs.password.nativeView.focus();
    },
    focusConfirmPassword() {
      if (!this.isLoggingIn) {
        this.$refs.confirmPassword.nativeView.focus();
      }
    },
    alert(message) {
      return alert({
        title: "Collectrus",
        okButtonText: "OK",
        message: message
      });
    },
		getClass() {
		   return {
		      "container-loading": this.isInitialized,
		      "container-loaded": !this.isInitialized
		   };
		},
  }
};
</script>

<style scoped>
	.page-background {
		background-image: url('~/assets/images/10.jpg');
		background-repeat: no-repeat;
		background-position: right;
		background-size: cover;
	}
	.page {
		background-color: rgba(0,0,0,0.5);
		align-items: center;
		flex-direction: column;
	}

	.form {
		margin-left: 10;
		margin-right: 10;
		flex-grow: 2;
		vertical-align: middle;
	}

	.logo {
		margin-bottom: 0;
		height: 70;
		font-weight: bold;
		margin-top: 20;
	}

	.header {
		horizontal-align: center;
		font-size: 24;
		font-weight: 500;
		margin-bottom: 30;
		text-align: center;
		color: #fff;
	}

	.input-field {
		margin-bottom: 25;
	}

	.input {
		font-size: 18;
    width: 80%;
		placeholder-color: #A8A8A8;
    color: rgba(255,255,255,0.85);
    transition: 0.2s all;
    border-color: rgba(255,255,255,0.85);
    border-bottom-width: 2px;
	}

  .input:focus {
    border-color: #43f0dd;
    border-bottom-width: 4px;
  }

	.input-field .input {
		font-size: 54;
	}

	.btn-primary {
		height: 40;
		margin-left: 20%;
		margin-right: 20%;
		margin-top: 10;
		margin-bottom: 10;
		background-color: #4edcb6;
		border-radius: 20;
		font-size: 14;
		font-weight: 600;
    width: 60%;
    color: #022326;
	}

	.login-card {
		padding: 20;
		height: 100%;
		width: 100%;
		background-color: rgba(0,0,0,0.5);
	}

	.login-label {
		horizontal-align: center;
		color: rgba(255,255,255,0.85);
		font-size: 16;
		margin-bottom: 20;
	}

	.sign-up-label {
		margin-bottom: 20;
	}

	.bold {
		color: #43f0dd;
    font-weight: bold;
	}

	.fb-btn {
		background-color: #3b5998;
		color: #fff;
		height: 40;
		margin-left: 20%;
		margin-right: 20%;
		margin-bottom: 15;
		border-radius: 20;
		font-size: 14;
		font-weight: 600;
		width: 60%;
	}

	.activity-indicator.white-indicator {
		color: #fff;
	}

	.container-loading {
	  animation-name: loading;
	  animation-fill-mode: forwards;
	  animation-duration: 0.6;
	  animation-iteration-count: 1;
	}
	@keyframes loading {
	  0% {
	    transform: translate(0, 250);
	  }
	  100% {
	    transform: translate(0, 120);
	  }
	}
	.container-loaded {
	  animation-name: loaded;
	  animation-fill-mode: forwards;
	  animation-duration: 0.6;
	  animation-iteration-count: 1;
	}

	@keyframes loaded {
	  0% {
	    transform: translate(0, 120);
	  }
	  100% {
	    transform: translate(0, 250);
	  }
	}


</style>
