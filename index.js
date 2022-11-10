require('dotenv').config()
require("express-async-errors");
const express = require('express');
const connectDB = require('./db/connect');
const errorHandlerMiddleware = require('./middleware/errorHandler');
const userRouter = require("./routes/user")


const app = express()

app.use(express.json())
app.use("/api/user", userRouter);
app.use(errorHandlerMiddleware)

app.get('/', (req,res) => {
    res.send('eyaaa')
})


const port = process.env.PORT || 8000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
