This is school project for mobile app for pub.
DEVELOPMENT is halted and unlikely to restart.

It is react native project that was built on expo router (EXPO 52).
Installation requires(or at least heavily benefits from) previous knowledge and expertise about
react native projects and expo.

If you wish to replicate functionality, which is very time consuming here are required steps:
1. have expo dowloaded and working
2. create react native app
3. add listed files to generated app file
4. download required packages and make required changes to app.json(not listed here)
5. now you can use app by starting it with expo (f.e. npx expo start) or you can try to build it
6. when app launches go to login, if you get logged automatically go back
7. in login set user name as __dev__conf__ and login
8. choose your backend ip (third field) and return
9. app is now working and you can use it

    This assumes working backend server, more about it here
   https://github.com/AlexanderKovac1750/MTAA_backend

you can add/edit/remove dishes.
make oreders and resevations.
monitor reservation in admin.
login as guest or register.
when logged in as registered user you have access to loyalty system which gives you favourite meal slots.
loyalty system provides favourite slots that give you discount and discount points for making purchases.

list of packages
npx expo install expo-notifications expo-device expo-constants
npx expo install expo-image-picker
npx expo install @react-native-community/datetimepicker
npx expo install react-native-maps expo-location
npx expo install expo-localization
npx expo install react-i18next i18next i18next-http-backend i18next-browser-languagedetector
npx expo install expo router
npx expo install @expo/vector-icons
npm install socket.io-client
npm install react-native-animatable
npm install @react-native-async-storage/async-storage

//--maybe problematic, try only if it's needed (as last step)
npx expo install react-native-appearance
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-safe-area-context react-native-screens react-native-gesture-handler
