const engines = require("../data/engines.json");

exports.getAllEngines = (req, res) => {
    res.json(engines);
};

exports.getEngineById = (req, res) => {

    const id = parseInt(req.params.id);

    const engine = engines.find(e => e.id === id);

    if (!engine) {
        return res.status(404).json({
            message: "Engine not found"
        });
    }

    res.json(engine);
};