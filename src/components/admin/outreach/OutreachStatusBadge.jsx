const styles = {
  NOT_CONTACTED: "bg-slate-100 text-slate-600",
  CONTACTED: "bg-blue-50 text-blue-700",
  INTERESTED: "bg-emerald-50 text-emerald-700",
  DECLINED: "bg-red-50 text-red-700",
  NO_RESPONSE: "bg-amber-50 text-amber-700",
  UNAVAILABLE: "bg-orange-50 text-orange-700",
};

const OutreachStatusBadge = ({ status }) => {
  const label = status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || styles.NOT_CONTACTED
      }`}
    >
      {label}
    </span>
  );
};

export default OutreachStatusBadge;
