import { useState } from 'react'

import { Avatar, initialsOf } from '@/components/webex/controls'
import { Icon } from '@/components/webex/icon'
import { MEETING_LINK, MEETING_NUMBER, VIDEO_SYSTEM_ADDRESS } from '../config'
import { Popover } from './popover'

const LABEL = 'text-[14px] font-medium leading-[20px] text-[var(--webex-text-secondary)]'
const VALUE = 'break-all text-[14px] font-medium leading-[20px]'

export function MeetingInfo({ title, hostName, onClose }: { title: string; hostName: string; onClose: () => void }) {
  const link = MEETING_LINK
  const [copied, setCopied] = useState(false)
  const copy = (text: string) => {
    void navigator.clipboard?.writeText(text).catch(() => undefined)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Popover label="Meeting info" width={370} right={8} arrowFromLeft={304.2} onClose={onClose} padding="px-[20px] pt-[20px] pb-[18px]">
      <div className="mb-[8px] text-[16px] font-medium leading-[24px]">{title}</div>
      <div className="flex items-center gap-[8px]">
        <div className="[&>div]:!text-[12px]"><Avatar initials={initialsOf(hostName)} size={24} fontSize={12} /></div>
        <div className="my-[2px]"><span className="text-[var(--webex-text-secondary)]">Host: </span>{hostName}</div>
      </div>
      <button
        type="button"
        onClick={() => copy(`${title}\nHost: ${hostName}\nMeeting link: ${link}\nMeeting number: ${MEETING_NUMBER}`)}
        className="mb-[20px] mt-[11px] flex h-[28px] items-center justify-center gap-[6px] rounded-[20px] border border-[var(--webex-outline)] px-[12px] text-[14px] font-medium leading-[20px] hover:bg-[var(--webex-surface)] focus-visible:[box-shadow:var(--webex-focus-ring)] focus-visible:outline-none"
      >
        {copied ? 'Copied' : 'Copy meeting information'}
      </button>

      <div className="mt-[25.2px] flex items-center">
        <span className={`${LABEL} mr-[8px]`}>Meeting link</span>
        <button type="button" aria-label="Copy meeting link" onClick={() => copy(link)} className="flex h-[28px] w-[28px] items-center justify-center rounded-full hover:bg-[var(--webex-surface)]">
          <Icon name="copy-bold" size={16} />
        </button>
      </div>
      <div className={`${VALUE} w-[324px]`}>{link}</div>

      <div className={`${LABEL} mt-[16px]`}>Meeting number</div>
      <div className={VALUE}>{MEETING_NUMBER}</div>

      <div className={`${LABEL} mt-[16px]`}>Join by video system</div>
      <div className={VALUE}>{VIDEO_SYSTEM_ADDRESS}</div>

      <div className={`${LABEL} mt-[29px]`}>Webex Support</div>
      <div className="mt-[4px] flex gap-[12px] text-[var(--webex-link)]">
        <a href="#" className="rounded-[4px] hover:underline">About</a>
        <a href="#" className="inline-flex items-center gap-[4px] rounded-[4px] hover:underline">Help <Icon name="pop-out-regular" size={14} /></a>
        <a href="#" className="rounded-[4px] hover:underline">Send problem report</a>
      </div>
    </Popover>
  )
}
