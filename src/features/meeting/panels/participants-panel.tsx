import { useMemo, useState } from 'react'

import { Avatar } from '@/components/webex/controls'
import { initialsOf } from '@/lib/initials'
import { Icon } from '@/components/webex/icon'
import { SortMenu, type SortKey } from '../menus/sort-menu'

export type PanelPerson = { id: string; name: string; me?: boolean; host?: boolean; muted: boolean; raised?: boolean }

function Row({ p, onMenu }: { p: PanelPerson; onMenu?: (name: string, anchor: DOMRect) => void }) {
  return (
    <div className="-mb-[2px] flex h-[52px] items-center rounded-[1013px] pl-[8px] pr-[12px] hover:bg-[var(--webex-surface)]" aria-label={`${p.name}${p.me ? ', Me, Unverified' : p.host ? ', Host, presenter' : ''}`}>
      <Avatar initials={initialsOf(p.name)} size={32} fontSize={14} />
      <div className="ml-[12px] min-w-0 flex-1">
        <div className="truncate text-[14px] leading-[20px]">{p.name}</div>
        {p.me ? (
          <div className="flex h-[20px] items-center gap-[8px] text-[12px] leading-[16px]">
            <span className="text-[var(--webex-text-secondary)]">Me</span>
            <span className="h-[4px] w-[4px] rounded-full bg-[#ffffff33]" />
            <span className="flex items-center gap-[2px] text-[var(--webex-warning)]">
              <button type="button" aria-label="Show more information" className="flex h-[20px] w-[20px] items-center justify-center rounded-full"><Icon name="help-circle-bold" size={16} /></button>
              <span className="leading-[12px]">Unverified</span>
            </span>
          </div>
        ) : p.host ? (
          <div className="text-[12px] leading-[16px] text-[var(--webex-text-secondary)]">Host, presenter</div>
        ) : null}
      </div>
      {p.raised && (
        <button type="button" aria-label={`${p.name} has raised hand`} className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-[var(--webex-text-primary)] hover:bg-[var(--webex-disabled-bg)]">
          <Icon name="raise-hand-regular" size={16} />
        </button>
      )}
      <button type="button" data-popover-trigger aria-label={`More options for ${p.name}`} onClick={(e) => onMenu?.(p.name, e.currentTarget.getBoundingClientRect())} className="flex h-[32px] w-[32px] items-center justify-center rounded-full hover:bg-[var(--webex-disabled-bg)]">
        <Icon name="more-bold" size={16} />
      </button>
      <span className="ml-[8px] flex h-[16px] w-[16px] items-center justify-center" aria-label={p.muted ? 'Muted' : 'Unmuted'}>
        <Icon name={p.muted ? 'microphone-muted-bold' : 'microphone-on-bold'} size={16} className={p.muted ? 'text-[var(--webex-muted-red)]' : 'text-[var(--webex-success)]'} />
      </span>
    </div>
  )
}

export function ParticipantsPanel({ people, onClose, onRowMenu }: { people: PanelPerson[]; onClose: () => void; onRowMenu?: (name: string, anchor: DOMRect) => void }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('name')
  const [sortAnchor, setSortAnchor] = useState<number | null>(null)
  const [open, setOpen] = useState(true)
  const shown = useMemo(() => {
    const list = people.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    return sort === 'raised' ? [...list].sort((a, b) => Number(!!b.raised) - Number(!!a.raised)) : list
  }, [people, query, sort])

  return (
    <section aria-label="Participants" className="flex h-full w-[376px] flex-col">
      <div className="flex items-center">
        <h2 className="w-[324.9px] text-[16px] font-bold leading-[24px]">Participants ({people.length})</h2>
        <button type="button" aria-label="Close panel" onClick={onClose} className="ml-[20px] flex h-[20px] w-[20px] items-center justify-center rounded-full hover:bg-[var(--webex-surface)] focus-visible:[box-shadow:var(--webex-focus-ring)] focus-visible:outline-none">
          <Icon name="cancel-bold" size={16} />
        </button>
      </div>

      <div className="mt-[18px] flex items-center gap-[8px]">
        <div className="box-border flex h-[28px] w-[340px] items-center gap-[8px] rounded-[8px] border border-[var(--webex-outline)] py-[5.5px] pl-[12px] pr-[6px] focus-within:border-[#ffffffe6] focus-within:[box-shadow:var(--webex-focus-ring)]">
          <Icon name="search-bold" size={16} />
          <input
            aria-label="Search for participant"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-[20px] min-w-0 flex-1 bg-transparent text-[14px] leading-[20px] outline-none placeholder:text-[var(--webex-text-secondary)]"
          />
        </div>
        <button type="button" aria-label="Sort" data-popover-trigger onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSortAnchor(sortAnchor === null ? r.x + r.width / 2 : null) }} className="flex h-[28px] w-[28px] items-center justify-center rounded-full hover:bg-[var(--webex-surface)]">
          <Icon name="unsorted-bold" size={16} />
        </button>
      </div>

      <div className="mt-[8px] w-full flex-1 overflow-y-auto px-[6px] py-[4px]" aria-label="Participants">
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex h-[32px] w-full items-center rounded-[1013px] pl-[8px] pr-[12px] hover:bg-[var(--webex-surface)]">
          <Icon name="arrow-down-bold" size={14} className={open ? '' : '-rotate-90'} />
          <span className="ml-[12px] flex-1 text-left text-[14px] font-medium leading-[20px] text-[var(--webex-text-secondary)]">In the meeting ({shown.length})</span>
          <Icon name="external-user-bold" size={16} />
        </button>
        {open && shown.map((p) => <Row key={p.id} p={p} onMenu={onRowMenu} />)}
      </div>
      {sortAnchor !== null && <SortMenu anchorX={sortAnchor} value={sort} onChange={setSort} onClose={() => setSortAnchor(null)} />}
    </section>
  )
}
