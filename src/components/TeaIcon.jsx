import { teaPaths } from '../lib/teaIcons'
export default function TeaIcon({ name = 'leaf', className = '' }) {
  return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`tea-icon ${className}`}><path d={teaPaths[name] || teaPaths.leaf} /></svg>
}
