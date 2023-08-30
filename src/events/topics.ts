import { Kafka, Admin, KafkaConfig, ITopicConfig } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const BROKER_1 = process.env.BROKER_1 ?? "";
const BROKER_2 = process.env.BROKER_2 ?? "";

const kafkaConfig: KafkaConfig = {
    brokers: [BROKER_1,BROKER_2],
    clientId: process.env.SERVER_ID,
};

const kafka = new Kafka(kafkaConfig);
const admin: Admin = kafka.admin();


async function createTopics() {
    try {
        await admin.connect();
        console.log("Creating topics...");

        const topicConfigs: ITopicConfig[] = [
            {
                topic: "ADD_USER",
                numPartitions: 1,
            },
            {
                topic: "DELETE_USER",
                numPartitions: 1,
            },
            {
                topic: "UPDATE_USER",
                numPartitions: 1,
            },
            {
                topic: "UPDATE_USER_VERIFICATION",
                numPartitions: 1,
            },
            {
                topic: "ADD_NOTIFICATION",
                numPartitions: 1,
            },
            {
                topic: "TRANSFER_COMMODITY",
                numPartitions: 1,
            },
            {
                topic: "BUY_COMMODITY",
                numPartitions: 1,
            },
            {
                topic: "BUY_PRODUCT",
                numPartitions: 1,
            },
            {
                topic: "DELETE_TRANSACTION",
                numPartitions: 1,
            },
            // Add other topic configurations here
        ];

        await admin.createTopics({
            topics: topicConfigs,
        });

        console.log("Topics created!!");
        await admin.disconnect();
    } catch (err) {
        console.error("Error creating topics:", err);
    }
}

createTopics().catch((err) => {
    console.error("Error in creating topics:", err);
});
