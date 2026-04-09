const mongoose = require("mongoose")

const connectDB = async (retries = 5, delay = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(process.env.MONGO_URI)
            console.log("✓ Database connected successfully");
            return;
        }
        catch (err) {
            if (attempt === retries) {
                console.error("✗ Failed to connect to MongoDB after", retries, "attempts:", err.message);
                process.exit(1);
            }
            console.warn(`⚠ Connection attempt ${attempt} failed. Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

module.exports = connectDB    