import express from "express";
import dotenv from "dotenv";
import authorizeApiAccess from "./middlewares/ApiAccess";
import AuthController from "./controllers/AuthController";
// import MailController from "./controllers/MailController";
import NotificationController from "./controllers/NotificationController";
import CORS from "cors";
import { runUserConsumer } from "./events/consumers";

dotenv.config();

const PORT = process.env.PORT;
const app: express.Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(authorizeApiAccess);
app.use(CORS());

AuthController(app);
// MailController(app);
NotificationController(app);

// runUserConsumer().then(()=>{
//     console.log("Consumer Running")
// }).catch(err =>{
//     console.log("Consumer Error =>",err)
// })

app.get("/", (request: express.Request, response: express.Response) => {
    response.status(200).json({
        message: "Getting started with Commodity",
    });
});

app.listen(PORT, () => {
    console.log("Listening to port ", PORT);
});
