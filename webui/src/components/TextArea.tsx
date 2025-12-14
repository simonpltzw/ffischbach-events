import { FC, HTMLAttributes } from "react";

export interface TextAreaProps extends HTMLAttributes<HTMLTextAreaElement> {
    value: string
}

export const TextArea: FC<TextAreaProps> = (props: TextAreaProps) => {
  return (
    <textarea
      spellCheck={false}
      onChange={props.onChange}
      className={`border-2 border-neutral-400 outline-none focus:border-blue-500 rounded p-2 ${props.className}`}
     value={props.value}>
      
    </textarea>
  );
};
