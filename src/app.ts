import "dotenv/config";
import mongoose from "mongoose";
import { app } from "./server";

const port = 3000;

mongoose.connect(process.env.DB_CONN!).then(
  () =>
    app.listen(port, () =>
      console.log(`Whispering is running at port ${port}`)
    ),
  (e) => console.error(e.message)
);
