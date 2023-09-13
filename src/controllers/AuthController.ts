import {
    encryptBankCardNumber,
    generateAccountNumber,
    generateEmailHTML,
    getPhoneNumberCompany,
    hashData,
    jwtEncode,
    matchWithHashedData,
    responseStatus,
    responseStatusCode,
    smsConfirmationMessage,
} from "../utils/Utils";
import express from "express";
import User from "../models/Users";
import { Contact } from "../models/Contacts";
import MailService from "../services/MailService";
import { BankCardDetail } from "../models/BankCardDetails";
import { Transferee } from "../models/Transferees";
import SMS from "../services/SMS";
import { NotificationDetail } from "../models/NotificationDetails";
import { runCreateUserProducer } from "../events/producers";
import { Sequelize } from "sequelize";
import sequelize from "../database/connection";
import axios from "axios";
import NotificationService from "../services/NotificationService";

type NotificationData = {
    token: string;
    body: string;
    title: string;
    data: {
        url: string;
    };
};

let notification = new NotificationService()
// importFollower from "../models/ComFollowers";
// import {ProductSale } from "../models/ComProductSales";
// import {ProductAffiliate } from "../models/ComProductAffiliates";

export default (router: express.Application) => {
    /////////////////////////////////////////////////USERS ROUTES///////////////////////////////////////////////

    ///////// CREATE USER

    router.post(
        "/auth/users/",
        async (request: express.Request, response: express.Response) => {
            try {
                let data = request.body;
                let { personal, contact } = data;
                let email = personal?.email;
                let password = await hashData(personal.password);
                let pinCode = await hashData(personal.pinCode);
                let newPersonalInfo;
                let newContactInfo;
                let personalInfo = await User.create({
                    ...personal,
                    password,
                    pinCode,
                });
                let contactInfo = await Contact.create({
                    ...contact,
                    userId: personalInfo.getDataValue("userId"),
                });
                try {
                    newPersonalInfo = await personalInfo.save();
                    newContactInfo = await contactInfo.save();
                    let savePersonalData = await User.findOne({
                        where: { email },
                    });
                    if (savePersonalData) {
                        let usersCount = await User.count();
                        let accountNumber = await generateAccountNumber(
                            usersCount
                        );
                        console.log(accountNumber);
                        savePersonalData.set("accountNumber", accountNumber);
                        newPersonalInfo = await savePersonalData.save();
                        await runCreateUserProducer(newPersonalInfo.dataValues);
                    }
                } catch (err) {
                    await personalInfo.reload();
                    await contactInfo.reload();
                    console.log(err);

                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: "Failed to create a user",
                        });
                    return;
                }
                response.status(responseStatusCode.CREATED).json({
                    status: responseStatus.SUCCESS,
                    message: "User created successfully",
                    data: { newPersonalInfo, newContactInfo },
                });
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    /// GET ALL USERS PERSONAL INFO ONLY
    router.get(
        "/auth/users/",
        async (request: express.Request, response: express.Response) => {
            try {
                let users = await User.findAll();
                console.log(users);
                response.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    data: users.map((user) => {
                        return {
                            ...user.dataValues,
                            fullName: user.getFullname(),
                        };
                    }),
                });
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    /// GET ONE USER ,BY ID, DETAILS, INCLUDING PERSONAL,CONTACT,SALES,FOLLOWERS,FOLLOWING

    router.get(
        "/auth/users/:userId",
        async (request: express.Request, response: express.Response) => {
            try {
                let userId = request.params.userId;
                let personal = await User.findOne({
                    where: { userId },
                });
                let contact = await Contact.findOne({
                    where: { userId },
                });
                let { data, status: blogReponseStatus } = await axios.get(
                    `http://192.168.1.98:6000/follows/proxy/f-f/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${response.locals.token}`,
                        },
                    }
                );

                let { data: statusData, status: chatResponseStatus } =
                    await axios.get(
                        `http://192.168.1.98:8080/user-status/proxy/${userId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${response.locals.token}`,
                            },
                        }
                    );
                console.log(statusData)
                let lastSeenStatus =
                    (statusData.data?.online ? "online" : statusData.data?.lastSeen) ??
                    "";

                console.log("Fetched data from blog", data);
                let { followings, followers, totalLikes, totalPosts } =
                    data.data;

                if (!personal) {
                    response.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message: `User with ${userId} does not exists.`,
                    });
                    return;
                }
                console.log({ data: personal, contact,statusData });
                response.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    data: {
                        personal: {
                            ...personal.dataValues,
                            fullName: personal.getFullname(),
                            lastSeenStatus: lastSeenStatus,
                        },
                        contact: contact?.dataValues,
                        followers: {
                            ...followers,
                            rows: followers.rows.map(
                                (follower: any) => follower.dataValues
                            ),
                        },
                        followings: {
                            ...followings,
                            rows: followings.rows.map(
                                (following: any) => following.dataValues
                            ),
                        },
                        totalLikes,
                        totalPosts,
                    },
                });
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    //////////// UPDATE USER PERSONAL INFO ///////////////

    router.put(
        "/auth/users/:userId/personal/",
        async (request: express.Request, response: express.Response) => {
            try {
                let { key, value } = request.body;
                let { userId } = request.query;
                let personalInfo = await User.findOne({
                    where: { userId },
                });
                if (personalInfo) {
                    if (key === "password") {
                        personalInfo?.set(key, await hashData(value));
                        let info = await personalInfo?.save();
                        console.log("Row Affected:", info);
                        response.status(responseStatusCode.ACCEPTED).json({
                            status: responseStatus.SUCCESS,
                            message: `Successfuly update a user's ${key}`,
                            data: personalInfo,
                        });
                    } else if (key === "pinCode") {
                        personalInfo?.set(key, await hashData(value));
                        let info = await personalInfo?.save();
                        console.log("Row Affected:", info);
                        response.status(responseStatusCode.ACCEPTED).json({
                            status: responseStatus.SUCCESS,
                            message: `Successfuly update a user's ${key}`,
                            data: personalInfo,
                        });
                    } else {
                        personalInfo?.set(key, value);
                        let info = await personalInfo?.save();
                        console.log("Row Affected:", info);
                        response.status(responseStatusCode.ACCEPTED).json({
                            status: responseStatus.SUCCESS,
                            message: `Successfuly update a user's ${key}`,
                            data: info,
                        });
                    }
                } else {
                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: `User's account with Id ${userId} does not exist`,
                        });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    //////////// UPDATE USER CONTACT INFO ////////////////////

    router.put(
        "/auth/users/:userId/contact/",
        async (request: express.Request, response: express.Response) => {
            try {
                let { key, value } = request.body;
                let { userId } = request.query;
                let contactInfo = await Contact.findOne({
                    where: { userId },
                });
                if (contactInfo) {
                    contactInfo?.set(key, value);
                    let info = await contactInfo?.save();
                    console.log("Row Affected:", info);
                    response.status(responseStatusCode.ACCEPTED).json({
                        status: responseStatus.SUCCESS,
                        message: `Successfuly update a user's ${key} info`,
                        data: info,
                    });
                } else {
                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: `User's contact information with userId ${userId} does not exist`,
                        });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    ////////////  DELETE USER AND CASCADING PERSONAL INFORMATION ////////////

    router.delete(
        "/auth/users/:userId",
        async (request: express.Request, response: express.Response) => {
            try {
                let userId = request.params.userId;
                let deleteObj = await User.destroy({
                    where: { userId },
                });
                if (deleteObj > 0) {
                    response.status(responseStatusCode.DELETED).json({
                        status: responseStatus.SUCCESS,
                        message: "Successfully deleted a user",
                    });
                } else {
                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: `User's account with ${userId} does not exist`,
                        });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    /////////// LOGIN USER ////////////////

    router.post(
        "/auth/users/login/",
        async (request: express.Request, response: express.Response) => {
            try {
                let {
                    password,
                    email,
                    deviceName,
                    deviceId,
                    notificationToken,
                } = request.body;
                let userInfo = await User.findOne({
                    where: { email },
                });

                if (userInfo) {
                    let hashedPassword = userInfo.getDataValue("password");
                    let isMatch = await matchWithHashedData(
                        password,
                        hashedPassword
                    );
                    if (isMatch) {
                        let notificationObject = {
                            userId: userInfo.getDataValue("userId"),
                            deviceId: deviceId,
                            deviceName: deviceName,
                            createdAt: new Date(),
                            notificationToken: notificationToken,
                        };
                        let createdObject = await NotificationDetail.create(
                            notificationObject
                        );

                        console.log({createdObject})

                        let notDetails = (await NotificationDetail.findAll({
                            where: {deviceId,userId:userInfo?.getDataValue("userId")}}))
                        
                        let notificationTokens = await Promise.all(
                            notDetails.map(async(notDetail)=>{
                                return notDetail.getDataValue("notificationToken")
                            })
                        )

                        console.log({ userInfo, createdObject });
                        let { data, status } = await axios.get(
                            `http://192.168.1.98:6000/follows/proxy/f-f/${userInfo.getDataValue(
                                "userId"
                            )}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${response.locals.token}`,
                                },
                            }
                        );
                        console.log("Fetched data from blog", data);
                        let { followings } = data;
                        let followingIds = followings?.rows.map((f: any) =>
                            f.getDataValue("followingId")
                        );
                        let loginToken = await jwtEncode({
                            userId: userInfo.getDataValue("userId"),
                            email: userInfo.getDataValue("email"),
                            accountNumber:
                            userInfo.getDataValue("accountNumber"),
                            deviceId: createdObject.getDataValue("deviceId"),
                            notificationTokens,
                            followingIds,
                        });

                        let loginNotificationMessage:NotificationData = {
                            token:notificationToken,
                            body:`You have loggedIn successfully as ${email} with a device ${deviceName}`,
                            title:"LOGIN SUMMARY",
                            data:{
                                url:"com.commodity.sl:/notifications"
                            }

                        }

                        await notification.sendNotification([loginNotificationMessage])
                        
                        response.status(responseStatusCode.CREATED).json({
                            status: responseStatus.SUCCESS,
                            message: `Login successfully`,
                            data: { token: loginToken },
                        });
                    } else {
                        response.status(responseStatusCode.UNATHORIZED).json({
                            status: responseStatus.UNATHORIZED,
                            message: "Password is incorrect.",
                        });
                    }
                } else {
                    response.status(responseStatusCode.UNATHORIZED).json({
                        status: responseStatus.UNATHORIZED,
                        message: "Email does not exist.",
                    });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    /////////////////////////////////////// LOGOUT USER ///////////////////////////////////

    router.delete(
        "/auth/users/logout/",
        async (request: express.Request, response: express.Response) => {
            try {
                let { userId, deviceId } = request.body;
                let deletedObj = await NotificationDetail.destroy({
                    where: { userId, deviceId },
                });
                if (deletedObj > 0) {
                    response.status(responseStatusCode.DELETED).json({
                        status: responseStatus.SUCCESS,
                        message: "Logout successfully",
                    });
                } else {
                    response.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message:
                            "Failed to lgout user. Ensure that the userId you used exists.",
                    });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    //////////////////////////////////////// CHECK EMAIL //////////////////////////////////

    router.get(
        "/auth/email/:email",
        async (request: express.Request, response: express.Response) => {
            try {
                let email: string = request.params?.email;
                let personal = await User.findOne({
                    where: { email },
                });
                if (personal) {
                    response.status(responseStatusCode.OK).json({
                        status: responseStatus.SUCCESS,
                        message: "Email is valid",
                    });
                } else {
                    response.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message: "Email does not exists.",
                    });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    ////////////////////////// CONFIRM EMAIL BY CONFIRMATION CODE /////////////////////////

    router.get(
        "/auth/confirm-email/:email",
        async (request: express.Request, response: express.Response) => {
            try {
                let email: string = request.params?.email;
                let { htmlPath, code } = await generateEmailHTML({
                    displayRandomCode: true,
                });
                let subject = "Mexu";
                let mailer = new MailService(email, htmlPath, subject);

                let emailSent = await mailer.send("smtp", response, code);
                if (emailSent) {
                    response.status(responseStatusCode.OK).json({
                        status: responseStatus.SUCCESS,
                        message: "Email sent successfully",
                        data: { confirmationCode: code },
                    });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    /////////////////////////////////////// CHECK PASSWORD /////////////////////////////////

    router.post(
        "/auth/checkpassword/",
        async (request: express.Request, response: express.Response) => {
            try {
                let { password, userId } = request.body;
                let userInfo = await User.findOne({
                    where: { userId },
                });

                if (userInfo) {
                    let hashedPassword = userInfo.getDataValue("password");
                    let isMatch = await matchWithHashedData(
                        password,
                        hashedPassword
                    );
                    if (isMatch) {
                        console.log(userInfo);
                        response.status(responseStatusCode.ACCEPTED).json({
                            status: responseStatus.SUCCESS,
                            message: `Password is valid`,
                        });
                    } else {
                        response
                            .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                            .json({
                                status: responseStatus.UNPROCESSED,
                                message: "Password is incorrect.",
                            });
                    }
                } else {
                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: "User does not exist.",
                        });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    ///////////////////// ADD USER BANK CREDIT,DEBIT CARD ////////////////////////

    router.post(
        "/auth/bcards/",
        async (request: express.Request, response: express.Response) => {
            try {
                let data = request.body;
                let createdAt = new Date();
                let cardNumber = await encryptBankCardNumber(data.cardNumber);
                console.log(data);

                let bankInfo = await BankCardDetail.create({
                    ...data,
                    cardNumber,
                    createdAt,
                });
                try {
                    await bankInfo.save();
                } catch (err) {
                    await bankInfo.reload();
                    console.log(err);

                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: "Failed to add Credit/Debit card",
                        });
                    return;
                }
                response.status(responseStatusCode.CREATED).json({
                    status: responseStatus.SUCCESS,
                    message: "Credit/Debit card successfully added",
                    data: bankInfo,
                });
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    ///////////////////////////// GET ALL USERS CREDIT,DEBIT CARD /////////////////////////

    router.get(
        "/auth/bcards/",
        async (request: express.Request, response: express.Response) => {
            try {
                let cards = await BankCardDetail.findAll();
                console.log(cards);
                response.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    data: cards,
                });
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    ///////////////////////////// GET USER CREDIT,DEBIT CARD /////////////////////////

    router.get(
        "/auth/bcards/:userId",
        async (request: express.Request, response: express.Response) => {
            try {
                let userId: string = request.params?.userId;
                let cardInfo = await BankCardDetail.findAll({
                    where: { userId },
                });
                if (cardInfo.length > 0) {
                    response.status(responseStatusCode.OK).json({
                        status: responseStatus.SUCCESS,
                        data: cardInfo,
                    });
                } else {
                    response.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message: `User with ${userId} does not exists.`,
                    });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    ///////////////////////////// DELETE USER CREDIT,DEBIT CARD /////////////////////////

    router.delete(
        "/auth/bcards/:bankCardDetailId",
        async (request: express.Request, response: express.Response) => {
            try {
                let bankCardDetailId = request.params.bankCardDetailId;
                let deleteObj = await BankCardDetail.destroy({
                    where: { bankCardDetailId },
                });
                if (deleteObj > 0) {
                    response.status(responseStatusCode.DELETED).json({
                        status: responseStatus.SUCCESS,
                        message: "Successfully deleted Credit/Debit Card",
                        data: deleteObj,
                    });
                } else {
                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: `Credit/Debit Card with id = ${bankCardDetailId} does not exist.`,
                        });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    /////////////////////////// ADD PHONE NUMBER ////////////////////////

    router.put(
        "/auth/phone/",
        async (request: express.Request, response: express.Response) => {
            try {
                let { phoneNumber, userId } = request.body;
                let contactInfo = await Contact.findOne({
                    where: { userId },
                });
                if (contactInfo) {
                    let newPhoneNumbers = JSON.parse(
                        contactInfo.get("phoneNumbers") + ""
                    );
                    let company = await getPhoneNumberCompany(phoneNumber);
                    newPhoneNumbers[company] = phoneNumber;
                    contactInfo?.set("phoneNumbers", newPhoneNumbers);
                    let info = await contactInfo?.save();
                    // console.log("Row Affected:", info);
                    response.status(responseStatusCode.CREATED).json({
                        status: responseStatus.SUCCESS,
                        message: `Successfuly update a user's phonenumber`,
                        data: info,
                    });
                } else {
                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: `User with ${userId} does not exist`,
                        });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    //////////////////////////////////// DELETE PHONE NUMBER /////////////////////////////////////////////

    router.delete(
        "/auth/phone/",
        async (request: express.Request, response: express.Response) => {
            try {
                let { phoneNumber, userId } = request.body;
                let contactInfo = await Contact.findOne({
                    where: { userId },
                });
                if (contactInfo) {
                    let newPhoneNumbers = JSON.parse(
                        contactInfo.getDataValue("phoneNumbers")
                    );
                    let company = await getPhoneNumberCompany(phoneNumber);
                    newPhoneNumbers[company] = null;
                    contactInfo?.setDataValue("phoneNumbers", newPhoneNumbers);
                    let info = await contactInfo?.save();
                    // console.log("Row Affected:", info);
                    response.status(responseStatusCode.DELETED).json({
                        status: responseStatus.SUCCESS,
                        message: `Successfuly deleted a user's phonenumber`,
                        affectedRow: info,
                    });
                } else {
                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: `User with ${userId} does not exist`,
                        });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    /////////////////////// CORNFIRM PHONE NUMBER BY SMS AND CONFIRMATION CODE /////////////

    router.post(
        "/auth/phone/confirmnumber/",
        async (request: express.Request, response: express.Response) => {
            try {
                let { phoneNumber } = request.body;
                let { message, code } = await smsConfirmationMessage();
                let sms = new SMS(phoneNumber, message);
                let smsResponse = await sms.sendMessage("vonage");
                response.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    message: "Message sent successfully",
                    data: { confirmationCode: code },
                });
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    ///////////////////////////////////// ADD TRANSFEREE /////////////////////////////////////

    router.post(
        "/auth/transferees/",
        async (request: express.Request, response: express.Response) => {
            try {
                let data = request.body;

                let transfereeInfo = await Transferee.create({
                    ...data,
                });
                try {
                    await transfereeInfo.save();
                } catch (err) {
                    await transfereeInfo.reload();
                    console.log(err);

                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: "Failed to add Transferee",
                        });
                    return;
                }
                response.status(responseStatusCode.CREATED).json({
                    status: responseStatus.SUCCESS,
                    message: "Transferee card successfully added",
                    data: transfereeInfo,
                });
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    ///////////////////////////// GET ALL USER TRANSFEREES /////////////////////////

    router.get(
        "/auth/transferees/:transfereeId",
        async (request: express.Request, response: express.Response) => {
            try {
                let tranfereeId = request.params.tranfereeId;
                let transferees = await Transferee.findAll({
                    where: { tranfereeId },
                });
                console.log(transferees);
                response.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    data: transferees,
                });
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    /////////////////////////////////// DELETE TRANSFEREE //////////////////////////////////

    router.delete(
        "/auth/transferees/:id",
        async (request: express.Request, response: express.Response) => {
            try {
                let id = request.params.id;
                let deleteObj = await Transferee.destroy({
                    where: { id },
                });
                if (deleteObj > 0) {
                    response.status(responseStatusCode.DELETED).json({
                        status: responseStatus.SUCCESS,
                        message: "Successfully deleted a Transferee",
                        data: { deleteObj: deleteObj },
                    });
                } else {
                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: `Transferee with ownerId = ${id} does not exist.`,
                        });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    ///////////////////////////////////// CHECK FOR VALID ACCOUNT NUMBER //////////////////////////////////////

    router.get(
        "/auth/checkaccountnumber/:number",
        async (request: express.Request, response: express.Response) => {
            try {
                let accountNumber = request.params.number;
                let user = await User.findOne({
                    where: { accountNumber },
                });
                if (user) {
                    console.log(user);
                    response.status(responseStatusCode.OK).json({
                        status: responseStatus.SUCCESS,
                        message: "Accout number is valid",
                        data: user,
                    });
                } else {
                    response.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message: `Account number ${accountNumber} does not exist`,
                    });
                }
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );

    /// GETS ROUTES

    router.get("/", (request: express.Request, response: express.Response) => {
        response.status(responseStatusCode.OK).json({
            status: responseStatus.SUCCESS,
        });
    });
};
