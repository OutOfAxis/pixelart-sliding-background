class PixelartSlidingBackground extends HTMLElement {
  constructor() {
    super();
    imagesCount = ~~this.getAttribute("imgCount") || 14;
    const shadow = this.attachShadow({ mode: "open" });
    const node = tmpl().content.cloneNode(true);
    shadow.appendChild(node);
  }

  connectedCallback() {
    this.render();
    window.addEventListener('resize', this.render)
  }

  render = () => {
    const root = this.shadowRoot.querySelector(".root");
    root.innerHTML = '';
    const imageBase = this.getAttribute("imgBase") || "";
    createColumns(root);
    loadScreenImages(root, imageBase);
  }
}

let imagesCount = 14;
let randomSequence = genRandSeq();

function genRandSeq() {
  const arr = [];
  while (arr.length < imagesCount) {
    const r = Math.floor(Math.random() * imagesCount) + 1;
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
}

let nextImageIndex = 0;
const getNextImageIndex = (function* genNextImageIndexGenerator() {
  while (true) {
    ++nextImageIndex;
    if (nextImageIndex > randomSequence.length-1) {
      nextImageIndex = 0;
      randomSequence = genRandSeq();
    }
    yield randomSequence[nextImageIndex];
  }
})();

function createColumns(root) {
  const IMAGE_WIDTH = 228;
  const IMAGE_HEIGHT = 400;
  root.style.width = '100%';
  root.style.height = '100%';
  const parentWidth = root.offsetWidth;
  const parentHeight = root.offsetHeight;
  const biggestSide = parentWidth > parentHeight ? parentWidth : parentHeight;
  const rhombusSide = ~~(biggestSide / Math.sqrt(2) * 2);
  const columnsCount = ~~(rhombusSide / (IMAGE_WIDTH+16)) + 1;
  const imageCount = ~~(rhombusSide / (IMAGE_HEIGHT+11)) + 1;
  for (let i = 0; i < columnsCount; ++i) {
    root.appendChild(createColumn(imageCount));
  }
  root.style.width = 'auto';
  root.style.height = 'auto';
  root.style.marginLeft = '50%'
  root.style.marginTop = '50%'
  root.style.transformOrigin = '0 0';
  root.style.transform = 'rotate(-45deg) translate(-50%, -50%)';
}

function createColumn(imageCount) {
  const column = document.createElement("div");
  for (let i = 1; i < imageCount+1; ++i) {
    const imgIndex = getNextImageIndex.next().value;
    const img = document.createElement("img");
    img.src = initialImage();
    img.setAttribute("data-src", `screen-${imgIndex}.png`);
    column.appendChild(img);
  }
  return column;
}

function loadScreenImages(root, imageBase) {
  new Array(imagesCount+1).fill(0).forEach((_, i) => {
    if (i === 0) return;
    const img = new Image();
    img.onload = () => {
      root.querySelectorAll(`img[data-src="screen-${i}.png"]`).forEach(el => {
        el.src = img.src;
      });
    };
    img.src = `${imageBase}/screen-${i}.png`;
  });
}

customElements.define("pixelart-sliding-background", PixelartSlidingBackground);

function tmpl() {
  const el = document.createElement("template");
  el.innerHTML = `
    <div class="root"></div>

    <style>
      :host * {
        margin: 0;
        padding: 0;
        overflow: hidden;
      }

      :host .root {
        position: absolute;
        overflow: hidden;
        background-color: rgba(0,0,0,.1);
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 228px;
        gap: 16px;
        animation: fadeIn .1s ease-in-out forwards;
      }

      :host .root img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      :host .root > * {
        display: grid;
        grid-auto-rows: 400px;
        gap: 11px;
      }

      :host .root>div:nth-child(2n-1) {
        animation: slideDown 20s ease-in-out infinite alternate;
      }

      :host .root>div:nth-child(2n) {
        animation: slideUp 20s ease-in-out infinite alternate;
      }

      @keyframes slideUp {
        from {
          transform: translateY(0);
        }
        to {
          transform: translateY(-200px);
        }
      }
      
      @keyframes slideDown {
        from {
          transform: translateY(0);
        }
        to {
          transform: translateY(200px);
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    </style>
  `;
  return el;
}

function initialImage() {
  return "data:image/png;base64,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";
}
