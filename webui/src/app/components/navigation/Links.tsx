import Link from "next/link";
import { FC, HTMLAttributes, useEffect } from "react";

export interface LinksProps extends HTMLAttributes<HTMLElement> {
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}

export const Links: FC<LinksProps> = (props: LinksProps) => {
  const links = [
    {
      href: "/dashboard",
      name: "Dashboard",
    },
    {
      href: "/",
      name: "Home",
    },
  ];

  const generateStyle = (index: number) => {
    if (index != props.active) {
      return "text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium";
    } else {
      return "bg-gray-900 text-white block rounded-md px-3 py-2 text-base font-medium";
    }
  };

  return (
    <div className={props.className}>
      {links.map((e: any, index: number) => {
        return (
          <Link
            key={`link-${index}`}
            href={e.href}
            className={generateStyle(index)}
            onClick={() => props.setActive(index)}
          >
            {e.name}
          </Link>
        );
      })}
    </div>
  );
};

//bg-gray-900 text-white block rounded-md px-3 py-2 text-base font-medium

//text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium
