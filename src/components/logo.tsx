import Link from "next/link";

export function Logo({ compact = false, inverse = false, href = "/" }: { compact?: boolean; inverse?: boolean; href?: string }) {
  return (
    <Link aria-label="MatchCV — início" className="inline-flex items-center gap-2.5" href={href}>
      <span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-[#145c43] text-[13px] font-black tracking-[-0.08em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)]">
        MC
      </span>
      {!compact && <span className={`text-lg font-extrabold tracking-[-0.04em] ${inverse ? "text-white" : "text-[#17211b]"}`}>MatchCV</span>}
    </Link>
  );
}
