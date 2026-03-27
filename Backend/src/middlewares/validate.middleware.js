import { ApiError } from "../utils/ApiError.js";

const validate = (schema, source = "body") => (req, res, next) => {
  const data =
    source === "query"
      ? req.query
      : source === "params"
      ? req.params
      : req.body;

  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error?.errors?.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })) ?? [];

    return next(new ApiError(400, "Validation failed", errorMessages));
  }

  if (source === "query") {
    Object.keys(result.data).forEach((key) => {
      req.query[key] = result.data[key];
    });
  } else if (source === "params") {
    Object.keys(result.data).forEach((key) => {
      req.params[key] = result.data[key];
    });
  } else {
    req.body = result.data;
  }

  next();
};

export { validate };