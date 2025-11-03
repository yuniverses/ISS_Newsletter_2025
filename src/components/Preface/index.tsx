export default function Preface() {
  return (
    <section className="relative w-full bg-black text-white">
      {/* Main content with top and bottom margin */}
      <div className="min-h-screen px-8 md:px-16 lg:px-32 py-32 md:py-40">
        <div className="max-w-4xl mx-auto">
          {/* Section label */}
          <div className="text-sm text-gray-400 mb-12 tracking-wider">
            前言
          </div>

          {/* Main title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-16 leading-relaxed max-w-2xl">
            對話的延續，是篇章的連接，一個延續一個的故事。
          </h1>

          {/* Content paragraphs */}
          <div className="max-w-2xl space-y-6 text-lg text-gray-300 leading-relaxed mb-20">
            <p>
              分號「 ; 」存在於語句之間，不急著終止，也不任意中斷。它讓思考有餘韻，讓文字有呼吸，正如服務科學在每一次互動之間，找尋那持續的關係、未完的價值。
            </p>
            <p>
              在服科所，我們學習如何觀察與連結，理解使用者與系統、個體與社會的細微關係。每個研究、每場合作、每次討論，都是句與句之間的分號——延續思考，也預告新的開始。
            </p>
            <p>
              本期《服務聲》，以「 ; 」為名。我們邀請你在閱讀的過程中，一同感受那份「未完待續」的節奏，看見每一次對話之後仍在流動的故事。
            </p>
          </div>

          {/* Editors section */}
          <div className="max-w-2xl border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-500 mb-6">
              編輯的話
            </p>

            <div className="space-y-4 text-sm text-gray-400">
              <div>
                <span className="text-white">陳冠宇</span> / 主編 設計
              </div>
              <div>
                <span className="text-white">胡育慈</span> / 主編 設計
              </div>
              <div>
                <span className="text-white">邱筠婷</span> / 主編 設計
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block-style transition from black to white with progressive sizing */}
      <div className="w-full">
        {/* Darkest blocks: smallest height, largest gaps */}
        <div className="w-full h-2 bg-white opacity-[0.11] mb-10" />
        <div className="w-full h-2 bg-white opacity-[0.20] mb-8" />
        <div className="w-full h-3 bg-white opacity-[0.27] mb-7" />

        {/* Mid-tone blocks: progressive increase in height, decrease in gap */}
        <div className="w-full h-4 bg-white opacity-[0.40] mb-5" />
        <div className="w-full h-5 bg-white opacity-50 mb-4" />
        <div className="w-full h-6 bg-white opacity-[0.65] mb-3" />
        <div className="w-full h-8 bg-white opacity-75 mb-2" />

        {/* Brightest block: largest height (2x larger), no gap */}
        <div className="w-full h-32 bg-white" />
      </div>
    </section>
  )
}
