import express from "express";
import { Notification } from "../models/Notifications";
import {
    responseStatus,
    responseStatusCode,
    getResponseBody,
} from "../utils/Utils";
import User from "../models/Users";
import { NotificationDetail } from "../models/NotificationDetails";

export default (router: express.Application) => {
    //////////////////////// GET NOTIFICATIONS BY USERID //////////////////////////

    router.get(
        "/notifications/:userId",
        async (request: express.Request, response: express.Response) => {
            try {
                let userId = request.params.userId;
                let notifications = await Notification.findAll({
                    where: { userId },
                    order: [["createdAt", "DESC"]],
                });
                response.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    data: notifications,
                });
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: err,
                });
            }
        }
    );

    ///////////////////////////// GET ALL NOTIFICATIONS ///////////////////////////////////

    router.get(
        "/notifications/",
        async (request: express.Request, response: express.Response) => {
            try {
                let notifications = await Notification.findAll();
                response.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    data: notifications,
                });
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: err,
                });
            }
        }
    );

    ///////////////////////////// DELETE A NOTIFICATION ///////////////////////////

    router.delete(
        "/notifications/:notificationId",
        async (request: express.Request, response: express.Response) => {
            try {
                let notificationId = request.params.notificationId;
                let deleteObj = await Notification.destroy({
                    where: { notificationId },
                });
                if (deleteObj > 0) {
                    response.status(responseStatusCode.DELETED).json({
                        status: responseStatus.SUCCESS,
                        message: "Successfully deleted a notification record",
                        deleteObj: deleteObj,
                    });
                } else {
                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: `Failed to delete notification with Id ${notificationId}`,
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

    ///////////////////////// ADD READ STATUS /////////////////////////////

    router.put(
        "/notifications/read/:notificationId",
        async (request: express.Request, response: express.Response) => {
            try {
                let notId = request.params.notificationId;
                const notification = await Notification.findByPk(notId);
                if (!notification) {
                    return response
                        .status(responseStatusCode.NOT_FOUND)
                        .json(
                            getResponseBody(
                                responseStatus.ERROR,
                                `Notification with Id ${notId} does not exist`
                            )
                        );
                }
                const newNot = await Notification.update(
                    { readStatus: true },
                    {
                        where: { id: notId },
                    }
                );
                response.status(responseStatusCode.ACCEPTED).json({
                    status: responseStatus.SUCCESS,
                    data: {
                        affectedRow: newNot,
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

    /////////////////////// DELETE USER NOTIFICATIONS //////////////////////

    router.delete(
        "/notifications/del/:userId",
        async (request: express.Request, response: express.Response) => {
            try {
                let userId = request.params.userId;
                let deleteObj = await Notification.destroy({
                    where: { userId },
                });
                if (deleteObj > 0) {
                    response.status(responseStatusCode.DELETED).json({
                        status: responseStatus.SUCCESS,
                        message:
                            "Successfully deleted a user notification records",
                        deleteObj: deleteObj,
                    });
                } else {
                    response
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json({
                            status: responseStatus.UNPROCESSED,
                            message: `Failed to delete user notifications with userId ${userId}`,
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

    /////////////////// GET NOTIFICATION TOKEN ///////////////////////////


    router.get(
        "/notifications/token/:userId",
        async (request: express.Request, response: express.Response) => {
            try {
                let userId = request.params.userId;
                let notificationDetails = await NotificationDetail.findAll({
                    where: { userId },
                });

                let noficationTokens = await Promise.all(notificationDetails.map(async (notificationDetail)=>{
                    let token = notificationDetail.getDataValue("notificationToken");
                    return token
                }))
                response.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    data:noficationTokens,
                })
            } catch (err) {
                console.log(err);
                response.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: String(err),
                });
            }
        }
    );



    //////////////////// GET NOTIFICATION VIEW FOR PRODUCT ////////////////

    // router.get(
    //     "/notifications/product/:productId",
    //     async (request: express.Request, response: express.Response) => {
    //         try {
    //             let productId = request.params.productId;
    //             let product = await Product.findOne({
    //                 where: { id: productId },
    //             });
    //             if (!product) {
    //                 return response.status(responseStatusCode.NOT_FOUND).json({
    //                     status: responseStatus.ERROR,
    //                     message: `The product with productId ${productId} does not exist`,
    //                 });
    //             }
    //             let owner = await User.findByPk(
    //                 product.getDataValue("userId")
    //             );
    //             // let notifications = await Notification.findAll();
    //             response.status(responseStatusCode.OK).json({
    //                 status: responseStatus.SUCCESS,
    //                 data: { owner, product },
    //             });
    //         } catch (err) {
    //             console.log(err);
    //             response.status(responseStatusCode.BAD_REQUEST).json({
    //                 status: responseStatus.ERROR,
    //                 message: err,
    //             });
    //         }
    //     }
    // );
};
