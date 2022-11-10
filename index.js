require('dotenv').config()
const express = require('express');
const connectDB = require('./db/connect');
const userRouter = require("./routes/user")

const app = express()

app.use(express.json())
app.use("/api/user", userRouter);

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
