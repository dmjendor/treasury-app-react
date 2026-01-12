import Link from "next/link";
import IconComponent from "@/app/_components/IconComponent";

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
      <IconComponent icon={icon} />

      <span className="truncate">{label}</span>
    </Link>
  );
}
