/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";
import { extractPage } from "../shared/ts/lib/extract";
import { isDocUrl } from "../shared/ts/lib/docUrl";
import { parseHtmlMenu } from "../shared/ts/lib/menu";
import { versionOf, withVersion } from "../shared/ts/lib/version";
import { site } from "./site";

/** 作り物の Texinfo 風のページ (ドキュメントの文章は使わない). */
const PAGE = `<html><head><title>Sample Node (Guile Reference Manual)</title></head><body>
<header class="navbar"><nav class="navbar-menu"><div class="navbar-submenu"><ul>
<li><a class="navbar-menu-item" href="../../../3.0.11/en/html_node">3.0.11</a></li>
<li><a class="navbar-menu-item" href="../../../2.2.7/en/html_node">2.2.7</a></li>
<li><a class="navbar-menu-item" href="../guile.html">single page</a></li>
<li><a class="navbar-menu-item" href="../guile.pdf">PDF</a></li></ul></div></nav></header>
<div class="subsection-level-extent" id="Sample-Node">
<p class="nav-panel"><a href="Next-Node.html" rel="next">Next Node</a></p>
<h4 class="subsection"><span>1.2.3 Sample Node<a class="copiable-link" href="#Sample"> &para;</a></span></h4>
<p>Body text.</p>
<dl class="first-deffn def-block"><dt class="deffn def-line"><span class="category-def">Scheme Procedure: </span>
<strong class="def-name">make-sample</strong></dt><dd><p>Makes a sample.</p></dd></dl>
</div></body></html>`;

/** 作り物の, 最初のページの目次. */
const CONTENTS = `<div class="region-contents" id="SEC_Contents"><h2>Table of Contents</h2>
<div class="contents"><ul class="toc-numbered-mark">
<li><a href="Preface.html">Preface</a></li>
<li><a href="Intro.html">1 Intro</a><ul class="toc-numbered-mark"><li><a href="Basics.html">1.1 Basics</a></li></ul></li>
</ul></div></div>`;

/** 版を固定した, ページの URL. */
const BASE = "https://doc.guix.gnu.org/guile/3.0.11/en/html_node/";

describe("Guile site profile", () => {
  it("opens only the split manual of Guile, starting from the home page", () => {
    expect(isDocUrl(site.homeUrl, site)).toBe(true);
    expect(isDocUrl(`${BASE}Hash-Tables.html`, site)).toBe(true);
    expect(isDocUrl("https://doc.guix.gnu.org/guile/latest/en/html_node/a.html", site)).toBe(true);
    expect(isDocUrl("https://doc.guix.gnu.org/guile/3.0.11/en/guile.pdf", site)).toBe(false);
    expect(isDocUrl("https://doc.guix.gnu.org/guix/en/html_node/a.html", site)).toBe(false);
    expect(isDocUrl("https://example.com/", site)).toBe(false);
  });

  it("takes the node, strips the manual name from the title and keeps declarations", () => {
    const page = extractPage(PAGE, `${BASE}Sample-Node.html`, site);
    expect(page.title).toBe("Sample Node");
    expect(page.html).toContain("Body text.");
    expect(page.html).toContain("make-sample");
    expect(page.html).not.toContain("single page");
    expect(page.html).not.toContain("copiable-link");
  });

  it("starts from a fixed version and reads the version list of the page", () => {
    const pattern = site.versions?.pattern as RegExp;
    expect(versionOf(site.homeUrl, pattern)).toBe("3.0.11");
    const page = extractPage(PAGE, `${BASE}Sample-Node.html`, site);
    // 1 ページの版と PDF は, 版の選択肢にしない
    expect(page.versions).toEqual([
      { version: "3.0.11", label: "3.0.11" },
      { version: "2.2.7", label: "2.2.7" },
    ]);
    expect(withVersion(`${BASE}Hash-Tables.html`, pattern, "2.2.7")).toBe(
      "https://doc.guix.gnu.org/guile/2.2.7/en/html_node/Hash-Tables.html",
    );
  });

  it("reads the table of contents of the home page into a tree with absolute urls", () => {
    const menu = site.menu;
    expect(menu?.type).toBe("htmlFile");
    if (menu?.type !== "htmlFile") {
      return;
    }
    expect(menu.url).toBe(site.homeUrl);
    const root = new DOMParser().parseFromString(CONTENTS, "text/html");
    const element = root.querySelector(menu.selector) as Element;
    const items = parseHtmlMenu(element, menu.url, menu.list);
    expect(items.map((item) => item.title)).toEqual(["Preface", "1 Intro"]);
    expect(items[1].url).toBe(`${BASE}Intro.html`);
    expect(items[1].children[0].title).toBe("1.1 Basics");
  });
});
