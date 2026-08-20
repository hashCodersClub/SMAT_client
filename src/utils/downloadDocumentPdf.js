import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export const downloadDocumentPdf = async (nodeOrType, filenameOrDoc = "document.pdf") => {
  let targetNode = nodeOrType;
  let filename = typeof filenameOrDoc === "string" ? filenameOrDoc : "document.pdf";
  let tempContainer = null;

  // If nodeOrType is a string identifier ("PO" or "INVOICE"), build enterprise HTML template
  if (typeof nodeOrType === "string") {
    const docType = nodeOrType.toUpperCase();
    const docData = typeof filenameOrDoc === "object" ? filenameOrDoc : {};

    filename = `${docType === "PO" ? docData.poNumber || "PO" : docData.invoiceNumber || "INVOICE"}.pdf`;

    tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.width = "800px";
    tempContainer.style.background = "#ffffff";
    tempContainer.style.padding = "32px";
    tempContainer.style.fontFamily = "system-ui, -apple-system, sans-serif";

    const docNo = docData.poNumber || docData.invoiceNumber || "DOC-001";
    const docDate = docData.poDate || docData.invoiceDate || docData.createdAt || new Date();
    const formattedDate = new Date(docDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const items = docData.items || [
      {
        description: docData.requirementId?.title || docData.notes || "Professional Corporate Training Services",
        quantity: 1,
        rate: docData.totalAmount || docData.grandTotal || 0,
        amount: docData.totalAmount || docData.grandTotal || 0,
      },
    ];

    const totalAmt = docData.totalAmount || docData.grandTotal || 0;

    tempContainer.innerHTML = `
      <div style="border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #6366f1; padding-bottom: 20px;">
          <div>
            <div style="font-size: 24px; font-weight: 900; color: #4f46e5; letter-spacing: -0.5px;">TRAINEXUS</div>
            <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-top: 2px;">Corporate Training Operations & Marketplace</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 900; color: #0f172a;">${docType === "PO" ? "PURCHASE ORDER" : "TAX INVOICE"}</div>
            <div style="font-size: 12px; font-weight: 800; color: #4f46e5; margin-top: 4px;">#${docNo}</div>
            <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-top: 2px;">Date: ${formattedDate}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; gap: 20px; margin-top: 24px; font-size: 12px;">
          <div style="flex: 1; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9;">
            <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Issued By</div>
            <div style="font-weight: 800; color: #0f172a; margin-top: 4px;">${docData.buyer?.name || docData.vendorId?.name || "Nxthack IT Solutions"}</div>
            <div style="color: #64748b; margin-top: 2px;">India</div>
          </div>

          <div style="flex: 1; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9;">
            <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Issued To</div>
            <div style="font-weight: 800; color: #0f172a; margin-top: 4px;">${docData.supplier?.name || docData.trainerId?.name || docData.trainer?.name || "Assigned Trainer"}</div>
            <div style="color: #64748b; margin-top: 2px;">Verified Partner</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 28px; font-size: 12px;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff; text-align: left; font-size: 11px; font-weight: 800;">
              <th style="padding: 10px 14px; border-radius: 8px 0 0 8px;">Description</th>
              <th style="padding: 10px 14px; text-align: center;">Qty</th>
              <th style="padding: 10px 14px; text-align: right;">Rate</th>
              <th style="padding: 10px 14px; text-align: right; border-radius: 0 8px 8px 0;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 14px; font-weight: 600; color: #1e293b;">${item.description || "Training Delivery"}</td>
                <td style="padding: 12px 14px; text-align: center; font-weight: 600; color: #475569;">${item.quantity || 1}</td>
                <td style="padding: 12px 14px; text-align: right; font-weight: 600; color: #475569;">₹${Number(item.rate || 0).toLocaleString("en-IN")}</td>
                <td style="padding: 12px 14px; text-align: right; font-weight: 800; color: #0f172a;">₹${Number(item.amount || 0).toLocaleString("en-IN")}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; padding-top: 20px; border-top: 2px solid #f1f5f9;">
          <div style="background: #e0e7ff; padding: 10px 16px; border-radius: 99px; font-size: 11px; font-weight: 800; color: #3730a3; display: flex; align-items: center; gap: 6px;">
            <span>✓ VERIFIED DIGITAL DOCUMENT</span>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b;">Total Value</div>
            <div style="font-size: 26px; font-weight: 900; color: #4f46e5; margin-top: 2px;">₹${Number(totalAmt).toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div style="margin-top: 48px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 16px;">
          <div>Authorized Signature: ______________________</div>
          <div>Page 1 of 1</div>
        </div>
      </div>
    `;

    document.body.appendChild(tempContainer);
    targetNode = tempContainer;
  }

  if (!targetNode) {
    throw new Error("Nothing to export — the document did not render.");
  }

  try {
    const canvas = await html2canvas(targetNode, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: targetNode.scrollWidth,
      windowHeight: targetNode.scrollHeight,
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
  } finally {
    if (tempContainer && document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
};

export default downloadDocumentPdf;
