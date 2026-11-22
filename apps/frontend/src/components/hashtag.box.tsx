import { FC, useCallback } from 'react';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { HashtagGroups } from '@gitroom/frontend/components/settings/link-tools.component';

// The # button in the editor toolbar: inserts a saved hashtag group
export const HashtagBox: FC<{ editor: any }> = ({ editor }) => {
  const modals = useModals();
  const open = useCallback(() => {
    modals.openModal({
      title: 'Hashtag groups',
      withCloseButton: true,
      children: (close) => (
        <HashtagGroups
          onInsert={(tags) => {
            editor?.commands?.insertContent(' ' + tags);
            editor?.commands?.focus();
            close();
          }}
        />
      ),
    });
  }, [editor]);

  return (
    <div
      onClick={open}
      data-tooltip-id="tooltip"
      data-tooltip-content="Add a hashtag group"
      className="select-none cursor-pointer rounded-[6px] mobile:rounded-[8px] w-[30px] h-[30px] mobile:w-[40px] mobile:h-[40px] bg-newColColor mobile:bg-newSettings flex justify-center items-center text-[15px] font-[700]"
    >
      #
    </div>
  );
};
