import React from "react";
import { FC, HTMLAttributes } from "react";

export interface GeneralProps extends React.HTMLAttributes<any> {
}

export interface TRProps extends React.HTMLAttributes<HTMLTableRowElement> {
  click?: any;
  disabled?: boolean;
}

export interface TDProps extends React.HTMLAttributes<HTMLTableCellElement> {
  colspan?: number;
  click?: any;
}

export const Table: FC<GeneralProps> = (props: GeneralProps) => {
  return (
    <div className="relative overflow-x-auto border dark:border-0 shadow-md rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        {props.children}
      </table>
    </div>
  );
};

export const THead: FC<GeneralProps> = (props: GeneralProps) => {
  return (
    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-400">
      {props.children}
    </thead>
  );
};

export const TBody: FC<GeneralProps> = (props: GeneralProps) => {
  return <tbody>{props.children}</tbody>;
};

export const TR: FC<TRProps> = (props: TRProps) => {
  return (
    <tr
      onClick={(e) => {
        e.stopPropagation();
        if (!!props.onClick) {
          props.onClick(e);
        }
      }}
      className={`bg-white border-b last:border-0 dark:bg-gray-900/40 dark:border-gray-900 ${props.disabled ? 'cursor-default' : 'cursor-pointer hover:bg-gray-200 hover:dark:bg-gray-700 hover:rounded'}`}
    >
      {props.children}
    </tr>
  );
};

export const TH: FC<GeneralProps> = (props: GeneralProps) => {
  return (
    <th scope="col" className="px-6 py-3">
      {props.children}
    </th>
  );
};

export const TD: FC<TDProps> = (props: TDProps) => {
  return (
    <td
      onClick={props.click}
      colSpan={props.colspan}
      scope="row"
      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white justify-items-start"
    >
      {props.children}
    </td>
  );
};
