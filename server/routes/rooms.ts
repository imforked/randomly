import express from "express";
import * as roomsController from "../controllers/rooms.controller.ts";
import * as userController from "../controllers/user.controller.ts";
import * as optionController from "../controllers/option.controller.ts";
import * as submissionsController from "../controllers/submissions.controller.ts";
import {
  createOptionsRateLimiter,
  createRoomRateLimiter,
  createUserRateLimiter,
} from "../middleware/rateLimit.ts";

export const roomsRouter = express.Router();

export const PATH_PREFIX = "/api/rooms";

roomsRouter.post("/create", createRoomRateLimiter, roomsController.createRoom);
roomsRouter.get("/:id/occupancy", roomsController.getRoomOccupancy);
roomsRouter.get("/:id", roomsController.getRoomById);
roomsRouter.post("/:id/users", createUserRateLimiter, userController.createUser);
roomsRouter.post(
  "/:id/options",
  createOptionsRateLimiter,
  optionController.createOptions
);
roomsRouter.get("/:id/users", userController.getUsers);
roomsRouter.get("/:id/options", optionController.getOptionsWithUsers);
roomsRouter.get("/:id/random", optionController.getRandomOption);
roomsRouter.get("/:id/submissions", submissionsController.getRoomSubmissions);
