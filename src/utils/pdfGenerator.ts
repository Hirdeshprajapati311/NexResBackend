import PDFDocument from "pdfkit";
import { ResumeVersionType } from "../models/Resume";

export async function generateResumePDF(resume: ResumeVersionType): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Content
      doc.fontSize(20).text("Resume", { align: "center" }).moveDown();

      doc.fontSize(14).text(`Name: ${resume.personal?.fullName || ""}`);
      doc.text(`Email: ${resume.personal?.email || ""}`).moveDown();

      doc.fontSize(16).text("Education");
      resume.education?.forEach((edu: any) => {
        doc.fontSize(12).text(`${edu.degree} - ${edu.school} (${edu.start} - ${edu.end})`);
      });
      doc.moveDown();

      doc.fontSize(16).text("Experience");
      resume.experience?.forEach((exp: any) => {
        doc.fontSize(12).text(`${exp.role} @ ${exp.company} (${exp.start} - ${exp.end})`);
        exp.bullets?.forEach((b: string) => doc.text(`- ${b}`));
      });
      doc.moveDown();

      doc.fontSize(16).text("Skills");
      doc.fontSize(12).text(resume.skills?.join(", ") || "");

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
