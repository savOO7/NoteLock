require("dotenv").config();
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const path = require("path")


connectToMongo();
const app = express()
const port = 5000

app.use(express.json());
app.use(cors())
//available routes
app.use('/api/auth',require('./routes/auth'));
app.use('/api/notes',require('./routes/notes'))

app.use("/",express.static(path.join("./public/build")));
// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })


app.listen(port, () => {
  console.log(`inotebook app listening on port ${port}`)
})