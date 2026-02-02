import { SemicolonLogo } from '@/components/ui/SemicolonLogo'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
      {/* Icon */}
      <div className="relative mb-10">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
          <SemicolonLogo className="h-10 opacity-20" />
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse" />
      </div>

      {/* Text */}
      <h3 className="text-xl md:text-2xl text-white/50 mb-4 text-center font-light">
        你還沒有收集任何段落
      </h3>

      <p className="text-sm text-white/25 text-center max-w-xs leading-relaxed">
        返回閱讀，選取喜歡的句子<br />
        它們會在這裡等你
      </p>

      {/* Hint */}
      <div className="mt-12 px-5 py-3 rounded-full bg-white/5 border border-white/10">
        <p className="text-[11px] text-white/40 tracking-wide">
          選取 5 字以上的文字即可自動保存
        </p>
      </div>
    </div>
  )
}
