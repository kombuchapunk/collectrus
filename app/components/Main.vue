<template>
    <Page>
        <ActionBar android:flat="true" flat="true">
            <StackLayout orientation="horizontal">
                <Label :text="currentLabel" fontSize="20" verticalAlignment="center" />
            </StackLayout>
        </ActionBar>
        <TabView
                 :selectedIndex="selectedIndex"
                 @selectedIndexChange="indexChange"
                 android:tabBackgroundColor="#00202f"
                 android:tabTextColor="#4edcb6"
                 android:selectedTabTextColor="#4edcb6"
                 androidSelectedTabHighlightColor="#4edcb6"
                 tabBackgroundColor="#00202f"
                 tabTextColor="#4edcb6"
                 iosIconRenderingMode=""
                 selectedTabHighlightColor="#4edcb6"
                 selectedTabTextColor="#4edcb6"
                 flat="true"
                 >
            <TabViewItem class="tab-icon" title="" iconSource="~/assets/images/icons/wallet.png">
                <WalletView></WalletView>
            </TabViewItem>
            <TabViewItem class="tab-icon" title="" iconSource="~/assets/images/icons/map.png">
                <MapView></MapView>
            </TabViewItem>
            <TabViewItem class="tab-icon" title="" iconSource="~/assets/images/icons/profile.png">
                <ProfileView></ProfileView>
            </TabViewItem>
        </TabView>
        <!-- <BottomNavigation
            :selectedIndex="selectedIndex"
            @selectedIndexChange="indexChange"
            class="tab-menu">
            <TabStrip>
                <TabStripItem class="tab-item">
                    <Label class="tab-label" text="Wallet"></Label>
                    <Image class="tab-icon" src="~/assets/images/icons/wallet.png"></Image>
                </TabStripItem>
                <TabStripItem class="tab-item">
                    <Label class="tab-label" text="Map"></Label>
                    <Image class="tab-icon" src="~/assets/images/icons/map.png"></Image>
                </TabStripItem>
                <TabStripItem class="tab-item">
                    <Label class="tab-label" text="Profile"></Label>
                    <Image class="tab-icon" src="~/assets/images/icons/profile.png"></Image>
                </TabStripItem>
            </TabStrip>

            <TabContentItem>
                <GridLayout>
                    <Label text="Wallet"></Label>
                </GridLayout>
            </TabContentItem>

            <TabContentItem>
                <MapView></MapView>
            </TabContentItem>

            <TabContentItem>
                <ProfileView></ProfileView>
            </TabContentItem>
        </BottomNavigation> -->
    </Page>
</template>

<script >
  import WalletView from './WalletView';
  import MapView from './MapView';
  import ProfileView from './ProfileView';
  import Login from './Login';
  import { mapState } from "vuex";

  export default {
    data() {
      return {
        selectedIndex: 1
      }
    },
    components: {
      MapView: MapView,
      ProfileView: ProfileView,
      WalletView: WalletView,
      Login: Login
    },
    computed: {
      ...mapState(["isLoggedIn"])
  	},
    watch: {
      isLoggedIn: function(val) {
        if (!val) {
          this.$navigateTo(Login, { clearHistory: true });
        }
      }
    },
    methods: {
      indexChange: function(args) {
        console.log('INDEX CHANGE ' + args.value)
        let newIndex = args.value
        this.selectedIndex = newIndex
        console.log('SELECTED CHANGE ' + this.selectedIndex)
        console.log('LABEL ' + this.currentLabel)
      }
    },
    computed: {
      currentLabel: function () {
        switch (this.selectedIndex) {
          case 0:
            return 'Wallet'
            break;
          case 1:
            return 'Map'
            break;
          case 2:
            return 'Profile'
            break
          default:
            return ''
            break
        }
      }
    }
  }
</script>

<style scoped>

    ActionBar {
        background-color: #4edcb6;
        color: #fff;
    }

    .message {
        vertical-align: center;
        text-align: center;
        font-size: 20;
        color: #333;
    }

</style>
