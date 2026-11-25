// Hand-cut silhouettes are drawn once. The transparent prints are shared by the
// collection rack, the larger reward card, and the four lights in the finale.
const size = 164;
const ink = '#533b30';
const gold = '#efc983';
const cream = '#ffedbc';
const prints = new Map();

// One point is a corner, two points describe a quadratic cut, three a cubic cut.
function trace(g, points) {
  g.beginPath();
  g.moveTo(...points[0]);
  for (const p of points.slice(1)) {
    if (p.length === 2) g.lineTo(...p);
    else if (p.length === 4) g.quadraticCurveTo(...p);
    else g.bezierCurveTo(...p);
  }
}

function cut(g, points, fill, edge = ink, width = 1.6) {
  trace(g, points);
  g.closePath();
  g.fillStyle = fill;
  g.fill();
  if (edge) {
    g.strokeStyle = edge;
    g.lineWidth = width;
    g.stroke();
  }
}

function vein(g, points, color, width = 1.6) {
  trace(g, points);
  g.strokeStyle = color;
  g.lineWidth = width;
  g.stroke();
}

function oval(g, x, y, rx, ry, fill, edge, width = 1.5) {
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
  g.fillStyle = fill;
  g.fill();
  if (edge) {
    g.strokeStyle = edge;
    g.lineWidth = width;
    g.stroke();
  }
}

function paperLight(g, x, y, radius, inside, middle, outside) {
  const wash = g.createRadialGradient(x, y, 1, x, y, radius);
  wash.addColorStop(0, inside);
  wash.addColorStop(0.55, middle);
  wash.addColorStop(1, outside);
  return wash;
}

function hanger(g, x, top, ends) {
  vein(g, [[x, top + 10], [x - 10, top + 4, x - 3, top], [x + 3, top - 3, x + 4, top + 3], [x + 4, top + 7, x, top + 10]], ink, 2.7);
  vein(g, [[x - 3, top + 2], [x - 7, top + 5, x - 2, top + 8]], gold, 1.2);
  for (const [endX, endY] of ends) {
    vein(g, [[x, top + 10], [(x + endX) / 2, top + 18, endX, endY]], '#865f38', 2.1);
  }
  oval(g, x, top + 10, 2.6, 2.7, '#c99a50', ink, 1);
}

function tassel(g, x, y, endY) {
  vein(g, [[x, y - 3], [x, y + 7]], '#8b4935', 2.5);
  oval(g, x, y + 8, 3, 3.7, gold, ink, 1);
  const n = y + 11;
  cut(g, [[x - 2, n], [x + 2, n], [x + 1, endY - 7, x + 6, endY - 2],
    [x + 2, endY - 3], [x + 3, endY], [x - 1, endY - 2], [x - 3, endY - 1],
    [x - 3, endY - 5], [x - 6, endY - 4], [x - 3, endY - 8, x - 2, n]], '#ba523c', '#874731', 1);
  vein(g, [[x, n + 1], [x - 1, endY - 7, x + 1, endY - 4]], '#f1aa65', 1.1);
}

