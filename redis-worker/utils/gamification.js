import User from "../models/User.js";

const XP_BY_DIFFICULTY = { Easy: 10, Medium: 20, Hard: 30 };
const BADGE_RULES = [
    { type: "problemsSolved", threshold: 1, badge: "First Blood", icon: "🥇" },
    { type: "problemsSolved", threshold: 10, badge: "Rising Star", icon: "🏅" },
    { type: "problemsSolved", threshold: 50, badge: "Algorithm Master", icon: "🌟" },
    { type: "xp", threshold: 200, badge: "XP Beginner", icon: "🎖️" },
    { type: "xp", threshold: 500, badge: "XP Pro", icon: "🏆" },
];

const calculateLevel = (xp = 0) => {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    return Math.floor(xp / 500) + 1;
};

export const updateGamification = async (userId, problemId, problemDifficulty) => {
    try {
        console.log("🟢 [Gamification] Called updateGamification", { userId, problemId, problemDifficulty });

        const user = await User.findById(userId);
        if (!user) {
            console.error("🔴 [Gamification] User not found", { userId });
            throw new Error("User not found");
        }
        console.log("🟢 [Gamification] User fetched from DB", user._id);

        // Initialize fields if missing
        user.totalSubmissions ??= 0;
        user.problemsSolved ??= [];
        user.badges ??= [];
        user.problemStats ??= { easySolved: 0, mediumSolved: 0, hardSolved: 0 };
        user.streak ??= 0;
        user.xp ??= 0;

        console.log("🟢 [Gamification] Initialized user fields");

        user.totalSubmissions += 1;
        user.lastSubmissionAt = new Date();

        let newlySolved = false;

        if (!user.problemsSolved.includes(problemId)) {
            newlySolved = true;
            user.problemsSolved.push(problemId);
            user.lastProblemSolvedAt = new Date();

            const earnedXP = XP_BY_DIFFICULTY[problemDifficulty] ?? 10;
            user.xp += earnedXP;

            if (problemDifficulty === "Easy") user.problemStats.easySolved += 1;
            if (problemDifficulty === "Medium") user.problemStats.mediumSolved += 1;
            if (problemDifficulty === "Hard") user.problemStats.hardSolved += 1;

            console.log("🟢 [Gamification] XP and problem stats updated", { earnedXP, problemStats: user.problemStats });

            const today = new Date().setHours(0, 0, 0, 0);
            const lastSolved = user.lastSolvedDate ? new Date(user.lastSolvedDate).setHours(0, 0, 0, 0) : null;

            if (!lastSolved) user.streak = 1;
            else {
                const diffDays = (today - lastSolved) / (1000 * 60 * 60 * 24);
                if (diffDays === 1) user.streak += 1;
                else if (diffDays > 1) user.streak = 1;
            }

            user.lastSolvedDate = new Date();
            console.log("🟢 [Gamification] Streak updated", { streak: user.streak });
        } else {
            console.log("🟡 [Gamification] Problem already solved, skipping XP update");
        }

        // Check badges
        for (const rule of BADGE_RULES) {
            if (rule.type === "problemsSolved" && user.problemsSolved.length >= rule.threshold) {
                if (!user.badges.some((b) => b.name === rule.badge)) {
                    user.badges.push({ name: rule.badge, icon: rule.icon });
                    console.log("🟢 [Gamification] Badge earned", rule.badge);
                }
            }
            if (rule.type === "xp" && user.xp >= rule.threshold) {
                if (!user.badges.some((b) => b.name === rule.badge)) {
                    user.badges.push({ name: rule.badge, icon: rule.icon });
                    console.log("🟢 [Gamification] XP Badge earned", rule.badge);
                }
            }
        }

        user.level = calculateLevel(user.xp);
        console.log("🟢 [Gamification] Level calculated", { level: user.level });

        await user.save();
        console.log("✅ [Gamification] User saved to DB");
        return {
            userId,           // add this
            xp: result.xp,
            level: result.level,
            badges: result.badges,
            problemsSolved: result.problemsSolved,
            streak: result.streak,
            problemStats: result.problemStats,
            newlySolved: result.newlySolved
        };
    } catch (err) {
        console.error("❌ [Gamification] Error in updateGamification", err);
        throw err;
    }
};
