import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Chapter } from "./types";

/**
 * Creates a temporary element off-screen, renders chapter pages, captures with html2canvas,
 * generates a paginated PDF using jsPDF, downloads it, and cleans up.
 */
export async function downloadChapterPDF(
  chapter: Chapter,
  showToast: (msg: string) => void
) {
  showToast("កំពុងរៀបចំឯកសារ PDF សម្រាប់ជំពូកទី " + chapter.number + "... ⏳");

  try {
    // 1. Create a container for our printable A4 pages
    const printContainer = document.createElement("div");
    printContainer.id = "chapter-pdf-print-container";
    // Place off-screen so user doesn't see it flickering
    printContainer.style.position = "absolute";
    printContainer.style.left = "-9999px";
    printContainer.style.top = "0";
    printContainer.style.width = "794px"; // Standard A4 width at 96 DPI
    printContainer.style.color = "#1c1917"; // text-stone-900
    printContainer.style.backgroundColor = "#ffffff";
    printContainer.style.fontFamily = '"Kantumruy Pro", "Battambang", sans-serif';
    printContainer.style.zIndex = "-100";

    // 2. Build the HTML Pages inside the container
    // We will build 4-5 pages precisely formatted as A4 blocks
    // A4 height is 1123px at 96 DPI
    const pageStyle = `
      width: 794px;
      height: 1123px;
      padding: 70px 65px;
      position: relative;
      background-color: #ffffff;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      border-bottom: 1px dashed #e5e5e5;
    `;

    // Define helper to render header and footer on content pages
    const getHeaderAndFooter = (pageNum: number, totalPages: number) => `
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #d6d3d1; padding-bottom: 8px; margin-bottom: 25px; font-family: 'Kantumruy Pro', sans-serif;">
        <span style="font-size: 9px; font-weight: 700; color: #78716c; letter-spacing: 0.05em; text-transform: uppercase;">មគ្គុទ្ទេសក៍យុទ្ធសាស្ត្រសម្រាប់ការគ្រប់គ្រង និងដឹកនាំបុគ្គលិក</span>
        <span style="font-size: 9px; font-weight: 700; color: #b45309;">ជំពូកទី ${chapter.number}</span>
      </div>
      <!-- Footer -->
      <div style="position: absolute; bottom: 40px; left: 65px; right: 65px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e7e5e4; padding-top: 10px; font-family: 'Kantumruy Pro', sans-serif; font-size: 9px; color: #78716c;">
        <span>រៀបរៀងដោយ៖ គួយ ចាន់រ៉ា • មិថុនា ២០២៦</span>
        <span style="font-weight: 700; font-family: monospace;">ទំព័រ ${pageNum} នៃ ${totalPages}</span>
      </div>
    `;

    // Generate Chapters contents dynamically based on length to split across 2 pages if needed
    const subSections = chapter.subSections;
    const midPoint = Math.ceil(subSections.length / 2);
    const subSectionsPage1 = subSections.slice(0, midPoint);
    const subSectionsPage2 = subSections.slice(midPoint);

    let htmlContent = "";

    // ==========================================
    // PAGE 1: CHAPTER COVER
    // ==========================================
    htmlContent += `
      <div style="${pageStyle}">
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border: 2px solid #e7e5e4; padding: 40px; border-radius: 16px; position: relative; height: 100%;">
          <!-- Corner decorations -->
          <div style="position: absolute; top: 15px; left: 15px; width: 30px; height: 30px; border-top: 3px solid #b45309; border-left: 3px solid #b45309;"></div>
          <div style="position: absolute; top: 15px; right: 15px; width: 30px; height: 30px; border-top: 3px solid #b45309; border-right: 3px solid #b45309;"></div>
          <div style="position: absolute; bottom: 15px; left: 15px; width: 30px; height: 30px; border-bottom: 3px solid #b45309; border-left: 3px solid #b45309;"></div>
          <div style="position: absolute; bottom: 15px; right: 15px; width: 30px; height: 30px; border-bottom: 3px solid #b45309; border-right: 3px solid #b45309;"></div>

          <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 13px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px;">
            សៀវភៅសិក្សាស្នូល • ជំពូកទី ${chapter.number}
          </div>
          
          <div style="width: 60px; height: 2px; background-color: #b45309; margin-bottom: 30px;"></div>

          <h1 style="font-family: 'Moul', serif; font-size: 26px; color: #1c1917; line-height: 1.6; margin-bottom: 15px; max-width: 520px; font-weight: normal;">
            ${chapter.title}
          </h1>

          <p style="font-family: monospace; font-size: 12px; font-weight: 700; color: #78716c; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 40px;">
            ${chapter.englishTitle}
          </p>

          <div style="max-width: 480px; font-family: 'Kantumruy Pro', sans-serif; font-size: 12px; font-weight: 500; color: #44403c; line-height: 2; text-align: justify; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 25px; margin-bottom: 40px; font-style: italic;">
            "${chapter.description}"
          </div>

          <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 10px; color: #78716c; margin-top: auto; font-weight: 600;">
            រៀបរៀង និងបោះពុម្ភផ្សាយជាឌីជីថលដោយ គួយ ចាន់រ៉ា • មិថុនា ២០២៦
          </div>
        </div>
      </div>
    `;

    // ==========================================
    // PAGE 2: SUBSECTIONS (PART 1)
    // ==========================================
    htmlContent += `
      <div style="${pageStyle}">
        ${getHeaderAndFooter(2, 5)}
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-start; gap: 30px;">
          ${subSectionsPage1.map(sec => `
            <div style="text-align: left;">
              <h3 style="font-family: 'Moul', serif; font-size: 13px; color: #b45309; margin-bottom: 12px; line-height: 1.6; font-weight: normal; border-bottom: 1px solid #f5f5f4; padding-bottom: 6px;">
                • ${sec.title}
              </h3>
              <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 11px; font-weight: 500; color: #292524; line-height: 1.9; text-align: justify;">
                ${sec.content.map(p => {
                  if (p.startsWith("•") || p.startsWith("-")) {
                    return `<p style="margin-bottom: 10px; padding-left: 15px; border-left: 2px solid #d97706; font-weight: 600;">${p}</p>`;
                  }
                  return `<p style="margin-bottom: 12px; text-indent: 20px;">${p}</p>`;
                }).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    // ==========================================
    // PAGE 3: SUBSECTIONS (PART 2)
    // ==========================================
    htmlContent += `
      <div style="${pageStyle}">
        ${getHeaderAndFooter(3, 5)}
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-start; gap: 30px;">
          ${subSectionsPage2.map(sec => `
            <div style="text-align: left;">
              <h3 style="font-family: 'Moul', serif; font-size: 13px; color: #b45309; margin-bottom: 12px; line-height: 1.6; font-weight: normal; border-bottom: 1px solid #f5f5f4; padding-bottom: 6px;">
                • ${sec.title}
              </h3>
              <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 11px; font-weight: 500; color: #292524; line-height: 1.9; text-align: justify;">
                ${sec.content.map(p => {
                  if (p.startsWith("•") || p.startsWith("-")) {
                    return `<p style="margin-bottom: 10px; padding-left: 15px; border-left: 2px solid #d97706; font-weight: 600;">${p}</p>`;
                  }
                  return `<p style="margin-bottom: 12px; text-indent: 20px;">${p}</p>`;
                }).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    // ==========================================
    // PAGE 4: PRACTICAL EXAMPLES
    // ==========================================
    htmlContent += `
      <div style="${pageStyle}">
        ${getHeaderAndFooter(4, 5)}
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-start; text-align: left;">
          <h2 style="font-family: 'Moul', serif; font-size: 14px; color: #1c1917; margin-bottom: 20px; text-align: center; border-bottom: 2px solid #b45309; padding-bottom: 8px;">
            ករណីសិក្សា និងការដោះស្រាយអនុវត្តជាក់ស្តែង
          </h2>
          
          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${chapter.examples.map((ex, exIdx) => `
              <div style="border: 1.5px solid #e7e5e4; border-radius: 12px; padding: 18px; background-color: #fafaf9;">
                <h4 style="font-family: 'Kantumruy Pro', sans-serif; font-size: 12px; font-weight: 800; color: #b45309; margin-bottom: 10px;">
                  ករណីទី ${exIdx + 1}៖ ${ex.title}
                </h4>
                <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 10px; line-height: 1.8; color: #44403c; margin-bottom: 10px; text-align: justify;">
                  <strong>ស្ថានភាព៖</strong> ${ex.scenario}
                </div>
                <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 10px; line-height: 1.8; color: #1c1917; margin-bottom: 10px; text-align: justify; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px; border-radius: 8px;">
                  <strong>ដំណោះស្រាយ៖</strong> ${ex.solution}
                </div>
                <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 10.5px; line-height: 1.8; color: #b45309; font-weight: 700; text-align: justify; border-top: 1px dashed #e7e5e4; padding-top: 8px;">
                  🗝️ គន្លឹះសំខាន់៖ <span style="font-weight: 500; color: #44403c;">${ex.takeaway}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    // ==========================================
    // PAGE 5: DISCUSSION QUESTIONS
    // ==========================================
    htmlContent += `
      <div style="${pageStyle}">
        ${getHeaderAndFooter(5, 5)}
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-start; text-align: left;">
          <h2 style="font-family: 'Moul', serif; font-size: 14px; color: #1c1917; margin-bottom: 20px; text-align: center; border-bottom: 2px solid #b45309; padding-bottom: 8px;">
            ប្រធានបទសំណួរសម្រាប់ពិភាក្សា និងការណែនាំ
          </h2>

          <div style="display: flex; flex-direction: column; gap: 20px; margin-top: 10px;">
            ${chapter.discussionQuestions.map((dq, dqIdx) => `
              <div style="border: 1px dashed #b45309; border-radius: 12px; padding: 18px; background-color: #fffbeb;">
                <h4 style="font-family: 'Kantumruy Pro', sans-serif; font-size: 11.5px; font-weight: 800; color: #b45309; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  📝 សំណួរទី ${dqIdx + 1}
                </h4>
                <p style="font-family: 'Kantumruy Pro', sans-serif; font-size: 11px; font-weight: 700; color: #1c1917; line-height: 1.8; margin-bottom: 10px; text-align: justify;">
                  ${dq.question}
                </p>
                <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 10px; line-height: 1.8; color: #78716c; border-top: 1px solid #fcd34d; padding-top: 8px; text-align: justify;">
                  <strong>📌 ការណែនាំឆ្លើយ៖</strong> ${dq.guidelines}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    // Write all pages content and append to print container
    printContainer.innerHTML = htmlContent;
    document.body.appendChild(printContainer);

    // 3. Wait a moment for layout/fonts to settle
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 4. Instantiate jsPDF (A4 standard: 210mm x 297mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 5. Render each page using html2canvas and append to PDF
    const pages = printContainer.children;
    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i] as HTMLElement;
      
      const canvas = await html2canvas(pageEl, {
        scale: 2, // Retains high crispness/DPI for Khmer text
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      
      if (i > 0) {
        pdf.addPage();
      }

      // Add image to A4 dimensions precisely (210 x 297 mm)
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
    }

    // 6. Save PDF
    pdf.save(`ជំពូកទី-${chapter.number}_${chapter.title.replace(/\s+/g, "_")}.pdf`);
    
    // 7. Cleanup DOM
    document.body.removeChild(printContainer);
    showToast("បានទាញយក PDF ជំពូកទី " + chapter.number + " ដោយជោគជ័យ! 🎉");
  } catch (error) {
    console.error("Error generating chapter PDF:", error);
    showToast("មានបញ្ហាក្នុងការទាញយក PDF ជំពូក! ❌");
  }
}

/**
 * Generates a beautiful PDF of the entire book, with a majestic cover page, foreword,
 * table of contents, and all 4 chapters.
 */
export async function downloadFullBookPDF(
  chaptersList: Chapter[],
  bookIntro: any,
  showToast: (msg: string) => void
) {
  showToast("កំពុងរៀបចំសៀវភៅទាំងមូលជា PDF... ដំណើរការនេះអាចចំណាយពេលបន្តិច! ⏳📖");

  try {
    const printContainer = document.createElement("div");
    printContainer.id = "fullbook-pdf-print-container";
    printContainer.style.position = "absolute";
    printContainer.style.left = "-9999px";
    printContainer.style.top = "0";
    printContainer.style.width = "794px";
    printContainer.style.color = "#1c1917";
    printContainer.style.backgroundColor = "#ffffff";
    printContainer.style.fontFamily = '"Kantumruy Pro", "Battambang", sans-serif';
    printContainer.style.zIndex = "-100";

    const pageStyle = `
      width: 794px;
      height: 1123px;
      padding: 70px 65px;
      position: relative;
      background-color: #ffffff;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      border-bottom: 1px dashed #e5e5e5;
    `;

    const getHeaderAndFooter = (title: string, pageNum: number, totalPages: number) => `
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #d6d3d1; padding-bottom: 8px; margin-bottom: 25px; font-family: 'Kantumruy Pro', sans-serif;">
        <span style="font-size: 9px; font-weight: 700; color: #78716c; letter-spacing: 0.05em; text-transform: uppercase;">${bookIntro.title}</span>
        <span style="font-size: 9px; font-weight: 700; color: #b45309;">${title}</span>
      </div>
      <!-- Footer -->
      <div style="position: absolute; bottom: 40px; left: 65px; right: 65px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e7e5e4; padding-top: 10px; font-family: 'Kantumruy Pro', sans-serif; font-size: 9px; color: #78716c;">
        <span>រៀបរៀងដោយ៖ ${bookIntro.author} • ${bookIntro.publishedDate}</span>
        <span style="font-weight: 700; font-family: monospace;">ទំព័រ ${pageNum} នៃ ${totalPages}</span>
      </div>
    `;

    let htmlContent = "";

    // Total calculated pages: 1 Cover + 1 Foreword & TOC + 4 chapters * 4 pages per chapter = 18 Pages
    const totalPages = 18;
    let pageCounter = 1;

    // ==========================================
    // PAGE 1: MAJESTIC BOOK COVER
    // ==========================================
    htmlContent += `
      <div style="${pageStyle}">
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border: 4px double #b45309; padding: 40px; border-radius: 16px; position: relative; height: 100%; background-color: #fffbeb;">
          <!-- Corner decorations -->
          <div style="position: absolute; top: 15px; left: 15px; width: 40px; height: 40px; border-top: 4px solid #b45309; border-left: 4px solid #b45309;"></div>
          <div style="position: absolute; top: 15px; right: 15px; width: 40px; height: 40px; border-top: 4px solid #b45309; border-right: 4px solid #b45309;"></div>
          <div style="position: absolute; bottom: 15px; left: 15px; width: 40px; height: 40px; border-bottom: 4px solid #b45309; border-left: 4px solid #b45309;"></div>
          <div style="position: absolute; bottom: 15px; right: 15px; width: 40px; height: 40px; border-bottom: 4px solid #b45309; border-right: 4px solid #b45309;"></div>

          <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 14px; font-weight: 900; color: #b45309; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 40px;">
            សៀវភៅមគ្គុទ្ទេសក៍ឌីជីថលកម្រិតខ្ពស់
          </div>

          <div style="width: 100px; height: 3px; background-color: #b45309; margin-bottom: 40px;"></div>

          <h1 style="font-family: 'Moul', serif; font-size: 30px; color: #1c1917; line-height: 1.7; margin-bottom: 20px; max-width: 580px; font-weight: normal; text-shadow: 1px 1px 1px rgba(0,0,0,0.05);">
            ${bookIntro.title}
          </h1>

          <p style="font-family: monospace; font-size: 13.5px; font-weight: 700; color: #78716c; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 60px;">
            ${bookIntro.englishTitle}
          </p>

          <div style="width: 40px; height: 1px; background-color: #b45309; margin-bottom: 45px;"></div>

          <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 14px; font-weight: 800; color: #44403c; margin-bottom: 8px;">
            រៀបរៀងដោយ៖ <span style="color: #b45309; font-weight: 900;">${bookIntro.author}</span>
          </div>
          
          <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 11px; color: #78716c; font-weight: 600;">
            បោះពុម្ភផ្សាយ៖ ${bookIntro.publishedDate}
          </div>
        </div>
      </div>
    `;
    pageCounter++;

    // ==========================================
    // PAGE 2: FOREWORD & TABLE OF CONTENTS
    // ==========================================
    htmlContent += `
      <div style="${pageStyle}">
        ${getHeaderAndFooter("អារម្ភកថា និងមាតិកា", pageCounter, totalPages)}
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-start; text-align: left; gap: 35px;">
          <!-- Foreword Section -->
          <div>
            <h2 style="font-family: 'Moul', serif; font-size: 13px; color: #b45309; margin-bottom: 12px; font-weight: normal; border-bottom: 2px solid #b45309; padding-bottom: 6px;">
              សេចក្តីថ្លែងការណ៍ និងអារម្ភកថា
            </h2>
            <p style="font-family: 'Kantumruy Pro', sans-serif; font-size: 10.5px; font-weight: 500; color: #44403c; line-height: 1.9; text-align: justify; font-style: italic; background-color: #fafaf9; border-radius: 12px; padding: 18px; border: 1px solid #e7e5e4;">
              "${bookIntro.foreword}"
            </p>
          </div>

          <!-- Table of Contents -->
          <div>
            <h2 style="font-family: 'Moul', serif; font-size: 13px; color: #b45309; margin-bottom: 15px; font-weight: normal; border-bottom: 2px solid #b45309; padding-bottom: 6px;">
              មាតិកានៃសៀវភៅ (Table of Contents)
            </h2>
            
            <div style="display: flex; flex-direction: column; gap: 12px; font-family: 'Kantumruy Pro', sans-serif;">
              ${chaptersList.map((ch, idx) => `
                <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px dashed #e7e5e4; padding-bottom: 4px;">
                  <div style="text-align: left;">
                    <span style="font-size: 11px; font-weight: 800; color: #b45309;">ជំពូកទី ${ch.number}៖ </span>
                    <span style="font-size: 11px; font-weight: 700; color: #1c1917;">${ch.title}</span>
                  </div>
                  <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #78716c;">ទំព័រ ${3 + idx * 4}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
    pageCounter++;

    // ==========================================
    // MODULES: RENDER CHAPTERS 1 TO 4
    // ==========================================
    for (const chapter of chaptersList) {
      const subSecs = chapter.subSections;
      const mid = Math.ceil(subSecs.length / 2);
      const s1 = subSecs.slice(0, mid);
      const s2 = subSecs.slice(mid);

      // Chapter Divider & Cover (1 Page)
      htmlContent += `
        <div style="${pageStyle}">
          ${getHeaderAndFooter(`ជំពូកទី ${chapter.number} (សេចក្តីផ្តើម)`, pageCounter, totalPages)}
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border: 1.5px solid #e7e5e4; padding: 35px; border-radius: 16px; position: relative; background-color: #fafaf9;">
            <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 12px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">
              ជំពូកសិក្សាស្នូលទី ${chapter.number}
            </div>
            <h2 style="font-family: 'Moul', serif; font-size: 20px; color: #1c1917; line-height: 1.6; margin-bottom: 15px; font-weight: normal; max-width: 480px;">
              ${chapter.title}
            </h2>
            <p style="font-family: monospace; font-size: 11px; font-weight: 700; color: #78716c; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 30px;">
              ${chapter.englishTitle}
            </p>
            <div style="max-width: 440px; font-family: 'Kantumruy Pro', sans-serif; font-size: 11px; font-weight: 500; color: #44403c; line-height: 1.9; text-align: justify; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 20px; font-style: italic;">
              "${chapter.description}"
            </div>
          </div>
        </div>
      `;
      pageCounter++;

      // Subsections Part 1 (1 Page)
      htmlContent += `
        <div style="${pageStyle}">
          ${getHeaderAndFooter(`ជំពូកទី ${chapter.number} • មេរៀនសិក្សា (១)`, pageCounter, totalPages)}
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-start; gap: 25px;">
            ${s1.map(sec => `
              <div style="text-align: left;">
                <h3 style="font-family: 'Moul', serif; font-size: 12px; color: #b45309; margin-bottom: 10px; line-height: 1.5; font-weight: normal; border-bottom: 1px solid #f5f5f4; padding-bottom: 4px;">
                  • ${sec.title}
                </h3>
                <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 10.5px; font-weight: 500; color: #292524; line-height: 1.85; text-align: justify;">
                  ${sec.content.map(p => {
                    if (p.startsWith("•") || p.startsWith("-")) {
                      return `<p style="margin-bottom: 8px; padding-left: 15px; border-left: 2px solid #d97706; font-weight: 600;">${p}</p>`;
                    }
                    return `<p style="margin-bottom: 10px; text-indent: 18px;">${p}</p>`;
                  }).join("")}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
      pageCounter++;

      // Subsections Part 2 (1 Page)
      htmlContent += `
        <div style="${pageStyle}">
          ${getHeaderAndFooter(`ជំពូកទី ${chapter.number} • មេរៀនសិក្សា (២)`, pageCounter, totalPages)}
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-start; gap: 25px;">
            ${s2.map(sec => `
              <div style="text-align: left;">
                <h3 style="font-family: 'Moul', serif; font-size: 12px; color: #b45309; margin-bottom: 10px; line-height: 1.5; font-weight: normal; border-bottom: 1px solid #f5f5f4; padding-bottom: 4px;">
                  • ${sec.title}
                </h3>
                <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 10.5px; font-weight: 500; color: #292524; line-height: 1.85; text-align: justify;">
                  ${sec.content.map(p => {
                    if (p.startsWith("•") || p.startsWith("-")) {
                      return `<p style="margin-bottom: 8px; padding-left: 15px; border-left: 2px solid #d97706; font-weight: 600;">${p}</p>`;
                    }
                    return `<p style="margin-bottom: 10px; text-indent: 18px;">${p}</p>`;
                  }).join("")}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
      pageCounter++;

      // Case Studies & Discussion (1 Page)
      htmlContent += `
        <div style="${pageStyle}">
          ${getHeaderAndFooter(`ជំពូកទី ${chapter.number} • ករណីសិក្សានិងសំណួរ`, pageCounter, totalPages)}
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-start; text-align: left; gap: 25px;">
            <div>
              <h4 style="font-family: 'Moul', serif; font-size: 11px; color: #1c1917; margin-bottom: 12px; border-bottom: 1.5px solid #b45309; padding-bottom: 4px;">
                ករណីសិក្សាអនុវត្តជំពូកទី ${chapter.number}
              </h4>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${chapter.examples.slice(0, 1).map((ex) => `
                  <div style="border: 1px solid #e7e5e4; border-radius: 10px; padding: 12px; background-color: #fafaf9;">
                    <h5 style="font-family: 'Kantumruy Pro', sans-serif; font-size: 11px; font-weight: 800; color: #b45309; margin-bottom: 6px;">
                      ${ex.title}
                    </h5>
                    <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 9.5px; line-height: 1.7; color: #44403c; margin-bottom: 6px;">
                      <strong>ស្ថានភាព៖</strong> ${ex.scenario.substring(0, 180)}...
                    </div>
                    <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 9.5px; line-height: 1.7; color: #1c1917; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; border-radius: 6px;">
                      <strong>គន្លឹះដោះស្រាយ៖</strong> ${ex.solution.substring(0, 220)}...
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>

            <div>
              <h4 style="font-family: 'Moul', serif; font-size: 11px; color: #1c1917; margin-bottom: 12px; border-bottom: 1.5px solid #b45309; padding-bottom: 4px;">
                សំណួរពិភាក្សាស្នូល
              </h4>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${chapter.discussionQuestions.slice(0, 1).map((dq) => `
                  <div style="border: 1px dashed #b45309; border-radius: 10px; padding: 12px; background-color: #fffbeb;">
                    <p style="font-family: 'Kantumruy Pro', sans-serif; font-size: 10.5px; font-weight: 700; color: #1c1917; line-height: 1.7; margin-bottom: 6px;">
                      ${dq.question}
                    </p>
                    <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 9.5px; line-height: 1.7; color: #78716c;">
                      <strong>ការណែនាំ៖</strong> ${dq.guidelines}
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </div>
      `;
      pageCounter++;
    }

    // Write all pages content and append to print container
    printContainer.innerHTML = htmlContent;
    document.body.appendChild(printContainer);

    // Wait a moment for rendering and fonts
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Instantiate jsPDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pages = printContainer.children;
    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i] as HTMLElement;
      
      const canvas = await html2canvas(pageEl, {
        scale: 1.5, // 1.5 scale is high-quality but produces lighter, fast-loading PDF files for whole books
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.90);
      
      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
    }

    pdf.save(`សៀវភៅទាំងមូល_${bookIntro.title.replace(/\s+/g, "_")}.pdf`);
    
    document.body.removeChild(printContainer);
    showToast("បានទាញយកសៀវភៅទាំងមូលជា PDF ដោយជោគជ័យ! 📚🎉");
  } catch (error) {
    console.error("Error generating full book PDF:", error);
    showToast("មានបញ្ហាក្នុងការទាញយក PDF សៀវភៅទាំងមូល! ❌");
  }
}
