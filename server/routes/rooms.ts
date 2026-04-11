import express from "express";
import * as roomsController from "../controllers/rooms.controller.ts";

export const roomsRouter = express.Router();

roomsRouter.post("/api/rooms/create", roomsController.createRoom);
