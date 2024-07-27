import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { FC, HTMLAttributes } from "react";

export interface InfoBadeProps extends HTMLAttributes<HTMLElement> {
  text: string;
}

export const InfoBadge: FC<InfoBadeProps> = (props: InfoBadeProps) => {
  return (
    <div className="flex flex-row items-center gap-3 w-1/3 p-3 bg-gray-200 dark:bg-gray-900 rounded">
      <InformationCircleIcon height={20} />
      {props.text}
    </div>
  );
};
