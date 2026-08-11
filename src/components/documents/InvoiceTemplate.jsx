import { forwardRef } from "react";

/*
|--------------------------------------------------------------------------
| Invoice Template
|--------------------------------------------------------------------------
|
| A print-ready tax invoice laid out the way real invoicing software
| (Tally / Zoho Invoice / QuickBooks) formats a GST invoice: company
| header, invoice meta block, bill-to/ship-to, a line-item table with
| HSN/SAC + tax breakup, totals, amount in words, bank details, terms
| and a signatory block.
|
| NOTE: every color below is a plain hex value via inline style, not a
| Tailwind utility class. html2canvas (used to turn this into a PDF on
| download) cannot parse modern CSS color functions like oklch(), which
| is what Tailwind v4's default palette compiles to — so this template
| deliberately avoids Tailwind color classes to guarantee the exported
| PDF renders correctly.
|--------------------------------------------------------------------------
*/

const money = (value, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";

  const amount = Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol} ${amount}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const th = {
  border: "1px solid #cbd5e1",
  padding: "6px 8px",
  background: "#0f172a",
  color: "#ffffff",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  textAlign: "left",
};

const td = {
  border: "1px solid #e2e8f0",
  padding: "6px 8px",
  fontSize: "11px",
  color: "#1e293b",
  verticalAlign: "top",
};

