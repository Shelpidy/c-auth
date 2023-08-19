import { Kafka, Producer } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const BROKER_1 = process.env.BROKER_1 || "";
const BROKER_2 = process.env.BROKER_2 || "";
const SERVER_ID = process.env.SERVER_ID || "";

const kafka: Kafka = new Kafka({
    brokers: [BROKER_1, BROKER_2],
    clientId: SERVER_ID,
});

// Create a reusable producer
const producer: Producer = kafka.producer();

// Function to send messages to a topic
async function sendTopicMessage(topic: string, data: any) {
    try {
        await producer.connect();
        await producer.send({
            topic,
            messages: [
                { value: JSON.stringify({ serverId: SERVER_ID, ...data }) },
            ],
        });
        await producer.disconnect();
    } catch (err) {
        console.error(`Failed to send message to topic ${topic}:`, err);
    }
}

// Producer function for ADD_USER topic
export async function addUserProducer(data: Record<string, any>) {
    await sendTopicMessage("ADD_USER", data);
}

// Producer function for DELETE_USER topic
export async function deleteUserProducer(data: { userId: number }) {
    await sendTopicMessage("DELETE_USER", data);
}

// Producer function for UPDATE_USER topic
export async function updateUserProducer(data: Record<string, any>) {
    await sendTopicMessage("UPDATE_USER", data);
}
