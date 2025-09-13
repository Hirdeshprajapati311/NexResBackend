"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResumePDF = generateResumePDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
async function generateResumePDF(resume) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default();
            const chunks = [];
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", (err) => reject(err));
            // Content
            doc.fontSize(20).text("Resume", { align: "center" }).moveDown();
            doc.fontSize(14).text(`Name: ${resume.personal?.fullName || ""}`);
            doc.text(`Email: ${resume.personal?.email || ""}`).moveDown();
            doc.fontSize(16).text("Education");
            resume.education?.forEach((edu) => {
                doc.fontSize(12).text(`${edu.degree} - ${edu.school} (${edu.start} - ${edu.end})`);
            });
            doc.moveDown();
            doc.fontSize(16).text("Experience");
            resume.experience?.forEach((exp) => {
                doc.fontSize(12).text(`${exp.role} @ ${exp.company} (${exp.start} - ${exp.end})`);
                exp.bullets?.forEach((b) => doc.text(`- ${b}`));
            });
            doc.moveDown();
            doc.fontSize(16).text("Skills");
            doc.fontSize(12).text(resume.skills?.join(", ") || "");
            doc.end();
        }
        catch (err) {
            reject(err);
        }
    });
}
