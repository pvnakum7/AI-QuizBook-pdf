export function renderAnswerWithCitations(answer, citations) {
  if (!citations?.length) return answer;
  const refs = citations
    .map(
      (c, i) =>
        `<a class="citation" data-page="${c.page}" title="View page ${c.page}">[p.${c.page}]</a>`
    )
    .join(" ");
  return `${answer}<div class="citations">${refs}</div>`;
}

export function attachCitationClickHandler(callback) {
  document.addEventListener("click", (e) => {
    const el = e.target.closest(".citation");
    if (el) {
      const page = parseInt(el.dataset.page);
      callback?.(page);
    }
  });
}

export function highlightPageText(pageEl, citation) {
  if (!pageEl || !citation.positions?.length) return;
  const scale =
    pageEl.querySelector(".react-pdf__Page__textContent")?.getBoundingClientRect().width / 595 || 1;

  citation.positions.forEach((p) => {
    const { x, y, width, height } = p.rect;
    const mark = document.createElement("div");
    mark.className = "pdf-highlight";
    Object.assign(mark.style, {
      position: "absolute",
      left: `${x * scale}px`,
      top: `${(800 - y) * scale}px`,
      width: `${width * scale}px`,
      height: `${height * scale}px`,
      background: "rgba(255,230,0,0.4)",
      borderRadius: "4px",
    });
    pageEl.appendChild(mark);
    setTimeout(() => mark.remove(), 4000);
  });
}
