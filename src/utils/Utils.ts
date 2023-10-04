import type { EmailParameter } from "./Utils.d";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Notification } from "../models/Notifications";
import NotificationService from "../services/NotificationService";
import User from "../models/Users";
import crypto from "node:crypto"

// import CommodityProduct from "../models/ComProducts";
// import { CommodityProductSale } from "../models/ComProductSales";

let notification = new NotificationService();

dotenv.config();

// Interface for the notification object
interface NotificationObject {
    userId: number;
    title: string;
    message: string;
    notificationFrom: number;
    notificationType: string;
}

// Function to add a notification
export async function addNotification(notificationData: NotificationObject) {
    try {
        const { userId, title, message, notificationFrom, notificationType } =
            notificationData;
        const notification = await Notification.create({
            userId,
            title,
            message,
            readStatus: false,
            notificationFrom,
            createdAt: new Date(),
            notificationType,
        });
        return notification;
    } catch (error) {
        throw error;
    }
}

export async function generateAccountNumber(id: string | any) {
    let numOfDigit: number = String(id).length;
    if (numOfDigit === 2) {
        return numOfDigit.toString() + "COM" + (id * 100000000).toString();
    } else if (numOfDigit === 3) {
        return numOfDigit.toString() + "COM" + (id * 10000000).toString();
    } else if (numOfDigit === 4) {
        return numOfDigit.toString() + "COM" + (id * 1000000).toString();
    } else if (numOfDigit === 5) {
        return numOfDigit.toString() + "COM" + (id * 100000).toString();
    } else if (numOfDigit === 6) {
        return numOfDigit.toString() + "COM" + (id * 10000).toString();
    } else if (numOfDigit === 7) {
        return numOfDigit.toString() + "COM" + (id * 1000).toString();
    } else if (numOfDigit === 8) {
        return numOfDigit.toString() + "COM" + (id * 100).toString();
    } else if (numOfDigit === 9) {
        return numOfDigit.toString() + "COM" + (id * 10).toString();
    } else if (numOfDigit === 10) {
        return numOfDigit.toString() + "COM" + id.toString();
    } else {
        return numOfDigit.toString() + "COM" + (id * 1000000000).toString();
    }
}

export async function getIdFromAccountNumber(accountNumber: any | string) {
    let c = accountNumber.split("COM")[1];
    let numOfDigit: number = parseInt(accountNumber.split("COM")[0]);
    if (numOfDigit === 2) {
        return c / 100000000;
    } else if (numOfDigit === 3) {
        return c / 10000000;
    } else if (numOfDigit === 4) {
        return c / 1000000;
    } else if (numOfDigit === 5) {
        return c / 100000;
    } else if (numOfDigit === 6) {
        return c / 10000;
    } else if (numOfDigit === 7) {
        return c / 1000;
    } else if (numOfDigit === 8) {
        return c / 100;
    } else if (numOfDigit === 9) {
        return c / 10;
    } else if (numOfDigit === 10) {
        return c;
    } else {
        return c / 1000000000;
    }
    // return parseInt(c);
}

export async function smsConfirmationMessage() {
    let randCode = Math.floor(Math.random() * (9999 - 1000) + 10000);
    return {
        message: `Confirmation Code:${randCode}
        Thank you for accessing Mexu Commodity Service (MCS).To confirm that you the owner of this phone number, copy the confirmation code given above and paste to the field provided.`,
        code: randCode,
    };
}

