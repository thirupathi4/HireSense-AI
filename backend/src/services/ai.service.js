const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema");
const { resume, selfDescription, jobDescription } = require("./temp")



const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
})

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100).describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    title: z.string().describe("The job title from the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("A technical question relevant to the job"),
        intention: z.string().describe("The skill or concept being tested by this question"),
        answer: z.string().describe("Detailed answer guide with key points and approaches")
    })).min(5).max(8).describe("5-8 technical questions tailored to the role"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("A behavioral or situational question"),
        intention: z.string().describe("The soft skill or work ethic being tested"),
        answer: z.string().describe("Example answer using STAR method approach")
    })).min(4).max(5).describe("4-5 behavioral questions for the interview"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity - how important this skill is for the job")
    })).min(3).describe("List of important skill gaps with severity levels"),
    preparationPlan: z.array(z.object({
        day: z.number().min(1).max(7).describe("Day number from 1 to 7"),
        focus: z.string().describe("Main focus area for this day"),
        tasks: z.array(z.string()).describe("3-4 specific actionable tasks for this day")
    })).length(7).describe("A 7-day preparation plan with daily focus areas and tasks"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `You are an expert interview preparation assistant. Analyze the candidate's profile and generate a comprehensive interview report.

CANDIDATE INFORMATION:
Resume: ${resume}
Self Description: ${selfDescription}

JOB DESCRIPTION:
${jobDescription}

GENERATE A JSON RESPONSE WITH THE FOLLOWING STRUCTURE:

1. matchScore: A score between 0-100 showing how well the candidate matches the job requirements.

2. title: The exact job title from the job description.

3. technicalQuestions: Generate EXACTLY 5-8 technical questions tailored to this job role. Each question should have:
   - question: A specific technical question relevant to the job
   - intention: What skill does this question test?
   - answer: Detailed answer guide covering key points and approaches

4. behavioralQuestions: Generate 4-5 behavioral questions. Each should have:
   - question: A behavioral/situational question
   - intention: What soft skill or work ethic does this test?
   - answer: Example answer with STAR method guidance

5. skillGaps: List 3-5 important skills the candidate is LACKING for this role, with:
   - skill: Name of the missing skill
   - severity: "low", "medium", or "high" (based on job criticality)

6. preparationPlan: Create a 7-day detailed preparation plan with:
   - day: Number from 1 to 7
   - focus: Main focus area for that day (e.g., "Data Structures", "System Design", "Mock Interviews")
   - tasks: 3-4 specific actionable tasks for that day

Focus on practical, job-specific preparation based on the resume, job description, and identified gaps.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(interviewReportSchema),
            }
        })

        const reportData = JSON.parse(response.text)

        // Display formatted report output in console
        console.log("\n=====================================");
        console.log("📊 INTERVIEW REPORT GENERATED");
        console.log("=====================================\n");

        console.log(`📌 Match Score: ${reportData.matchScore}/100`);
        console.log(`📌 Job Title: ${reportData.title}\n`);

        console.log(`📌 Technical Questions (${reportData.technicalQuestions.length}):`);
        reportData.technicalQuestions.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q.question}`);
            console.log(`      Intention: ${q.intention}\n`);
        });

        console.log(`📌 Behavioral Questions (${reportData.behavioralQuestions.length}):`);
        reportData.behavioralQuestions.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q.question}`);
            console.log(`      Intention: ${q.intention}\n`);
        });

        console.log(`📌 Skill Gaps (${reportData.skillGaps.length}):`);
        reportData.skillGaps.forEach((gap) => {
            console.log(`   • ${gap.skill} (${gap.severity})`);
        });

        console.log(`\n📌 Preparation Plan (${reportData.preparationPlan.length} days):`);
        reportData.preparationPlan.forEach((plan) => {
            console.log(`   Day ${plan.day}: ${plan.focus}`);
            plan.tasks.forEach(task => {
                console.log(`      • ${task}`);
            });
        });

        console.log("\n=====================================");
        console.log("✅ Full report data:");
        console.log(JSON.stringify(reportData, null, 2));
        console.log("=====================================\n");

        return reportData
    } catch (error) {
        if (error.status === 429) {
            console.error("❌ API Quota Exceeded: Free tier limit reached")
            console.error("Solution: Upgrade to a paid plan or wait for quota reset")
            throw new Error("Gemini API quota exceeded. Please upgrade your plan or try again later.")
        }
        console.error("❌ Error generating interview report:", error.message)
        throw error
    }
}

module.exports = { generateInterviewReport }
