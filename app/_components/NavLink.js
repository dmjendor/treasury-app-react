import Link from "next/link";
import IconComponent from "@/app/_components/IconComponent";

export default function NavLink({ href, icon, label, active }) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-primary-600 text-primary-200"
          : "text-muted-fg hover:bg-accent-600 hover:text-fg",
      ].join(" ")}
    >
      <IconComponent
        icon={icon}
        variant={active ? "primary" : "accent"}
      />

      <span className="truncate">{label}</span>
    </Link>
  );
}
