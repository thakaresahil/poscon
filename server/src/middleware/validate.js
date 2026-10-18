// Validates req.body (or req.query) against a zod schema and replaces it with the parsed value
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return res
      .status(400)
      .json({ error: result.error.issues[0]?.message || "Invalid input" });
  }
  req[source] = result.data;
  next();
};

export default validate;