export async function generateEmailHTML({
    displayRandomCode,
    body,
    heading,
    title,
}: EmailParameter) {
    let randCode = Math.floor(Math.random() * (99999 - 10000) + 100000);
    if (displayRandomCode) {
        return {
            htmlPath: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200&display=swap" rel="stylesheet">
       
            <title>MEXU|MAIL</title>
        </head>
        <body style="padding: 4px;font-family: 'Poppins', sans-serif;">
            <div>
                <h2 style="text-align: center;color:#18246b;">Email Confirmation</h2>
                <div style="height: 300px;">
                    <h3 style="text-align: center;font-family: 'Poppins', sans-serif;color:#18246b;font-weight:bold;font-size:16px;">Mexu Commodity Service (MCS)</h3>
                    <p style='text-align:center;font-family: "Poppins", sans-serif;color:#182444;letter-spacing:2px;font-size:16px;' >
                        Thank you for accessing Mexu Commodity Service.To confirm that you are owner of this email,use to confirmation code below to continue validating your account.
                    </p>
                    <h1 style="color:#18246b;text-align:center;letter-spacing:4px;">${randCode}</h1>     
                </div>
            </div>    
        </body>
        </html>`,
            code: randCode,
        };
    } else {
        return {
            htmlPath: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css?family=Bungee+Inline" rel="stylesheet">
       
            <title>MEXU|MAIL</title>
        </head>
        <body style="padding: 4px;font-family: serif">
            <div>
                <h2 style="text-align: center;color:#000;opacity:0.7">${title}</h2>
                <div style="background-color:#000;height: 300px;padding: 8px;">
                    <h3 style="color:white;text-align: center;">${heading}</h3>
                    <p style='text-align:center; font-family:serif;color:white;letter-spacing:2px;' >
                       ${body}
                    </p>     
                </div>
            </div>    
        </body>
        </html>`,
            code: null,
        };
    }
}

export async function jwtEncode(data: any) {
    let encodedData = jwt.sign(data, process.env.APP_SECRET_KEY + "");
    return encodedData;
}

export async function jwtDecode(token: string) {
    let decodedData = jwt.decode(token);
    return decodedData;
}

export async function encryptBankCardNumber(data: any) {
    let encryptedData = jwt.sign(data, process.env.APP_SECRET_KEY + "");
    return encryptedData;
}

export async function decryptBankCardNumber(token: string) {
    let decryptedData = jwt.decode(token);
    return decryptedData;
}

export async function hashData(_data: any) {
    let data = String(_data);
    let salt = await bcrypt.genSalt(10);
    let encryptedData = await bcrypt.hash(data, salt);
    return encryptedData;
}

export async function matchWithHashedData(_data: any, hashedData: string) {
    let data = String(_data);
    let isMatch = await bcrypt.compare(data, hashedData);
    return isMatch;
}

export async function getPhoneNumberCompany(
    phoneNumber: string
): Promise<"africell" | "orange" | "qcell"> {
    let code = phoneNumber.slice(0, 6);
    // console.log(code);
    let companiesCode: Record<string, string[]> = {
        africell: [
            "+23277",
            "+23233",
            "+23230",
            "+23288",
            "+23299",
            "+23270",
            "+23280",
            "+23290",
        ],
        orange: [
            "+23271",
            "+23272",
            "+23273",
            "+23274",
            "+23275",
            "+23276",
            "+23278",
            "+23279",
        ],
        qcell: ["+23231", "+23232", "+23234"],
    };
    for (let key of Object.keys(companiesCode)) {
        let codes = companiesCode[key];
        if (codes.includes(code)) {
            return key == "africell"
                ? "africell"
                : key == "qcell"
                ? "qcell"
                : "orange";
        }
    }
    return "qcell";
}

export const getResponseBody = (
    status: string,
    message?: string,
    data?: Record<string, any>
) => {
    return {
        status,
        message,
        ...data,
    };
};

export const responseStatusCode = {
    UNATHORIZED: 401,
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    DELETED: 203,
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    UNPROCESSIBLE_ENTITY: 422,
};

export const responseStatus = {
    SUCCESS: "success",
    ERROR: "error",
    UNATHORIZED: "unathorized",
    WARNING: "warning",
    UNPROCESSED: "unprocessed",
};

type TransferCommodityParams = {
    transferToAccountNumber: string;
    transferFromAccountNumber: string;
    amount: number;
};

// export const buyCommodity = async(userId:any,amount:number)=>{
//     try{
//         let commodity = await Commodity.findByPk(userId)
//         let notificationBody = `You have seccessfully bought an amount of ${amount}`;
//         let notificationTitle = 'Commodity'
//         if(commodity){
//         let newCommodity =  await commodity.increment("balance",{by:Number(amount)})
//         await Notification.create({
//                                     userId,
//                                     notificationFrom:userId,
//                                     message: notificationBody,
//                                     title: notificationTitle,
//                                     notificationType: "transaction",
//                                 });
//         await notification.sendNotification()

