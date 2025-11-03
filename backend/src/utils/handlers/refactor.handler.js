import catchAsyncError from "../middlewares/catchAsync.js";
import AppError from "../services/appError.js";

export const createOne = (model) => {
  return catchAsyncError(async (req, res, next) => {
    let added = await model.insertMany(req.body);
    res.status(201).json({ message: "success", data: added });
  });
};

export const getAll = (model) =>
  catchAsyncError(async (req, res, next) => {
    const results = await model.find();
    res.status(200).json({ status: "success", data: results });
  });

export const getById = (model) =>
  catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const result = await model.findById(id);
    if (!result) return next(new AppError("Document not found", 404));
    res.status(200).json({ status: "success", data: result });
  });

export const updateOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

export const deleteOne = (model) =>
  catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const result = await model.findByIdAndDelete(id);

    if (!result) {
      return next(new AppError("Document not found", 404));
    }

    res.status(200).json({ message: "success", data: result });
  });
