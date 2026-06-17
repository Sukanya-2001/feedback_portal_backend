// //Application Level Middleware
// app.use((req,res,next)) {
//     console.log("Application Middleware");
//     next();
// }

// //Route Level Middleware
// const auth = (req,res,next) => {
//     console.log("Route Level Middleware");
//     next();
// }

// app.get("/profile", auth, (req,res) => {
//     res.send('Profile');
// })

// //Build-in Middleware
// app.use(express.json());

// //Third party Middelware
// const cors = require('cors');
// app.use(cors());
