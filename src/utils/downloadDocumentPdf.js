import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/*
|--------------------------------------------------------------------------
| Download Document PDF
|--------------------------------------------------------------------------
|
| Renders a DOM node (the printable invoice / PO template) to a
| multi-page A4 PDF and triggers a browser download. Used instead of a
| server-side renderer so the exact same HTML/CSS the user previews on
| screen is what ends up in the PDF — no separate template to keep in
| sync.
|--------------------------------------------------------------------------
*/

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export const downloadDocumentPdf = async (node, filename = "document.pdf") => {
  if (!node) {
    throw new Error("Nothing to export — the document did not render.");
  }

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
  });

  const imgWidth = A4_WIDTH_MM;
  const pageHeight = A4_HEIGHT_MM;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgData = canvas.toDataURL("image/png", 1.0);

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, "", "FAST");
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;

    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, "", "FAST");
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
};

export default downloadDocumentPdf;
