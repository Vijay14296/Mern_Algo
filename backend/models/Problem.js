import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  hidden: { type: Boolean, default: false }, // for hidden test cases
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  testCases: [testCaseSchema],

  // Multi-language starter code (modern approach)
  starterCode: {
    java: { type: String, default: "" },
    python: { type: String, default: "" },
    cpp: { type: String, default: "" }
  },

  // Expected function signatures (can be shown per language if needed)
  functionSignatures: [{ type: String }],

  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
  tags: [String],

  timeLimit: { type: Number, default: 2 },     // seconds
  memoryLimit: { type: Number, default: 256 }, // MB

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true }); // adds createdAt and updatedAt automatically

export default mongoose.model("Problem", problemSchema);
