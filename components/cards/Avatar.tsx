export default function Avatar({ initial, name }: { initial: string; name?: string}) {
  return (
    <div className="flex items-center gap-2">
        <span className='w-5 h-5 bg-amber-200 flex items-center justify-center rounded-full text-xs font-semibold'>{initial}</span>
        {name &&
            <p className="text-sm">{name}</p>
        }
    </div>
  )
}
