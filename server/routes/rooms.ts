import express from "express";
import * as roomsController from "../controllers/rooms.controller.ts";
import * as userController from "../controllers/user.controller.ts";
import * as optionController from "../controllers/option.controller.ts";

export const roomsRouter = express.Router();

roomsRouter.post("/api/rooms/create", roomsController.createRoom);
roomsRouter.get("/api/rooms/:id/occupancy", roomsController.getRoomOccupancy);
roomsRouter.get("/api/rooms/:id", roomsController.getRoomById);
roomsRouter.post("/api/rooms/:id/users", userController.createUser);
roomsRouter.post("/api/rooms/:id/options", optionController.createOptions);
roomsRouter.get("/api/rooms/:id/users", userController.getUsers);