function lion(g) {
  hanger(g, 82, 8, [[51, 50], [112, 50]]);
  tassel(g, 82, 124, 156);
  const fur = paperLight(g, 78, 80, 53, '#ffdb87', '#e9a35d', '#bb5b39');
  // Folded fan ears and the scalloped lion ruff.
  cut(g, [[50, 49], [38, 32, 21, 39], [13, 47, 24, 65], [30, 71, 49, 68]], '#bc5443');
  cut(g, [[114, 49], [125, 32, 142, 39], [151, 47, 140, 65], [134, 71, 115, 68]], '#bc5443');
  for (const s of [-1, 1]) {
    g.save(); g.translate(82, 0); g.scale(s, 1);
    cut(g, [[34, 53], [45, 41, 53, 45], [59, 49, 52, 59], [44, 64, 36, 61]], '#edb36a', '#9b5b3b', 1);
    vein(g, [[39, 56], [47, 49, 52, 48]], cream, 1.8);
    g.restore();
  }
  cut(g, [[81, 35], [91, 28, 99, 34], [109, 34, 114, 47],
    [126, 48, 132, 59], [141, 72, 132, 84], [139, 97, 124, 102],
    [128, 115, 113, 117], [110, 130, 98, 125], [91, 136, 81, 128],
    [69, 135, 62, 126], [48, 131, 45, 117], [31, 114, 34, 102],
    [22, 98, 29, 84], [23, 70, 32, 59], [34, 49, 48, 47],
    [53, 34, 64, 35], [73, 28, 81, 35]], fur, ink, 2.1);
  for (const s of [-1, 1]) {
    g.save(); g.translate(82, 0); g.scale(s, 1);
    cut(g, [[24, 83], [42, 77, 48, 88], [49, 94, 38, 96],
      [46, 100, 38, 106], [27, 105, 21, 96]], '#e77e49', '#ad5a3f', 1.2);
    cut(g, [[5, 76], [10, 60, 23, 58], [41, 54, 43, 73],
      [43, 87, 27, 89], [13, 90, 5, 76]], '#fff0c5', ink, 2);
    oval(g, 24, 74, 10.8, 11.3, '#44635a', ink, 1.4);
    oval(g, 23, 75, 6.8, 8, '#352f2b');
    oval(g, 20.7, 70.8, 2.8, 3, '#fff4cb');
    cut(g, [[3, 68], [5, 55, 17, 48], [23, 45, 28, 47],
      [37, 43, 42, 51], [47, 53, 45, 60], [36, 57, 31, 59],
      [18, 56, 3, 68]], '#ba4a39', ink, 1.8);
    vein(g, [[11, 59], [21, 51, 26, 53], [34, 49, 37, 52]], '#f4be70', 2.6);
    g.restore();
  }
  // Forehead mirror and Chinese lion's little central horn.
  cut(g, [[74, 42], [71, 33, 77, 27], [77, 34, 83, 29], [87, 26, 86, 22],
    [95, 31, 88, 40], [85, 44, 79, 45]], '#679288', ink, 1.6);
  oval(g, 82, 49, 8, 7.6, gold, ink);
  oval(g, 82, 49, 4.4, 4.3, '#86a598', '#715f42', 1);
  cut(g, [[52, 103], [66, 96, 82, 101], [97, 96, 112, 103],
    [109, 117, 95, 120], [82, 125, 69, 120], [55, 117, 52, 103]], '#703a34', ink, 1.7);
  cut(g, [[63, 114], [81, 106, 101, 114], [86, 126, 63, 114]], '#e49778', null);
  for (const s of [-1, 1]) {
    g.save(); g.translate(82, 0); g.scale(s, 1);
    cut(g, [[0, 93], [11, 87, 22, 94], [32, 98, 34, 89],
      [39, 101, 29, 105], [20, 110, 12, 104], [4, 100, 0, 102]], '#ffdf9b', '#966247', 1.4);
    g.restore();
  }
  cut(g, [[69, 89], [70, 81, 78, 83], [82, 86], [87, 81, 92, 84],
    [99, 90, 91, 94], [86, 94, 82, 98], [77, 94, 73, 94], [69, 93, 69, 89]], '#b44f40', ink, 1.8);
  vein(g, [[74, 88], [77, 86, 79, 89]], cream, 1.3);
}

function carp(g) {
  hanger(g, 80, 11, [[55, 63], [103, 70]]);
  tassel(g, 79, 113, 151);
  // A double tail and fins use vermilion paper with folded gold ribs.
  cut(g, [[108, 74], [127, 66, 146, 48], [143, 67, 134, 80],
    [146, 78, 153, 78], [147, 87, 134, 90], [142, 101, 145, 111],
    [123, 107, 108, 92]], '#bd5640', ink, 2);
  for (const pts of [[[117, 80], [132, 70, 141, 57]], [[120, 83], [136, 82, 145, 81]], [[118, 89], [130, 99, 139, 105]]]) {
    vein(g, pts, '#f2b869', 2);
  }
  cut(g, [[55, 63], [57, 45, 68, 35], [69, 43], [78, 36], [79, 43],
    [90, 40], [90, 47], [100, 48], [98, 54], [107, 57], [103, 68]], '#d46a43');
  vein(g, [[66, 57], [66, 49, 68, 43]], gold);
  vein(g, [[77, 58], [78, 50, 79, 45]], gold);
  cut(g, [[70, 101], [77, 119, 96, 125], [91, 115], [101, 118],
    [96, 108, 88, 101]], '#c45a41');
  const skin = paperLight(g, 62, 87, 55, '#ffdf85', '#eea34f', '#c96a42');
  const body = [[21, 82], [27, 65, 46, 58], [63, 49, 85, 56], [101, 60, 116, 74],
    [121, 80, 119, 89], [106, 102, 85, 109], [61, 119, 41, 106],
    [29, 100, 24, 90], [18, 89, 15, 85], [16, 82, 21, 82]];
  cut(g, body, skin, ink, 2.1);
  g.save(); trace(g, body); g.closePath(); g.clip();
  cut(g, [[22, 91], [56, 110, 86, 100], [104, 94, 120, 83], [108, 114, 71, 118],
    [27, 117, 22, 91]], '#f4cc80', null);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const x = 56 + col * 14 + (row % 2) * 6;
      const y = 66 + row * 12 + col * 0.75;
      vein(g, [[x, y], [x + 7, y + 10, x + 14, y + 1]], '#c57c48', 2);
      vein(g, [[x + 2, y + 1], [x + 7, y + 7, x + 11, y + 3]], '#ffd884', 1.3);
    }
  }
  g.restore();
  vein(g, [[47, 61], [58, 72, 53, 88], [51, 97, 44, 103]], '#ac6744', 2.3);
  cut(g, [[48, 91], [58, 90, 70, 100], [63, 101], [67, 105], [54, 105, 48, 96]], '#cf6e49', '#965e43', 1.2);
  oval(g, 34, 76, 6.4, 6.4, cream, ink, 1.3);
  oval(g, 32.5, 76.4, 3.7, 3.9, '#354741');
  oval(g, 31.4, 74.8, 1.25, 1.15, '#fff5c7');
  vein(g, [[23, 87], [27, 89, 30, 87]], '#985c41', 1.3);
  vein(g, [[19, 84], [10, 80, 13, 75], [16, 72, 17, 74]], '#9c643e', 1.5);
  vein(g, [[58, 59], [77, 53, 94, 62]], '#ffdf91', 2.3);
}

