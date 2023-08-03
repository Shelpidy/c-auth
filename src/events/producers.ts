import { Kafka,Producer } from "kafkajs";

import dotenv from "dotenv"

dotenv.config()

let BROKER_1 = process.env.BROKER_1||''
let BROKER_2 = process.env.BROKER_2||''
let BROKER_3 = process.env.BROKER_3||''


let kafka:Kafka = new Kafka({
    brokers:[BROKER_1,BROKER_2],
    clientId:process.env.SERVER_ID
})

let producer:Producer = kafka.producer({
    
})

type TransferCommodityParams = {
    senderAddress: string;
    recipientAddress: string;
    amount: number;
    date:Date
};

export async function runNotificationProducer(value:TransferCommodityParams){
    try{
        await producer.connect()
        producer.send({
            topic:"ADD_NOTIFICATION",
            messages:[{value:JSON.stringify({...value,serverId:process.env.SERVER_ID})}]
        })
        await producer.disconnect()

    }catch(err){
        console.log(err)
    }

}

export async function runDeleteUserProducer(value:{userId:string}){
    try{
        await producer.connect()
        producer.send({
            topic:"DELETE_USER",
            messages:[{value:JSON.stringify({...value,serverId:process.env.SERVER_ID})}]
        })
        await producer.disconnect()

    }catch(err){
        console.log(err)
    }

}


export async function runUpdateUserProducer(value:{userId:string,key:string,value:any}){
    try{
        await producer.connect()
        producer.send({
            topic:"UPDATE_USER",
            messages:[{value:JSON.stringify({...value,serverId:process.env.SERVER_ID})}]
        })
        await producer.disconnect()

    }catch(err){
        console.log(err)
    }

}

interface UserType {
    userId: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    profileImage?: string;
    password?: string;
    pinCode?: string;
    gender?: string;
    accountNumber?: string | null;
    dob?: string;
    email: string;
    createdAt: Date;
    updatedAt?: Date;
  }

export async function runCreateUserProducer(value:UserType){
    try{
        await producer.connect()
        producer.send({
            topic:"CREATE_USER",
            messages:[{value:JSON.stringify({...value,serverId:process.env.SERVER_ID})}]
        })
        await producer.disconnect()

    }catch(err){
        console.log(err)
    }

}


