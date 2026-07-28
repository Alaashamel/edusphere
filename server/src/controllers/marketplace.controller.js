import marketplaceService from "../services/marketplace.service.js";

export const createItem = async (req, res, next) => {
  try {
    const item = await marketplaceService.createItem(req.body, req.user._id);
    res.status(201).json({ success: true, data: { item } });
  } catch (error) { next(error); }
};

export const getItems = async (req, res, next) => {
  try {
    const result = await marketplaceService.getItems(req.query);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getItemById = async (req, res, next) => {
  try {
    const item = await marketplaceService.getItemById(req.params.id);
    res.json({ success: true, data: { item } });
  } catch (error) { next(error); }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await marketplaceService.updateItem(req.params.id, req.body, req.user._id);
    res.json({ success: true, data: { item } });
  } catch (error) { next(error); }
};

export const deleteItem = async (req, res, next) => {
  try {
    await marketplaceService.deleteItem(req.params.id, req.user._id);
    res.json({ success: true, message: "Item deleted" });
  } catch (error) { next(error); }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const result = await marketplaceService.toggleFavorite(req.params.id, req.user._id);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const addRating = async (req, res, next) => {
  try {
    const ratings = await marketplaceService.addRating(req.params.id, req.body, req.user._id);
    res.json({ success: true, data: { ratings } });
  } catch (error) { next(error); }
};

export const getMyListings = async (req, res, next) => {
  try {
    const result = await marketplaceService.getMyListings(req.user._id, req.query);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getFavorites = async (req, res, next) => {
  try {
    const result = await marketplaceService.getFavorites(req.user._id, req.query);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};
