import { Kafka, Consumer } from "kafkajs";
import dotenv from "dotenv";
import { addNotification } from "../src/utils/Utils";

dotenv.config();
const BROKER_1 = process.env.BROKER_1 ||"";
const BROKER_2 = process.env.BROKER_2 ||"";
const BROKER_3 = process.env.BROKER_3 ||"";
const SERVER_ID = process.env.SERVER_ID ||"";

const kafka: Kafka = new Kafka({
  brokers: [BROKER_1,BROKER_2],
  clientId: SERVER_ID,
});

export async function runConsumer() {
  try {
    const consumer: Consumer = kafka.consumer({ groupId: SERVER_ID });
    console.log("Connecting consumer...");
    await consumer.connect();
    console.log("Subscribing to topics...");
    await consumer.subscribe({
      topics: ["ADD_NOTIFICATION"],
      fromBeginning: true,
    });

    // console.log("Successfully subscribed to topics!");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const { serverId, ...data } = JSON.parse(message.value?.toString() || "{}");
        console.log("Data from producer", { topic, partition,data,serverId });
        if (serverId === SERVER_ID) {
          // Do nothing if the message originated from this server
        } else {
          switch (topic) {
            case "ADD_NOTIFICATION":
              await addNotification(data)
              break;
            default:
              // Handle other topics if necessary
              break;
          }
        }
      },
    });
  } catch (err) {
    console.error("Failed to run commodity consumer or failed to add notification:", err);
  }
}
