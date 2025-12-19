import express from "express";
import tseRouter from './backend/api/tseRouter.js';

console.log("tseRouter type:", typeof tseRouter);
console.log("tseRouter has stack:", tseRouter && tseRouter.stack ? true : false);

const app = express();
app.use('/api/tse', tseRouter);

app.get("/api/tse/test", (req, res) => {
  res.send("TSE Router is working!");
});

app.listen(3001, () => {
  console.log("Test server running on http://localhost:3001");
});
