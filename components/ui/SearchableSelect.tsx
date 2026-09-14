"use client";

import { useEffect, useRef, useState } from "react";

type Option = {
  id: number;
  name: string;
};

type Props = {
  options: Option[];
  value: number | null;
  onChange: (id: number) => void;
  placeholder: string;
};

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
}: Props) {

    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);

const wrapperRef = useRef<HTMLDivElement>(null);
    const filteredOptions = options.filter((option) =>
  option.name.toLowerCase().includes(search.toLowerCase())
);

useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, []);

 return (
  <div
    ref={wrapperRef}
    className="relative"
  >

    <input
  type="text"
  value={search}
  onChange={(e) => {
    setSearch(e.target.value);
    setIsOpen(true);
  }}
  onFocus={() => setIsOpen(true)}
  placeholder={placeholder}
  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white placeholder:text-zinc-500"
/>

    {isOpen && (
  <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900">

      {filteredOptions.length === 0 ? (

  <div className="px-4 py-3 text-sm text-zinc-500">
    No results found.
  </div>

) : (

  filteredOptions.map((option) => (

    <button
      key={option.id}
      type="button"
      onClick={() => {
        onChange(option.id);
        setSearch(option.name);
        setIsOpen(false);
      }}
      className="block w-full px-4 py-3 text-left text-white hover:bg-zinc-800"
    >
      {option.name}
    </button>

  ))

)}

    </div>
    )}

  </div>

);
}