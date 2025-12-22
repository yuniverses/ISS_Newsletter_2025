import React, { ReactNode } from 'react';

export type ContentType = 'horizontal' | 'vertical' | 'code';

export interface SemicolonScene {
  type: ContentType;
  lang: string;
  before: ReactNode;
  after: ReactNode;
  semicolon: string;
  fontClass: string;
}

const BASE_SIZE = "text-xl md:text-3xl";

// --- Syntax Highlighting Helpers ---
const K = ({ c }: { c: string }) => <span className="text-pink-400 font-bold">{c}</span>; // Keyword
const F = ({ c }: { c: string }) => <span className="text-yellow-300">{c}</span>; // Function
const S = ({ c }: { c: string }) => <span className="text-green-400">{c}</span>; // String
const V = ({ c }: { c: string }) => <span className="text-blue-300">{c}</span>; // Variable/Type
const O = ({ c }: { c: string }) => <span className="text-white/60">{c}</span>; // Operator/Punctuation
const N = ({ c }: { c: string }) => <span className="text-orange-300">{c}</span>; // Number
const C = ({ c }: { c: string }) => <span className="text-gray-500 italic">{c}</span>; // Comment

const mono = `font-mono text-white ${BASE_SIZE}`;
const serif = `font-serif text-white ${BASE_SIZE}`;
const sans = `font-sans text-gray-200 ${BASE_SIZE}`;

export const scenes: SemicolonScene[] = [
  // --- CODE SAMPLES ---
  {
    type: 'code',
    lang: 'TypeScript',
    before: <><K c="const" /> <V c="life" /><O c=":" /> <V c="Future" /> <O c="=" /> <F c="await" /></>,
    after: <><F c="discover" /><O c="(" /><V c="unknown" /><O c=")" /></>,
    semicolon: ';',
    fontClass: mono,
  },
  {
    type: 'code',
    lang: 'Rust',
    before: <><K c="let" /> <K c="mut" /> <V c="chaos" /> <O c="=" /> <V c="String" /><O c="::" /><F c="new" /><O c="()" /></>,
    after: <><V c="io" /><O c="::" /><F c="stdin" /><O c="()" /><O c="." /><F c="read" /><O c="(&" /><K c="mut" /> <V c="chaos" /><O c=")" /></>,
    semicolon: ';',
    fontClass: mono,
  },
  {
    type: 'code',
    lang: 'Python',
    before: <><K c="def" /> <F c="dream" /><O c="(" /><V c="sleep" /><O c=")" /></>,
    after: <><K c="return" /> <V c="None" /></>,
    semicolon: ':',
    fontClass: mono,
  },
  {
    type: 'code',
    lang: 'C++',
    before: <><K c="std" /><O c="::" /><V c="cout" /> <O c="<<" /> <S c="&quot;Hello&quot;" /></>,
    after: <><K c="return" /> <N c="0" /></>,
    semicolon: ';',
    fontClass: mono,
  },
  {
    type: 'code',
    lang: 'Golang',
    before: <><K c="func" /> <F c="main" /><O c="()" /> <O c="{" /> <F c="go" /> <F c="run" /><O c="()" /></>,
    after: <><O c="}" /></>,
    semicolon: ';',
    fontClass: mono,
  },
  {
    type: 'code',
    lang: 'CSS',
    before: <><span className="text-blue-300">display</span><O c=":" /> <span className="text-yellow-200">grid</span></>,
    after: <><span className="text-blue-300">place-items</span><O c=":" /> <span className="text-yellow-200">center</span></>,
    semicolon: ';',
    fontClass: mono,
  },
  {
    type: 'code',
    lang: 'SQL',
    before: <><K c="SELECT" /> <O c="*" /> <K c="FROM" /> <V c="dreams" /></>,
    after: <><K c="WHERE" /> <V c="lucid" /> <K c="IS" /> <K c="TRUE" /></>,
    semicolon: ';',
    fontClass: mono,
  },
  {
    type: 'code',
    lang: 'Assembly',
    before: <><K c="MOV" /> <V c="EAX" /><O c="," /> <N c="1" /></>,
    after: <><K c="INT" /> <N c="0x80" /></>,
    semicolon: ';',
    fontClass: `${mono} text-gray-400`,
  },
  {
    type: 'horizontal',
    lang: 'Spreadsheet',
    before: <><span className="text-green-500">=IF</span><span className="text-white">(</span><span className="text-orange-300">A1</span><span className="text-white">&gt;</span><span className="text-orange-300">0</span></>,
    after: <><span className="text-yellow-300">&quot;OK&quot;</span><span className="text-white">)</span></>,
    semicolon: ';',
    fontClass: `${mono} bg-white/10 p-1 rounded`,
  },

  // --- LITERATURE (HORIZONTAL) ---
  {
    type: 'horizontal',
    lang: 'English',
    before: 'To be, or not to be',
    after: 'that is the question',
    semicolon: ';',
    fontClass: `${serif} italic`,
  },
  {
    type: 'horizontal',
    lang: 'German',
    before: 'Die Grenzen meiner Sprache',
    after: 'bedeuten die Grenzen meiner Welt',
    semicolon: ';',
    fontClass: `${serif} text-amber-50`,
  },
  {
    type: 'horizontal',
    lang: 'Latin',
    before: 'Cogito, ergo sum',
    after: 'sum, ergo cogito',
    semicolon: ';',
    fontClass: `${serif} text-stone-400 uppercase tracking-widest`,
  },

  // --- LITERATURE (VERTICAL) ---
  {
    type: 'vertical',
    lang: 'Chinese Classical',
    before: '落霞與孤鶩齊飛',
    after: '秋水共長天一色',
    semicolon: '；',
    fontClass: `${serif} tracking-widest`,
  },
  {
    type: 'vertical',
    lang: 'Japanese Haiku',
    before: '古池や蛙飛び込む',
    after: '水の音',
    semicolon: '；',
    fontClass: `${serif} text-stone-300 tracking-widest`,
  },
  {
    type: 'vertical',
    lang: 'Chinese Modern',
    before: '後來，我們什麼都有了',
    after: '卻沒有了我們',
    semicolon: '；',
    fontClass: `${sans} text-white/80 tracking-widest`,
  },
  {
    type: 'vertical',
    lang: 'Japanese Novel',
    before: '私はその男の写真を',
    after: '三葉、見たことがある',
    semicolon: '；',
    fontClass: `${serif} text-stone-200 tracking-widest`,
  },
  
  // --- ADDITIONAL LANGUAGES ---
  {
    type: 'horizontal',
    lang: 'French',
    before: 'La vie est une fleur',
    after: 'l’amour en est le miel',
    semicolon: ';',
    fontClass: `${serif} italic text-pink-100`,
  },
  {
    type: 'horizontal',
    lang: 'Thai',
    before: 'ความสุขไม่ได้อยู่ที่ปลายทาง',
    after: 'แต่อยู่ที่ระหว่างทาง',
    semicolon: ';',
    fontClass: `${sans} text-yellow-100`,
  },
  {
    type: 'horizontal',
    lang: 'Russian',
    before: 'Век живи',
    after: 'век учись',
    semicolon: ';',
    fontClass: `${serif} text-red-50`,
  },
];
