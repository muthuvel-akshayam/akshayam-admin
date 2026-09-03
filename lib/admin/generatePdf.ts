import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export async function downloadBioDataPdf(elementId: string, filename: string) {
  const templateElement = document.getElementById(elementId);
  if (!templateElement) return;

  try {
    // Capture high-res canvas using html2canvas-pro
    const canvas = await html2canvas(templateElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      windowHeight: 1123,
    });

    const dataUrl = canvas.toDataURL("image/jpeg", 0.98);

    // Generate A4 PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    pdf.addImage(dataUrl, "JPEG", 0, 0, 210, 297);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF Generation failed:", error);
    alert("Failed to generate PDF. Please try again.");
  }
}

export async function printBioDataPdf(elementId: string) {
  const templateElement = document.getElementById(elementId);
  if (!templateElement) return;

  try {
    const canvas = await html2canvas(templateElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      windowHeight: 1123,
    });

    const dataUrl = canvas.toDataURL("image/jpeg", 0.98);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Bio-Data</title>
            <style>
              @media print {
                @page { margin: 0; size: A4 portrait; }
                body { margin: 0; }
              }
              body { margin: 0; text-align: center; }
              img { width: 210mm; min-height: 297mm; display: block; margin: 0 auto; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  } catch (error) {
    console.error("Print failed:", error);
    alert("Failed to print Bio-Data. Please try again.");
  }
}
