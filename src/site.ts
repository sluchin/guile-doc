/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SiteProfile } from "../shared/ts/lib/profile";

/** ドキュメントのホストの URL. */
const ORIGIN = "https://doc.guix.gnu.org";

/** 最初に開く版 (版を固定して読む. 版を上げるときは, 画面で版を選ぶ). */
const FIRST_VERSION = "3.0.11";

/**
 * GNU Guile のリファレンスマニュアル (Texinfo の HTML. ノードごとに 1 ページ) の設定.
 *
 * www.gnu.org のマニュアルは, doc.guix.gnu.org へリダイレクトされるので, そちらから取得する. 版は, パスの
 * `/guile/3.0.11/` で, 画面で選ぶ (翻訳のキャッシュも, 版ごとに分ける). 本文は, ページの最も外側の
 * `*-level-extent` (章, 節など). 左のメニュー (目次) は, ページの中ではなく, 最初のページの目次にある.
 */
export const site: SiteProfile = {
  name: "Guile Doc Trans",
  host: "doc.guix.gnu.org",
  // 版を除いたパス (`/guile/3.0.11/en/html_node/` → `/guile/en/html_node/`). 1 ページの版や PDF は開かない
  pathPrefix: "/guile/en/html_node/",
  homeUrl: `${ORIGIN}/guile/${FIRST_VERSION}/en/html_node/index.html`,
  contentSelectors: ['[class$="-level-extent"]', "body"],
  // 見出しの横の ¶ (リンクを写す印) は, 本文ではない
  removeSelectors: [".copiable-link"],
  // 手続きの宣言 (名前と引数) と, 索引 (手続きの名前の一覧) は, 翻訳しない
  noTranslateSelectors: ["dt.def-line", ".printindex"],
  titleSuffix: / \(Guile Reference Manual\)$/,
  // 目次は, 最初のページの `Table of Contents` (全体が, 最初から, そろう)
  menu: {
    type: "htmlFile",
    url: `${ORIGIN}/guile/${FIRST_VERSION}/en/html_node/index.html`,
    selector: "#SEC_Contents .contents",
  },
  // 版は, パスの `/guile/` の次. 版の一覧は, ページの上の, 版の切り替え (1 ページの版と PDF は除く)
  versions: {
    selector: '.navbar-submenu a[href*="html_node"]',
    pattern: /^\/guile\/([^/]+)\//,
  },
};
