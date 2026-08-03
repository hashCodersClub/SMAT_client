import logoDark from "../../assets/logos/trainexus.dark.png";
import logoLight from "../../assets/logos/trainexus.light.png";

/*
|--------------------------------------------------------------------------
| Logo
|--------------------------------------------------------------------------
|
| Centralizes the two brand mark variants so every layout/page imports
| one component instead of reaching into assets/logos directly. Naming
| follows the convention already used in LoginPage.jsx:
|
|   variant="dark"  -> the mark meant to sit ON a dark background
|   variant="light" -> the mark meant to sit ON a light background
|
| Usage:
|   <Logo variant="dark" className="h-6 w-6" />          // on slate-900 sidebar
|   <Logo variant="light" className="h-8" />              // on white cards
|   <Logo variant="dark" withWordmark className="h-8" />  // mark + "Trainexus" text
|
*/

const Logo = ({ variant = "light", withWordmark = false, className = "" }) => {
  const src = variant === "dark" ? logoDark : logoLight;

  if (!withWordmark) {
    return <img src={src} alt="Trainexus" className={className} />;
  }

  const textColor = variant === "dark" ? "text-white" : "text-slate-900";

  return (
    <span className="inline-flex items-center gap-2">
      <img src={src} alt="Trainexus" className={className} />
      <span className={`font-bold tracking-tight ${textColor}`}>Trainexus</span>
    </span>
  );
};

export default Logo;
