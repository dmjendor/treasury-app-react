import Link from "next/link";
import ImgIcon from "@/app/_components/ImgIcon";
import RaIcon from "@/app/_components/RaIcon";

function isSvgPath(icon) {
  return (
    typeof icon === "string" && icon.startsWith("/") && icon.endsWith(".svg")
  );
}

function isRAIcon(icon) {
  return typeof icon === "string" && icon.startsWith("ra-");
}

function isReactIcon(icon) {
  return typeof icon === "function";
}

export default function NavLink({ href, icon, label, active }) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-white/10 text-ink-900"
          : "text-ink-700 hover:bg-white/5 hover:text-ink-900",
      ].join(" ")}
    >
      {isSvgPath(icon) ? (
        <ImgIcon
          src={icon}
          className="h-5 w-5 opacity-80"
        />
      ) : isRAIcon(icon) ? (
        <RaIcon
          name={icon}
          className="text-lg opacity-80"
        />
      ) : isReactIcon(icon) ? (
        (() => {
          const IconComponent = icon;
          return <IconComponent className="h-5 w-5 opacity-80" />;
        })()
      ) : null}

      <span className="truncate">{label}</span>
    </Link>
  );
}
