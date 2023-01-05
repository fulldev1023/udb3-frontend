import type { ChangeEvent } from 'react';
import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';
import { css } from 'styled-components';

import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';
import { getGlobalBorderRadius, getGlobalFormInputHeight } from './theme';

const BaseInput = forwardRef<HTMLInputElement, any>((props, ref) => (
  <Box as="input" {...props} ref={ref} />
));

BaseInput.displayName = 'BaseInput';

type InputType =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';

type InputProps = {
  type?: InputType;
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  isInvalid?: boolean;
  accept?: string;
  disabled?: boolean;
};

type Props = Omit<BoxProps, 'onChange'> & InputProps;

const Input = forwardRef(
  (
    {
      type,
      id,
      placeholder,
      onChange,
      onBlur,
      onPaste,
      onFocus,
      onKeyDown,
      className,
      value,
      name,
      isInvalid,
      disabled,
      accept,
      ...props
    }: Props,
    ref,
  ) => (
    <Form.Control
      ref={ref}
      as={BaseInput}
      id={id}
      type={type}
      placeholder={placeholder}
      className={className}
      maxWidth="43rem"
      height={getGlobalFormInputHeight}
      borderRadius={getGlobalBorderRadius}
      onInput={onChange}
      onBlur={onBlur}
      onPaste={onPaste}
      value={value}
      name={name}
      isInvalid={isInvalid}
      accept={accept}
      disabled={disabled}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      {...getBoxProps(props)}
    />
  ),
);

Input.displayName = 'Input';

Input.defaultProps = {
  type: 'text',
  isInvalid: false,
};

export { Input };
export type { InputProps, InputType };
