import { ChangeEvent, FC, ReactNode } from "react";
import { Input } from "./Input";
import { Table, TBody, TD, TH, THead, TR } from "./table/Table";
import { Spinner } from "./Spinner";

export interface DataListProps {
  title: string;
  tableHeaders: string[];

  generateList(): ReactNode[];
  actions?: ReactNode;

  filter?: string;
  dispatchCb(value: string): void;
  isPending?: boolean;

  createComponent?: ReactNode;
  colSpan: number;
  disabled: boolean;
}

export const DataList: FC<DataListProps> = (props: DataListProps) => {
  const generateNodes = () => {
    const list = props.generateList();

    if (list.length > 0) {
      return list;
    } else {
      return (
        <TR disabled>
          <TD colspan={props.colSpan}>
            <div className="flex w-full justify-center">
              {props.isPending ? <Spinner /> : "Keine Einträge gefunden"}
            </div>
          </TD>
        </TR>
      );
    }
  };

  return (
    <div className="flex flex-col gap-2 border dark:border-0 dark:bg-gray-900/40 shadow p-3 rounded-lg">
      <label className="text-base font-bold">{props.title}</label>
      <div className="flex flex-col gap-5 items-end">
        {props.actions}
        {props.createComponent}
        <Input
          disabled={props.disabled}
          containerClassName="w-full"
          value={props.filter ?? ""}
          title="Suche"
          placeholder=""
          onChange={(e: ChangeEvent<HTMLInputElement>) => props.dispatchCb(e.target.value)}
        />
      </div>
      <Table className="border-0 dark:border-0 shadow-none">
        <THead>
          <tr>
            {props.tableHeaders.map((th, index) => (
              <TH key={`${props.title}-${index}`}>{th}</TH>
            ))}
          </tr>
        </THead>
        <TBody>
          <>{generateNodes()}</>
        </TBody>
      </Table>
    </div>
  );
};
