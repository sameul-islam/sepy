"use client";

import { MdCheck } from "react-icons/md";

type AvailabilityFilterProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function AvailabilityFilter({
  checked,
  onChange,
}: AvailabilityFilterProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-1">
      <span>
        <span className="block text-sm font-medium text-[#171717]">
          In-stock products
        </span>

        <span className="mt-1 block text-xs text-[#85857e]">
          Show products currently available to buy
        </span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="peer sr-only"
      />

      <span
        aria-hidden="true"
        className={`flex size-5 shrink-0 items-center justify-center border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#171717] ${
          checked
            ? "border-[#171717] bg-[#171717] text-white"
            : "border-[#cfcfc8] bg-white text-transparent"
        }`}
      >
        <MdCheck size={15} />
      </span>
    </label>
  );
}