import { useNavigation } from "@/context/navigation";
import Link from "next/link";
import { FC, HTMLAttributes, useCallback, useEffect } from "react";

export interface LinksProps extends HTMLAttributes<HTMLElement> {
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}

export const Links: FC<LinksProps> = (props: LinksProps) => {
  const [location, setLocation] = useNavigation()

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

  const generateStyle = useCallback((index: number) => {
    if (location != index) {
      return "text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 font-medium text-center my-auto";
    } else {
      return "bg-gray-900 text-white block rounded-md px-3 py-2 text-center my-auto font-medium";
    }
  }, [location]);

  return (
    <div className={props.className}>
      {links.map((e: any, index: number) => {
        return (
          <Link
            key={`link-${index}`}
            href={e.href}
            className={generateStyle(index)}
            onClick={() => setLocation(index)}
          >
            {e.name}
          </Link>
        );
      })}
    </div>
  );
};