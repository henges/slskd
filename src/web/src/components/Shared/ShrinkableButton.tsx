import React, { ReactNode } from 'react';

import { useMediaQuery } from 'react-responsive';
import { Button, ButtonProps, Icon, Popup, SemanticICONS } from 'semantic-ui-react';

export interface ShrinkableButtonProps extends ButtonProps {
  icon: SemanticICONS, 
  loading: boolean, 
  mediaQuery: string, 
  children: ReactNode, 
  onClick?: (event: React.MouseEvent<HTMLButtonElement>, data: ButtonProps) => void
}

const ShrinkableButton = ({ icon, loading, mediaQuery, children, ...rest }: ShrinkableButtonProps) => {
  const shouldShrink = useMediaQuery({ query: mediaQuery });

  if (!shouldShrink) {
    return (
      <Button {...rest}>
        <Icon name={icon} loading={loading}/>
        {children}
      </Button>
    );
  }

  return (
    <Popup
      content={children}
      trigger={
        <Button icon {...rest}>
          <Icon name={icon} loading={loading}/>
        </Button>
      }
    />
  );
};

export default ShrinkableButton;