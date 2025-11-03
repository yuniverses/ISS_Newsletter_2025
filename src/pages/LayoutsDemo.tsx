import {
  FullWidthImage,
  TextImageSplit,
  TextAboveImage,
  TitleSection,
  Quote
} from '../components/ContentLayouts'

export default function LayoutsDemo() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-8 md:px-16 lg:px-32 py-24">
        <div className="flex items-start gap-8">
          <div className="text-8xl md:text-9xl font-light text-gray-200">00</div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 max-w-3xl">
              內容排版組件示例
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              基於首頁風格設計的多種內容排版方式，可以自由組合使用
            </p>
          </div>
        </div>
      </div>

      {/* 1. 標題欄 */}
      <TitleSection
        number="01"
        title="標題區塊示例"
        subtitle="這是一個帶有編號的標題區塊，風格與首頁章節標題一致"
      />

      {/* 2. 滿版圖片 */}
      <FullWidthImage
        src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&h=900&fit=crop"
        alt="示例圖片"
        caption="滿版圖片：適合展示重要視覺內容或作為章節分隔"
        aspectRatio="video"
      />

      {/* 3. 純文字段落 */}
      <TextImageSplit>
        <h3>純文字段落</h3>
        <p>
          分號「 ; 」存在於語句之間，不急著終止，也不任意中斷。它讓思考有餘韻，讓文字有呼吸，正如服務科學在每一次互動之間，找尋那持續的關係、未完的價值。
        </p>
        <p>
          在服科所，我們學習如何觀察與連結，理解使用者與系統、個體與社會的細微關係。每個研究、每場合作、每次討論，都是句與句之間的分號——延續思考，也預告新的開始。
        </p>
      </TextImageSplit>

      {/* 4. 左文右圖 */}
      <TitleSection
        number="02"
        title="左文右圖排版"
      />

      <TextImageSplit
        imageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1000&fit=crop"
        imageAlt="示例圖片"
        imagePosition="right"
        imageCaption="圖片說明文字"
      >
        <p>
          這是左文右圖的排版方式。文字在左側，圖片在右側。適合需要圖文搭配的內容段落。
        </p>
        <p>
          圖片比例為 4:5，適合人像或直式照片。這種排版創造了良好的視覺平衡。
        </p>
      </TextImageSplit>

      {/* 5. 引用段落 */}
      <Quote
        text="分號是服科最準確的標點符號——我們永遠在繼續，永遠未完。"
        author="編輯的話"
      />

      {/* 6. 右文左圖 */}
      <TitleSection
        number="03"
        title="右文左圖排版"
      />

      <TextImageSplit
        imageSrc="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=1000&fit=crop"
        imageAlt="示例圖片"
        imagePosition="left"
      >
        <p>
          這是右文左圖的排版方式。圖片在左側，文字在右側。
        </p>
        <p>
          通過調整 imagePosition 參數（'left' 或 'right'），可以輕鬆改變圖文的相對位置，創造不同的視覺節奏和層次感。
        </p>
      </TextImageSplit>

      {/* 7. 上文下圖 */}
      <TitleSection
        number="04"
        title="上文下圖排版"
      />

      <TextAboveImage
        imageSrc="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1400&h=900&fit=crop"
        imageAlt="示例圖片"
        imageCaption="這是圖片說明文字"
        aspectRatio="video"
      >
        <p>
          這是上文下圖的排版方式。文字在上方，圖片在下方。適合需要先閱讀文字說明，再配合圖片理解的內容。
        </p>
        <p>
          這種排版特別適合教學內容、步驟說明或需要引導閱讀順序的場景。
        </p>
      </TextAboveImage>

      {/* 8. 方形圖片 */}
      <TitleSection
        number="05"
        title="不同比例的圖片"
        subtitle="支援多種圖片比例：16:9（影片）、正方形、4:5（直式）、21:9（超寬）"
      />

      <FullWidthImage
        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&h=1000&fit=crop"
        alt="方形圖片"
        caption="正方形比例圖片"
        aspectRatio="square"
      />

      {/* 使用說明 */}
      <div className="px-8 md:px-16 lg:px-32 py-16 bg-gray-50">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-light mb-8">使用指南</h2>

          <div className="space-y-8 prose prose-lg max-w-none">
            <div>
              <h3 className="font-light">1. TitleSection - 標題區塊</h3>
              <p className="text-gray-600 text-base">
                用於章節開頭或重要段落標題。支援大型編號和副標題。
              </p>
            </div>

            <div>
              <h3 className="font-light">2. FullWidthImage - 滿版圖片</h3>
              <p className="text-gray-600 text-base">
                全寬度圖片展示。支援多種比例：video (16:9)、square、portrait (4:5)、wide (21:9)。
              </p>
            </div>

            <div>
              <h3 className="font-light">3. TextImageSplit - 圖文並排</h3>
              <p className="text-gray-600 text-base">
                左文右圖或右文左圖。不提供圖片時自動變為全寬文字段落。支援圖片說明。
              </p>
            </div>

            <div>
              <h3 className="font-light">4. TextAboveImage - 上文下圖</h3>
              <p className="text-gray-600 text-base">
                文字在上，圖片在下。適合教學內容或步驟說明。
              </p>
            </div>

            <div>
              <h3 className="font-light">5. Quote - 引用段落</h3>
              <p className="text-gray-600 text-base">
                引用文字或金句展示。帶有左側邊框裝飾。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
