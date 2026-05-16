import app from "./src/app.js";
import mongoose from "mongoose";
import connectDB from "./src/config/database.js";

connectDB();
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
