import { forwardRef } from "react";

/*
|--------------------------------------------------------------------------
| Purchase Order Template
|--------------------------------------------------------------------------
|
| Same rendering approach as InvoiceTemplate — plain hex inline styles
| only (no Tailwind color classes) so html2canvas can rasterize it
| reliably for the PDF download. Layout follows a standard corporate PO:
| buyer header, PO meta, supplier/ship-to, line items, totals, terms and
| an authorization block.
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
  background: "#1e3a8a",
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

const statusColors = {
  ADMIN_ISSUED: "#2563eb",
  TRAINER_CONFIRMED: "#059669",
  TRAINER_REJECTED: "#dc2626",
  CANCELLED: "#64748b",
};

const statusLabels = {
  ADMIN_ISSUED: "Sent to Trainer",
  TRAINER_CONFIRMED: "Confirmed",
  TRAINER_REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const PurchaseOrderTemplate = forwardRef(({ purchaseOrder }, ref) => {
  if (!purchaseOrder) return null;

  const {
    poNumber,
    status,
    poDate,
    expectedDeliveryDate,
    deliveryLocation,
    buyer = {},
    supplier = {},
    shipTo = {},
    sameAsBuyer,
    items = [],
    currency = "INR",
    taxType,
    subtotal,
    cgstAmount,
    sgstAmount,
    igstAmount,
    shippingCharges,
    otherCharges,
    roundOff,
    grandTotal,
    amountInWords,
    paymentTerms,
    termsAndConditions,
    notes,
    authorizedBy,
  } = purchaseOrder;

  const shipParty = sameAsBuyer ? buyer : shipTo;

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
          borderBottom: "3px solid #1e3a8a",
          paddingBottom: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ maxWidth: "60%" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#1e3a8a" }}>
            {buyer.name || "Your Company Name"}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#475569",
              marginTop: "4px",
              lineHeight: 1.5,
            }}
          >
            {buyer.address && <div>{buyer.address}</div>}
            <div>
              {[buyer.city, buyer.state, buyer.pincode]
                .filter(Boolean)
                .join(", ")}
            </div>
            {buyer.country && <div>{buyer.country}</div>}
            {buyer.gstin && <div>GSTIN: {buyer.gstin}</div>}
            {(buyer.email || buyer.phone) && (
              <div>
                {buyer.email}
                {buyer.email && buyer.phone ? " | " : ""}
                {buyer.phone}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#1e3a8a",
              letterSpacing: "0.04em",
            }}
          >
            PURCHASE ORDER
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: "4px",
              padding: "2px 10px",
              borderRadius: "999px",
              fontSize: "10px",
              fontWeight: 700,
              color: "#ffffff",
              background: statusColors[status] || "#64748b",
            }}
          >
            {statusLabels[status] || (status || "").replace(/_/g, " ")}
          </div>
          <table
            style={{ marginTop: "8px", fontSize: "11px", marginLeft: "auto" }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "2px 8px 2px 0", color: "#64748b" }}>
                  PO No.
                </td>
                <td style={{ padding: "2px 0", fontWeight: 700 }}>
                  {poNumber}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "2px 8px 2px 0", color: "#64748b" }}>
                  PO Date
                </td>
                <td style={{ padding: "2px 0" }}>{formatDate(poDate)}</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 8px 2px 0", color: "#64748b" }}>
                  Delivery By
                </td>
                <td style={{ padding: "2px 0" }}>
                  {formatDate(expectedDeliveryDate)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier / Ship To */}
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
            Supplier / Vendor
          </div>
          <div style={{ fontSize: "12px", fontWeight: 700 }}>
            {supplier.name || "—"}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#475569",
              lineHeight: 1.5,
              marginTop: "2px",
            }}
          >
            {supplier.contactPerson && (
              <div>Attn: {supplier.contactPerson}</div>
            )}
            {supplier.address && <div>{supplier.address}</div>}
            <div>
              {[supplier.city, supplier.state, supplier.pincode]
                .filter(Boolean)
                .join(", ")}
            </div>
            {supplier.gstin && <div>GSTIN: {supplier.gstin}</div>}
            {(supplier.email || supplier.phone) && (
              <div>
                {supplier.email}
                {supplier.email && supplier.phone ? " | " : ""}
                {supplier.phone}
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
            {deliveryLocation && (
              <div>Delivery Location: {deliveryLocation}</div>
            )}
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
            <th style={{ ...th, width: "34%" }}>Description</th>
            <th style={{ ...th, width: "10%" }}>HSN/SAC</th>
            <th style={{ ...th, width: "9%", textAlign: "right" }}>Qty</th>
            <th style={{ ...th, width: "12%", textAlign: "right" }}>
              Unit Price
            </th>
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
                {item.taxPercent || 0}%
              </td>
              <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>
                {money(item.amount, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
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

          {paymentTerms && (
            <div style={{ marginTop: "14px" }}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                Payment Terms
              </div>
              <div style={{ fontSize: "11px", marginTop: "4px" }}>
                {paymentTerms}
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
            {otherCharges > 0 && (
              <tr>
                <td style={{ padding: "4px 8px", color: "#475569" }}>
                  Other Charges
                </td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {money(otherCharges, currency)}
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
                  background: "#1e3a8a",
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
                  background: "#1e3a8a",
                  color: "#ffffff",
                  borderRadius: "0 4px 4px 0",
                }}
              >
                {money(grandTotal, currency)}
              </td>
            </tr>
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
            For {buyer.name || "the Company"}
          </div>
          <div style={{ height: "48px" }} />
          <div
            style={{
              borderTop: "1px solid #94a3b8",
              paddingTop: "4px",
              fontSize: "11px",
            }}
          >
            {authorizedBy || "Authorized Signatory"}
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
        This is a computer-generated purchase order. Please quote the PO number
        on your invoice.
      </div>
    </div>
  );
});

PurchaseOrderTemplate.displayName = "PurchaseOrderTemplate";

export default PurchaseOrderTemplate;
