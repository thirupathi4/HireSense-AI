const express = require("express");
const router = express.Router();
const { generateInterviewReport } = require("../services/ai.service");

router.post("/generate-report", async (req, res) => {
    try {
        const { resume, selfDescription, jobDescription } = req.body;
        const report = await generateInterviewReport({ resume, selfDescription, jobDescription });
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;