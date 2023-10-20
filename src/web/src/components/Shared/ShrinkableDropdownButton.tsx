import React, { ReactNode } from 'react';

import {
  Button,
  ButtonProps,
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  SemanticCOLORS,
  SemanticICONS,
} from 'semantic-ui-react';

import ShrinkableButton from './ShrinkableButton';

export interface ShrinkableDropdownButtonProps {
  color?: SemanticCOLORS, 
  icon: SemanticICONS,
  mediaQuery?: string, 
  disabled: boolean,
  loading: boolean, 
  options: DropdownItemProps[], 
  onClick: (event: React.MouseEvent<HTMLButtonElement>, data: ButtonProps) => void, 
  onChange: (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => void, 
  hidden?: boolean, 
  children?: ReactNode,
}

const ShrinkableDropdownButton = ({ 
  color, 
  icon,
  mediaQuery, 
  disabled,
  loading, 
  options, 
  onClick, 
  onChange, 
  hidden, 
  children,
}: ShrinkableDropdownButtonProps) => {
  if (hidden) {
    return <></>;
  }

  return (
    <Button.Group color={color}>
      <ShrinkableButton
        icon={icon}
        onClick={onClick}
        mediaQuery={mediaQuery}
        disabled={disabled}
        loading={loading}
      >{children}</ShrinkableButton>
      <Dropdown
        disabled={disabled}
        className='button icon'
        options={options}
        onChange={onChange}
        trigger={<></>}
      />
    </Button.Group>
  );
};

export default ShrinkableDropdownButton;