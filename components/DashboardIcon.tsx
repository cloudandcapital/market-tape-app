type IconName = 'cloud' | 'renewal' | 'infrastructure' | 'warning' | 'opportunity'

const paths: Record<IconName, React.ReactNode> = {
  cloud: <path d="M5.5 15.5h11a3.5 3.5 0 0 0 .4-6.98A5 5 0 0 0 7.4 7.1 4.25 4.25 0 0 0 5.5 15.5Z" />,
  renewal: <><path d="M7 7.5h8.5V16H7z" /><path d="M9 5.5h8.5V14M10 10h2.5M10 12.5h3.5" /></>,
  infrastructure: <><path d="M5 7h14M7 4.5v5M17 4.5v5M6.5 12h11v7h-11z" /><path d="M9.5 15.5h5" /></>,
  warning: <><path d="m12 4 8 15H4L12 4Z" /><path d="M12 9v4.5M12 16.5h.01" /></>,
  opportunity: <><path d="M9 18h6M10 21h4" /><path d="M8.5 14.5a6 6 0 1 1 7 0c-.9.65-1.5 1.4-1.5 2.5h-4c0-1.1-.6-1.85-1.5-2.5Z" /></>,
}

export default function DashboardIcon({ name, tone = 'neutral' }: { name: IconName; tone?: 'neutral' | 'caution' | 'positive' }) {
  const color = tone === 'positive' ? '#4A6B5F' : tone === 'caution' ? '#9A762A' : 'rgba(25,23,20,0.5)'
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 flex-none">
      {paths[name]}
    </svg>
  )
}