const InvoiceTemplate = forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const {
    invoiceNumber,
    invoiceType,
    invoiceDate,
    dueDate,
    placeOfSupply,
    billFrom = {},
    billTo = {},
    shipTo = {},
    sameAsBillTo,
    items = [],
    currency = "INR",
    taxType,
    subtotal,
    totalDiscount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    shippingCharges,
    roundOff,
    grandTotal,
    amountInWords,
    amountPaid,
    balanceDue,
    bankDetails = {},
    termsAndConditions,
    notes,
    authorizedSignatory,
  } = invoice;

  const shipParty = sameAsBillTo ? billTo : shipTo;

  return (
    <div
      ref={ref}
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        padding: "10mm",
        background: "#ffffff",
        fontFamily: "'Helvetica Neue', Arial, 'Segoe UI', sans-serif",
        color: "#1e293b",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "3px solid #0f172a",
          paddingBottom: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ maxWidth: "60%" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
            {billFrom.name || "Your Company Name"}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#475569",
              marginTop: "4px",
              lineHeight: 1.5,
            }}
          >
            {billFrom.address && <div>{billFrom.address}</div>}
            <div>
              {[billFrom.city, billFrom.state, billFrom.pincode]
                .filter(Boolean)
                .join(", ")}
            </div>
            {billFrom.country && <div>{billFrom.country}</div>}
            {billFrom.gstin && <div>GSTIN: {billFrom.gstin}</div>}
            {billFrom.pan && <div>PAN: {billFrom.pan}</div>}
            {(billFrom.email || billFrom.phone) && (
              <div>
                {billFrom.email}
                {billFrom.email && billFrom.phone ? " | " : ""}
                {billFrom.phone}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "0.04em",
            }}
          >
            {invoiceType === "PROFORMA_INVOICE"
              ? "PROFORMA INVOICE"
              : invoiceType === "CREDIT_NOTE"
                ? "CREDIT NOTE"
                : "TAX INVOICE"}
          </div>
          <table style={{ marginTop: "8px", fontSize: "11px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "2px 8px 2px 0", color: "#64748b" }}>
                  Invoice No.
                </td>
                <td style={{ padding: "2px 0", fontWeight: 700 }}>
                  {invoiceNumber}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "2px 8px 2px 0", color: "#64748b" }}>
                  Invoice Date
                </td>
                <td style={{ padding: "2px 0" }}>{formatDate(invoiceDate)}</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 8px 2px 0", color: "#64748b" }}>
                  Due Date
                </td>
                <td style={{ padding: "2px 0" }}>{formatDate(dueDate)}</td>
              </tr>
              {placeOfSupply && (
                <tr>
                  <td style={{ padding: "2px 8px 2px 0", color: "#64748b" }}>
                    Place of Supply
                  </td>
                  <td style={{ padding: "2px 0" }}>{placeOfSupply}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill To / Ship To */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <div
          style={{
            flex: 1,
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            padding: "10px 12px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            Bill To
          </div>
          <div style={{ fontSize: "12px", fontWeight: 700 }}>
            {billTo.name || "—"}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#475569",
              lineHeight: 1.5,
              marginTop: "2px",
            }}
          >
            {billTo.address && <div>{billTo.address}</div>}
            <div>
              {[billTo.city, billTo.state, billTo.pincode]
                .filter(Boolean)
                .join(", ")}
            </div>
            {billTo.gstin && <div>GSTIN: {billTo.gstin}</div>}
            {(billTo.email || billTo.phone) && (
              <div>
                {billTo.email}
                {billTo.email && billTo.phone ? " | " : ""}
                {billTo.phone}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            padding: "10px 12px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            Ship To
          </div>
          <div style={{ fontSize: "12px", fontWeight: 700 }}>
            {shipParty.name || "—"}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#475569",
              lineHeight: 1.5,
              marginTop: "2px",
            }}
          >
            {shipParty.address && <div>{shipParty.address}</div>}
            <div>
              {[shipParty.city, shipParty.state, shipParty.pincode]
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "4px",
        }}
      >
        <thead>
          <tr>
            <th style={{ ...th, width: "5%" }}>#</th>
            <th style={{ ...th, width: "29%" }}>Description</th>
            <th style={{ ...th, width: "10%" }}>HSN/SAC</th>
            <th style={{ ...th, width: "8%", textAlign: "right" }}>Qty</th>
            <th style={{ ...th, width: "10%", textAlign: "right" }}>Rate</th>
            <th style={{ ...th, width: "8%", textAlign: "right" }}>Disc %</th>
            <th style={{ ...th, width: "8%", textAlign: "right" }}>Tax %</th>
            <th style={{ ...th, width: "12%", textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item._id || index}>
              <td style={td}>{index + 1}</td>
              <td style={td}>{item.description}</td>
              <td style={td}>{item.hsnSacCode || "—"}</td>
              <td style={{ ...td, textAlign: "right" }}>
                {item.quantity} {item.unit}
              </td>
              <td style={{ ...td, textAlign: "right" }}>
                {money(item.rate, currency)}
              </td>
              <td style={{ ...td, textAlign: "right" }}>
                {item.discountPercent || 0}%
              </td>
              <td style={{ ...td, textAlign: "right" }}>
                {item.taxPercent || 0}%
              </td>
              <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>
                {money(item.amount, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals + Amount in words */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "10px",
          gap: "16px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            Amount in Words
          </div>
          <div
            style={{ fontSize: "11px", fontStyle: "italic", marginTop: "4px" }}
          >
            {amountInWords || "—"}
          </div>

          {(bankDetails.accountNumber || bankDetails.upiId) && (
            <div style={{ marginTop: "14px" }}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                Payment Details
              </div>
              <div
                style={{ fontSize: "11px", lineHeight: 1.6, marginTop: "4px" }}
              >
                {bankDetails.accountName && (
                  <div>Account Name: {bankDetails.accountName}</div>
                )}
                {bankDetails.bankName && (
                  <div>
                    Bank: {bankDetails.bankName}
                    {bankDetails.branch ? `, ${bankDetails.branch}` : ""}
                  </div>
                )}
                {bankDetails.accountNumber && (
                  <div>Account No: {bankDetails.accountNumber}</div>
                )}
                {bankDetails.ifscCode && (
                  <div>IFSC: {bankDetails.ifscCode}</div>
                )}
                {bankDetails.upiId && <div>UPI: {bankDetails.upiId}</div>}
              </div>
            </div>
          )}
        </div>

        <table
          style={{
            minWidth: "260px",
            fontSize: "11px",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: "4px 8px", color: "#475569" }}>Subtotal</td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>
                {money(subtotal, currency)}
              </td>
            </tr>
            {totalDiscount > 0 && (
              <tr>
                <td style={{ padding: "4px 8px", color: "#475569" }}>
                  Discount
                </td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  - {money(totalDiscount, currency)}
                </td>
              </tr>
            )}
            {taxType === "INTER_STATE" ? (
              <tr>
                <td style={{ padding: "4px 8px", color: "#475569" }}>IGST</td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {money(igstAmount, currency)}
                </td>
              </tr>
            ) : taxType === "INTRA_STATE" ? (
              <>
                <tr>
                  <td style={{ padding: "4px 8px", color: "#475569" }}>CGST</td>
                  <td style={{ padding: "4px 0", textAlign: "right" }}>
                    {money(cgstAmount, currency)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "4px 8px", color: "#475569" }}>SGST</td>
                  <td style={{ padding: "4px 0", textAlign: "right" }}>
                    {money(sgstAmount, currency)}
                  </td>
                </tr>
              </>
            ) : null}
            {shippingCharges > 0 && (
              <tr>
                <td style={{ padding: "4px 8px", color: "#475569" }}>
                  Shipping
                </td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {money(shippingCharges, currency)}
                </td>
              </tr>
            )}
            {roundOff !== 0 && (
              <tr>
                <td style={{ padding: "4px 8px", color: "#475569" }}>
                  Round Off
                </td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {money(roundOff, currency)}
                </td>
              </tr>
            )}
            <tr>
              <td
                style={{
                  padding: "8px",
                  fontWeight: 800,
                  fontSize: "13px",
                  background: "#0f172a",
                  color: "#ffffff",
                  borderRadius: "4px 0 0 4px",
                }}
              >
                Grand Total
              </td>
              <td
                style={{
                  padding: "8px",
                  fontWeight: 800,
                  fontSize: "13px",
                  textAlign: "right",
                  background: "#0f172a",
                  color: "#ffffff",
                  borderRadius: "0 4px 4px 0",
                }}
              >
                {money(grandTotal, currency)}
              </td>
            </tr>
            {amountPaid > 0 && (
              <>
                <tr>
                  <td style={{ padding: "4px 8px", color: "#475569" }}>
                    Amount Paid
                  </td>
                  <td style={{ padding: "4px 0", textAlign: "right" }}>
                    {money(amountPaid, currency)}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "4px 8px",
                      color: "#475569",
                      fontWeight: 700,
                    }}
                  >
                    Balance Due
                  </td>
                  <td
                    style={{
                      padding: "4px 0",
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {money(balanceDue, currency)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Terms + Signature */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "28px",
          gap: "16px",
        }}
      >
        <div style={{ flex: 1.4 }}>
          {termsAndConditions && (
            <>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                Terms &amp; Conditions
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#475569",
                  whiteSpace: "pre-line",
                  lineHeight: 1.6,
                  marginTop: "4px",
                }}
              >
                {termsAndConditions}
              </div>
            </>
          )}
          {notes && (
            <div
              style={{ fontSize: "10px", color: "#475569", marginTop: "8px" }}
            >
              <strong>Notes:</strong> {notes}
            </div>
          )}
        </div>

        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#475569" }}>
            For {billFrom.name || "the Company"}
          </div>
          <div style={{ height: "48px" }} />
          <div
            style={{
              borderTop: "1px solid #94a3b8",
              paddingTop: "4px",
              fontSize: "11px",
            }}
          >
            {authorizedSignatory || "Authorized Signatory"}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "24px",
          paddingTop: "10px",
          borderTop: "1px solid #e2e8f0",
          fontSize: "9px",
          color: "#94a3b8",
          textAlign: "center",
        }}
      >
        This is a computer-generated invoice and does not require a physical
        signature.
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = "InvoiceTemplate";

export default InvoiceTemplate;
