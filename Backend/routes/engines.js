const express = require("express");
const router = express.Router();

const {
    getAllEngines,
    getEngineById
} = require("../controllers/engineController");

router.get("/", getAllEngines);
router.get("/:id", getEngineById);

module.exports = router;