//     }
//     else{
//         await Commodity.create({balance:amount,userId})
//         await Notification.create({
//                                     userId,
//                                     notificationFrom:userId,
//                                     message: notificationBody,
//                                     title: notificationTitle,
//                                     notificationType: "transaction",
//                                 });
//         await notification.sendNotification()
//     }

//     }catch(err){
//         throw err
//     }

// }

export function hasPassedOneMonth(date: Date): boolean {
    const currentDate = new Date();
    const oneMonthAgo = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        currentDate.getDate()
    );
    return date < oneMonthAgo;
}

// Example usage

const SERVER_ID = process.env.SERVER_ID;

interface UserType {
    userId: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    verified?: boolean;
    verificationRank?: "low" | "medium" | "high";
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

export async function addUser(data: UserType) {
    try {
        let personal = data;
        let newPersonalInfo;
        let personalInfo = await User.create({
            ...personal,
        });
        newPersonalInfo = await personalInfo.save();
        let savePersonalData = await User.findOne({
            where: { email: personal?.email },
        });
        console.log(
            process.env.SERVER_ID,
            "User created successfully.",
            savePersonalData
        );
    } catch (err) {
        throw err;
    }
}

export async function deleteUser(data: { userId: Pick<UserType, "userId"> }) {
    try {
        let { userId } = data;
        let deleteObj = await User.destroy({
            where: { userId },
        });
        if (deleteObj > 0) {
            console.log(process.env.SERVER_ID, "User deleted successfully.");
        }
    } catch (err) {
        throw err;
    }
}

type Verification = {
    verificationData: { verified: boolean; verificationRank: string };
    userId: string;
};

export async function updateUserVerification(data: Verification) {
    try {
        let { verificationData, userId } = data;
        let personalInfo = await User.findOne({
            where: { userId },
        });
        if (personalInfo) {
            let upatedResponse = await User.update(verificationData, {
                where: { userId },
            });
            console.log(
                `Server with Id ${SERVER_ID} Row Affected:, ${upatedResponse[0]}`
            );
        } else {
            console.log("User doesnot exist.");
        }
    } catch (err) {
        throw err;
    }
}

export async function updateUser(data: {
    key: string;
    value: any;
    userId: string;
}) {
    try {
        let { key, value, userId } = data;
        let personalInfo = await User.findOne({
            where: { userId },
        });
        if (personalInfo) {
            if (key === "password") {
                personalInfo?.set(key, await hashData(value));
                let info = await personalInfo?.save();
                console.log(
                    `Server with Id ${SERVER_ID} Row Affected:, ${info}`
                );
            } else if (key === "pinCode") {
                personalInfo?.set(key, await hashData(value));
                let info = await personalInfo?.save();
                console.log(
                    `Server with Id ${SERVER_ID} Row Affected:, ${info}`
                );
            } else {
                personalInfo?.set(key, value);
                let info = await personalInfo?.save();
                console.log(
                    `Server with Id ${SERVER_ID} Row Affected:, ${info}`
                );
            }
        } else {
            console.log("User doesnot exist.");
        }
    } catch (err) {
        throw err;
    }
}



// Generate a new RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096, // You can adjust the key size as needed
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});



export class Key{
    private publicKey:string;
    private privateKey:string;
    constructor(){
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096, // You can adjust the key size as needed
            publicKeyEncoding: {
              type: 'spki',
              format: 'pem',
            },
            privateKeyEncoding: {
              type: 'pkcs8',
              format: 'pem',
            },
          });
          
        this.privateKey = privateKey;
        this.publicKey= publicKey;
    }

    /**
     * generateKeys
     */
    public async generateKeys():Promise<{publicKey:string,privateKey:string}>{
        return {publicKey:this.publicKey,privateKey:this.privateKey};
    }
}