function teapot(g) {
  hanger(g, 79, 11, [[53, 68], [107, 66]]);
  tassel(g, 80, 120, 154);
  // A doubled paper strip leaves a genuine transparent hole inside the handle.
  const handle = [[103, 66], [121, 49, 138, 63], [152, 78, 137, 94], [124, 107, 108, 100]];
  vein(g, handle, ink, 14);
  vein(g, handle, '#5d8676', 10.5);
  vein(g, [[110, 65], [124, 55, 135, 66], [145, 78, 134, 89]], '#b0b998', 2);
  cut(g, [[56, 79], [43, 79, 34, 66], [29, 56, 21, 53], [12, 55],
    [14, 60, 20, 62], [22, 84, 33, 94], [42, 102, 53, 101]], '#719a82', ink, 2);
  vein(g, [[22, 61], [27, 82, 44, 88]], '#b9c7a6', 2.6);
  cut(g, [[13, 54], [22, 51, 30, 54], [27, 58, 20, 59], [14, 59, 13, 54]], '#354e44', ink, 1);
  cut(g, [[54, 114], [65, 113, 82, 115], [99, 113, 108, 112],
    [108, 120], [84, 127, 56, 121]], '#517667', ink, 1.7);
  const belly = [[58, 63], [79, 60, 98, 64], [111, 66, 119, 82],
    [128, 100, 110, 112], [99, 120, 79, 120], [55, 121, 43, 109],
    [34, 100, 40, 83], [46, 69, 58, 63]];
  cut(g, belly, paperLight(g, 76, 88, 51, '#edda95', '#a5b68d', '#6a9880'), ink, 2.1);
  for (const pts of [[[63, 66], [45, 86, 52, 108]], [[98, 67], [114, 86, 107, 109]]]) {
    vein(g, pts, '#75977b', 1.5);
  }
  // Curling tea sprig on the translucent belly.
  vein(g, [[61, 105], [73, 93, 93, 84]], '#527661', 1.7);
  cut(g, [[71, 97], [63, 90, 63, 85], [73, 86, 74, 95]], '#71967b', null);
  cut(g, [[79, 92], [86, 92, 92, 96], [82, 100, 77, 94]], '#85a082', null);
  cut(g, [[84, 88], [83, 81, 87, 77], [92, 83, 86, 88]], '#71967b', null);
  oval(g, 94, 84, 3, 2.3, cream);
  cut(g, [[52, 65], [60, 59, 65, 55], [80, 48, 94, 56], [100, 61, 109, 64],
    [108, 69], [83, 75, 53, 69]], '#79a18a', ink, 1.9);
  vein(g, [[56, 64], [78, 70, 105, 64]], gold, 2.6);
  oval(g, 80, 52, 6.5, 5.5, '#a5b18a', ink);
  oval(g, 79, 50.5, 2.5, 1.2, cream);
  vein(g, [[57, 115], [79, 122, 106, 114]], '#cdb882', 2);
}

