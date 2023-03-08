import type { ForwardedRef, ReactElement } from 'react';
import { forwardRef } from 'react';
import { AsyncTypeahead as BootstrapTypeahead } from 'react-bootstrap-typeahead';
import { useTranslation } from 'react-i18next';

import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';
import { InputType } from './Input';
import {
  getGlobalBorderRadius,
  getGlobalFormInputHeight,
  getValueFromTheme,
} from './theme';

const getValue = getValueFromTheme('typeahead');

type NewEntry = {
  customOption: boolean;
  id: string;
  label: string;
};

const isNewEntry = (value: any): value is NewEntry => {
  return !!value?.customOption;
};

type TypeaheadProps<T> = {
  id?: string;
  name?: string;
  options: T[];
  labelKey: ((option: T) => string) | string;
  renderMenuItemChildren?: (option: T, { text }) => JSX.Element;
  disabled?: boolean;
  placeholder?: string;
  emptyLabel?: string;
  minLength?: number;
  inputType?: InputType;
  inputRequired?: boolean;
  customFilter?: (option: T, props?: Record<string, any>) => boolean;
  onChange?: (value: (T | NewEntry)[]) => void;
  defaultInputValue?: string;
  allowNew?:
    | boolean
    | ((
        results: Array<Record<string, unknown> | string>,
        props: Record<string, unknown>,
      ) => boolean);
  hideNewInputText?: boolean;
  newSelectionPrefix?: string;
  selected?: T[];
  positionFixed?: boolean;
};

type Props<T> = Omit<BoxProps, 'onChange' | 'id' | 'labelKey' | 'options'> &
  TypeaheadProps<T> & { isInvalid?: boolean };

type TypeaheadFunc = (<T>(
  props: Props<T> & { ref?: ForwardedRef<HTMLInputElement> },
) => ReactElement) & {
  displayName?: string;
  defaultProps?: { [key: string]: unknown };
};

const Typeahead: TypeaheadFunc = forwardRef(
  <T,>(
    {
      id,
      name,
      inputType,
      inputRequired,
      options,
      labelKey,
      renderMenuItemChildren,
      disabled,
      placeholder,
      emptyLabel,
      minLength,
      className,
      onInputChange,
      defaultInputValue,
      onBlur,
      onFocus,
      onSearch,
      onChange,
      isInvalid,
      selected,
      allowNew,
      customFilter,
      hideNewInputText,
      newSelectionPrefix,
      positionFixed,
      ...props
    }: Props<T>,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const { t } = useTranslation();

    return (
      <Box
        forwardedAs={BootstrapTypeahead}
        id={id}
        name={name}
        allowNew={allowNew}
        newSelectionPrefix={newSelectionPrefix}
        options={options}
        labelKey={labelKey}
        renderMenuItemChildren={renderMenuItemChildren}
        isLoading={false}
        disabled={disabled}
        className={className}
        flex={1}
        ref={ref}
        css={`
          input[type='time']::-webkit-calendar-picker-indicator {
            display: none;
          }

          .form-control {
            border-radius: ${getGlobalBorderRadius};
            height: ${getGlobalFormInputHeight};
            padding: 0.375rem 0.9rem;
          }

          .dropdown-item {
            border-bottom: 1px solid ${({ theme }) => theme.colors.grey1};
          }

          .dropdown-item > .rbt-highlight-text {
            display: initial;
          }

          .rbt-menu-custom-option {
            padding: 1rem 1.5rem;
          }

          .dropdown-item.rbt-menu-custom-option > .rbt-highlight-text {
            display: ${hideNewInputText ? 'none' : 'initial'};
          }

          .dropdown-item.active,
          .dropdown-item:active {
            color: ${getValue('active.color')};
            background-color: ${getValue('active.backgroundColor')};
            .rbt-highlight-text {
              color: ${getValue('active.color')};
            }
          }
          .dropdown-item.hover,
          .dropdown-item:hover {
            color: ${getValue('hover.color')};
            background-color: ${getValue('hover.backgroundColor')};
            .rbt-highlight-text {
              color: ${getValue('hover.color')};
            }
          }
          .rbt-highlight-text {
            font-weight: ${getValue('highlight.fontWeight')};
            background-color: ${getValue('highlight.backgroundColor')};
          }
        `}
        onSearch={onSearch}
        onInputChange={onInputChange}
        onChange={onChange}
        placeholder={placeholder}
        emptyLabel={emptyLabel ?? t('typeahead.no_results')}
        promptText={t('typeahead.prompt_text')}
        searchText={t('typeahead.search_text')}
        minLength={minLength}
        delay={275}
        highlightOnlyResult={!allowNew}
        isInvalid={isInvalid}
        selected={selected}
        defaultInputValue={defaultInputValue}
        onBlur={onBlur}
        onFocus={onFocus}
        positionFixed={positionFixed}
        inputProps={{
          id,
          type: inputType,
          required: inputRequired,
        }}
        {...(customFilter && { filterBy: customFilter })}
        {...getBoxProps(props)}
      />
    );
  },
);

Typeahead.displayName = 'Typeahead';

const typeaheadDefaultProps = {
  labelKey: (item) => item,
  onSearch: async () => {},
  disabled: false,
  minLength: 3,
  inputType: 'text',
};

Typeahead.defaultProps = {
  ...typeaheadDefaultProps,
};

export type { NewEntry, TypeaheadProps };
export { isNewEntry, Typeahead, typeaheadDefaultProps };
