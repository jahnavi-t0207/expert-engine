const express = require("express");
const cors = require("cors");

const engineRoutes = require("./routes/engines");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/engines", engineRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`EngineVerse API running on port ${PORT}`);
});