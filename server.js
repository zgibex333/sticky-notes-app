const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3500;

app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/root"));

app.all("*", (req, res) => {
  if (req.accepts("html")) {
    res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 not found" });
  } else {
    res.type("text").send("404 Not Found");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
