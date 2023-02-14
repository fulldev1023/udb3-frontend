import type { ReactNode, SyntheticEvent } from 'react';
import { Children } from 'react';
import {
  Tab as BootstrapTab,
  Tabs as BootstrapTabs,
  TabsProps,
} from 'react-bootstrap';

import type { BoxProps } from '@/ui/Box';
import { Box, getBoxProps, parseSpacing } from '@/ui/Box';

import { getValueFromTheme } from './theme';

const getValue = getValueFromTheme(`tabs`);

type Props<T> = BoxProps & TabsProps & { activeBackgroundColor?: string };

const Tabs = <T,>({
  activeKey,
  onSelect,
  activeBackgroundColor,
  children: rawChildren,
  className,
  ...props
}: Props<T>) => {
  const children = Children.toArray(rawChildren).filter((child) => {
    // @ts-expect-error
    if (child.type !== Tab) {
      // eslint-disable-next-line no-console
      console.error(
        'Child of type',
        // @ts-expect-error
        child.type.name,
        'is not supported in Tabs component',
      );
      return false;
    }

    return true;
  });

  return (
    <Box className={className} {...getBoxProps(props)}>
      <BootstrapTabs
        activeKey={activeKey}
        onSelect={onSelect}
        css={`
          border-bottom: none;

          .nav-item {
            color: ${getValue('color')};
            border-radius: ${getValue('borderRadius')};
            padding: ${parseSpacing(3)} ${parseSpacing(4)};
            margin-right: ${parseSpacing(1)};

            &.nav-link {
              border-bottom-left-radius: 0;
              border-bottom-right-radius: 0;
            }

            &:hover {
              color: ${getValue('hoverColor')};
              border-color: transparent;
              background-color: ${getValue('hoverTabBackgroundColor')};
            }

            &.active,
            &.active:hover {
              color: ${getValue('activeTabColor')};
              background-color: ${activeBackgroundColor ??
              getValue('activeTabBackgroundColor')};
              border-color: ${getValue('borderColor')};
              border-bottom-color: ${activeBackgroundColor ??
              getValue('activeTabBackgroundColor')};
              cursor: default;
            }
          }
        `}
      >
        {children}
      </BootstrapTabs>
    </Box>
  );
};

type TabProps = {
  eventKey: string;
  title: ReactNode;
  children?: ReactNode;
};

const Tab = ({ eventKey, title, children }: TabProps) => {
  return (
    <BootstrapTab eventKey={eventKey} title={title}>
      {children}
    </BootstrapTab>
  );
};

Tabs.Tab = Tab;

export { Tabs };
