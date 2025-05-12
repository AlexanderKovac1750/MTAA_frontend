import { post } from "axios";
import MainMenu from "../screens/main_menu";

export default {
  login: {
    title: 'Login',
    anonymous: 'Anonymous mode',
    register: 'Register',
    appName: 'At the Blind Eagle',
    name: 'Name',
    password: 'Password',
    rememberMe: 'Remember me',
    loginButton: 'Log in',
    loginFailed: 'Login failed',
    connectionFailed: 'Connection failed',
    offlineModeMessage: 'Using offline mode, limited functionality...'
  },
  account: {
    pubName: "U slepého orla",
    login: "Login",
    register: "Register",
    anonymous: "Anonymous mode",
    discount: "Discount",
    logout: "Logout",
    darkMode: "Dark mode",
    language: "Language",
    accessibility: "Accessibility",
    fontSize: "Font size",
    highContrast: "High contrast",
    setting1: "Setting 1",
    setting2: "Setting 2",
    setting3: "Setting 3",
    changePassword: "Change Password",
    myReservations: "My Reservations",
    save: "Save changes"
  },
  changePassword: {
    title: 'Change Password',
    old: 'Old Password',
    new: 'New Password',
    confirm: 'Confirm New Password',
    save: 'Change Password',
    success: 'Password successfully changed.',
    errorMismatch: 'New passwords do not match.',
    errorEmpty: 'Please fill in all required fields.',
    errorAnon: 'Anonymous users cannot change password.',
    errorServer: 'Failed to connect to server.',
    errorUnknown: 'Failed to change password.',
    saving: 'Saving...',
  },
  MainMenu:{
    today_special: "Today's Special",
    categories: "Categories",
    your_space: "Your Space",
    menu: "Menu",
    search: "Search",
    admin_only: "Admin only",
    unauthorized: "Unauthorized access"
  },
  DeliveryScreen: {
    delivery: "Delivery",
    reservation: "Reservation",
    street: "Street",
    number: "Number",
    postal_code: "Postal Code",
    order_now: "Order Now",
    comment: "Comment",
    date: "Choose Date",
    time_from: "time from",
    time_to: "time until",
    pay: "Pay",
    number_of_people: "Number of Guests",
    track_order: "Track Order",
    delivery_time: "Estimated Delivery Time",
    address: "Delivery Address",
    change_address: "Change Address",
    delivery_options: "Delivery Options or Reservation",
    cancel: "Cancel Order",
    status_preparing: "Preparing your order...",
    status_out_for_delivery: "Out for delivery",
    status_delivered: "Delivered",
    error_invalid_address: "Please enter a valid address.",
    error_no_connection: "No connection. Please try again.",
    success_confirmed: "Your delivery has been confirmed.",
    success_cancelled: "Your delivery has been cancelled."
  },
    LoyalityScreen: {
    title: "Loyalty Program",
    points: "Points",
    rewards: "Rewards",
    discount: "Discount",
    currentDiscount: "Current Discount",
    loginButton: "Login"
  }
  

};