function rabbit(g) {
  hanger(g, 80, 8, [[56, 78], [100, 65]]);
  tassel(g, 77, 122, 155);
  // Separate, differently inclined ears keep their silhouette clear at rack size.
  cut(g, [[89, 70], [70, 61, 59, 40], [54, 30, 57, 27],
    [60, 22, 69, 29], [88, 40, 97, 61], [99, 68, 89, 70]], '#ead4ad', ink, 1.8);
  cut(g, [[89, 61], [72, 52, 63, 34], [62, 29, 67, 33], [81, 44, 89, 61]], '#cb8c79', null);
  cut(g, [[95, 65], [92, 53, 96, 34], [100, 18, 106, 19], [112, 20, 113, 32],
    [115, 49, 104, 67]], '#f5ddb0', ink, 1.9);
  cut(g, [[99, 59], [97, 40, 105, 27], [110, 41, 101, 59]], '#de9e88', null);
  cut(g, [[41, 93], [33, 84, 26, 89], [22, 88, 19, 93],
    [12, 95, 16, 102], [16, 110, 25, 110], [31, 115, 40, 105]], '#f3dec0', ink, 1.8);
  const body = [[33, 95], [34, 78, 48, 74], [63, 69, 75, 76], [82, 57, 97, 58],
    [110, 54, 120, 64], [126, 69, 127, 76], [136, 78, 140, 84],
    [137, 91, 128, 94], [121, 98, 112, 98], [103, 104, 102, 113],
    [116, 113, 120, 121], [115, 125, 106, 124], [94, 124], [85, 128, 71, 124],
    [57, 127, 43, 122], [30, 115, 33, 95]];
  cut(g, body, paperLight(g, 79, 91, 59, '#fff1bc', '#f8e3af', '#e2c393'), ink, 2.1);
  vein(g, [[47, 83], [59, 76, 67, 81]], '#fff1c8', 2.5);
  vein(g, [[64, 88], [80, 90, 78, 107], [77, 114, 70, 118], [84, 116, 89, 122]], '#b69d74', 1.8);
  vein(g, [[101, 101], [96, 110, 97, 117], [104, 116, 111, 120]], '#b69d74', 1.5);
  // Paper collar and tiny bell are also the lower edge of the lamp's face panel.
  cut(g, [[80, 75], [85, 86, 104, 96], [101, 101], [87, 96, 76, 82]], '#b85c49', '#9a6247', 1);
  oval(g, 99, 101, 2.8, 3.6, gold, '#87633e', 1);
  oval(g, 116, 76, 4.0, 4.5, '#483c36');
  oval(g, 115, 74.7, 1.2, 1.35, '#fff0cf');
  oval(g, 118, 84.4, 4.2, 2.4, '#e9b29b');
  cut(g, [[133, 81], [139, 80, 140, 84], [137, 87], [134, 85]], '#a76557', '#785049', 1);
  vein(g, [[133, 88], [130, 91, 126, 89]], '#936d58', 1.2);
}

const subjects = { stage: lion, boat: carp, tea: teapot, books: rabbit };

function addPaperFibres(g) {
  // Fixed coordinates keep the printed fibres identical between the two states.
  let seed = 45;
  function fraction() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  g.save();
  g.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 520; i++) {
    const x = fraction() * size, y = fraction() * size;
    vein(g, [[x, y], [x + fraction() * 1.8 + 0.3, y - fraction() * 1.1]],
      i % 2 ? 'rgba(255,244,205,.21)' : 'rgba(92,65,44,.095)', 0.35);
  }
  g.restore();
}

function unlitInk(canvas) {
  const g = canvas.getContext('2d');
  g.save();
  g.resetTransform();
  const pixels = g.getImageData(0, 0, canvas.width, canvas.height);
  const rgba = pixels.data;
  for (let i = 0; i < rgba.length; i += 4) {
    if (!rgba[i + 3]) continue;
    const shade = (rgba[i] * .28 + rgba[i + 1] * .54 + rgba[i + 2] * .18) / 255;
    rgba[i] = 72 + 91 * shade;
    rgba[i + 1] = 73 + 82 * shade;
    rgba[i + 2] = 62 + 77 * shade;
  }
  g.putImageData(pixels, 0, 0);
  g.restore();
}

/** Transparent, square PNG. The same data URL is reused for a given lantern and state. */
export function lanternImage(id, lit = true) {
  if (!Object.hasOwn(subjects, id)) throw new RangeError('Unknown lantern: ' + id);
  const key = id + (lit ? '-lit' : '-dim');
  if (prints.has(key)) return prints.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size * 2;
  const g = canvas.getContext('2d', {willReadFrequently: !lit});
  g.scale(2, 2);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  subjects[id](g);
  addPaperFibres(g);
  if (lit) {
    g.globalCompositeOperation = 'destination-over';
    const glow = g.createRadialGradient(82, 87, 16, 82, 87, 68);
    glow.addColorStop(0, 'rgba(255,209,125,.38)');
    glow.addColorStop(.65, 'rgba(255,204,122,.19)');
    glow.addColorStop(1, 'rgba(255,209,125,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, size, size);
  } else unlitInk(canvas);
  const data = canvas.toDataURL('image/png');
  prints.set(key, data);
  return data;
}
