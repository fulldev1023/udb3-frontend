import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

const Editor = dynamic(
  () => import('react-draft-wysiwyg').then(({ Editor }) => Editor),
  { ssr: false },
);

function RichTextEditor(props: ComponentProps<typeof Editor>) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 10,
        padding: 10,
        width: '100%',
      }}
    >
      <Editor
        toolbar={{
          options: ['inline', 'list', 'history'],
          inline: {
            inDropdown: false,
            options: ['bold', 'italic', 'underline'],
          },
        }}
        {...props}
      />
    </div>
  );
}

export default RichTextEditor;