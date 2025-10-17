// seed data used by UI
const products = [
  { id:1, name:"Handmade Mask", price:50, category:"Home", location:"Gangtok" },
  { id:2, name:"Organic Honey", price:250, category:"Grocery", location:"Singtam" },
  { id:3, name:"Tailor Shirt", price:600, category:"Clothing", location:"Gangtok" },
  { id:4, name:"Phone Charger", price:299, category:"Electronics", location:"Singtam" },
  { id:5, name:"Paint brush", price:20, category:"paint", location:"Singtam" }
];

const workers = [
  { name: "Ramesh", skills: ["Tailor","Delivery"], location: "Singtam" },
  { name: "Sita", skills: ["Sales","Tutor"], location: "Gangtok" },
  { name: "Amit", skills: ["Electrician","Delivery"], location: "Singtam" },
  { name: "Priya", skills: ["Tailor","Crafts"], location: "Gangtok" }
];

// jobs saved in localStorage; start empty
let jobs = JSON.parse(localStorage.getItem('jobs')) || [];


let messages = [
  // Example
  // { from: "Ramesh", to: "Shop Owner", job: "Tailor", text: "Is this job still available?" }
];
