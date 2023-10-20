import { ReactNode } from "react";

export interface DivProps extends Record<string, unknown> {
  hidden?: boolean,
  children?: ReactNode
}

const Div = ({ hidden, children, ...rest }: DivProps) => {
  if (hidden) {
    return <></>;
  }

  return (<div {...rest}>{children}</div>);
};

export default Div;