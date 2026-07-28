import { Router } from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  toggleFavorite,
  addRating,
  getMyListings,
  getFavorites,
} from "../controllers/marketplace.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createItemSchema, updateItemSchema, ratingSchema } from "../validators/marketplace.validator.js";

const router = Router();

router.get("/items", authenticate, getItems);
router.post("/items", authenticate, validate(createItemSchema), createItem);
router.get("/items/my", authenticate, getMyListings);
router.get("/items/favorites", authenticate, getFavorites);
router.get("/items/:id", authenticate, getItemById);
router.patch("/items/:id", authenticate, validate(updateItemSchema), updateItem);
router.delete("/items/:id", authenticate, deleteItem);
router.post("/items/:id/favorite", authenticate, toggleFavorite);
router.post("/items/:id/rate", authenticate, validate(ratingSchema), addRating);

export default router;
