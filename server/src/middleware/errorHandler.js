export const notFound = (req, res) => {
  res.status(404).json({ error: "Route not found" });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large" });
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
};
