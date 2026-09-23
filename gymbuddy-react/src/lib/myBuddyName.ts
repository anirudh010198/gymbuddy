import { getContactProfile } from '../app/lib/contactProfile'

const KEY = 'gymbuddy.buddy.myName'

/** The name shown to a buddy — reuses the "save my progress" card's first
 *  name if it's already been given, but never requires filling that whole
 *  card out just to send a buddy invite. */
export function getMyBuddyName(): string {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored) return stored
  } catch {
    /* fall through to contact profile / empty */
  }
  return getContactProfile()?.firstName ?? ''
}

export function setMyBuddyName(name: string): void {
  try {
    localStorage.setItem(KEY, name)
  } catch {
    /* private mode / storage unavailable */
  }
}
