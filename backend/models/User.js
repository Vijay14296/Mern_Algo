import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true, minlength: 6 },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        // Gamification fields
        xp: { type: Number, default: 0 }, // Experience points
        level: { type: Number, default: 1 }, // Player level
        badges: {
            type: [
                {
                    name: { type: String, required: true },
                    icon: { type: String, required: true }
                }
            ],
            default: []
        },

        problemsSolved: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Problem",
            default: [],
        },

        totalSubmissions: { type: Number, default: 0 }, // All submissions
        problemStats: {
            easySolved: { type: Number, default: 0 },
            mediumSolved: { type: Number, default: 0 },
            hardSolved: { type: Number, default: 0 },
        },

        streak: { type: Number, default: 0 }, // Current daily streak
        lastSubmissionAt: { type: Date, default: null }, // Last time user submitted a solution
        lastProblemSolvedAt: { type: Date, default: null }, // Last accepted submission date
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
