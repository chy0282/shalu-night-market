import {soundButton} from './sound-settings.js';
import {places, el, button, focusTitle, townBounds, layout, crossStreets, lanes} from './city.js';
import {halfRiver, riverX} from './riverbank.js';
import {lanternImage} from './lanterns.js';

const margin = 3;
const mapWidth = townBounds.x1 - townBounds.x0 + 2 * margin;
const mapDepth = townBounds.z1 - townBounds.z0 + 2 * margin;
const rowsOfTrees = [[-31,-21],[-11,-23],[11,-23],[30,-22],[-30,-5],[-12,7],[27,7],[-31,23],[12,24],[30,23]];
const houses = [[-27,-19],[-16,-20],[-11,-17],[12,-19],[24,-19],[29,-17],[-17,-5],[-11,-4],[12,-5],[26,-4],[-28,8],[-16,7],[15,9],[25,8],[-17,21],[15,22],[26,21]];

function toMap(x, z) {
  return [100 * (x - townBounds.x0 + margin) / mapWidth, 100 * (z - townBounds.z0 + margin) / mapDepth];
}

function drawMap(canvas) {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  if (!width || !height) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const g = canvas.getContext('2d');
  g.scale(canvas.width / width, canvas.height / height);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  const unit = Math.max(.55, Math.min(width / 780, height / 380, 1.25));
  function pixel(x, z) {
    const [px, py] = toMap(x, z);
    return [px * width / 100, py * height / 100];
  }
  function trace(points) {
    g.beginPath();
    g.moveTo(...points[0]);
    for (const point of points.slice(1)) g.lineTo(...point);
  }
  function line(points, color, size) {
    trace(points);
    g.strokeStyle = color;
    g.lineWidth = size;
    g.stroke();
  }
  function cut(points, color, outline) {
    trace(points);
    g.closePath();
    g.fillStyle = color;
    g.fill();
    if (outline) {
      g.strokeStyle = outline;
      g.lineWidth = .9;
      g.stroke();
    }
  }
  function put(x, z, draw) {
    g.save();
    g.translate(...pixel(x, z));
    g.scale(unit, unit);
    draw();
    g.restore();
  }

  // Tiny cut-paper neighbourhoods leave the three river crossings legible.
  for (const [x,z] of rowsOfTrees) {
    put(x, z, () => {
      for (const [dx,dy,s] of [[-8,0,.76],[5,-4,1],[14,5,.63]]) {
        g.save(); g.translate(dx,dy); g.scale(s,s);
        cut([[-8,1],[-9,-7],[-5,-13],[1,-17],[6,-12],[9,-5],[7,1],[1,4]], '#acb89a');
        cut([[1,-16],[7,-12],[10,-5],[7,1],[1,3]], '#899e87');
        line([[1,-8],[1,6]], '#827954', 1.8);
        g.restore();
      }
    });
  }
  for (const [index,[x,z]] of houses.entries()) {
    put(x, z, () => {
      const roof = ['#708b85','#8c9a88','#ba8d70'][index % 3];
      cut([[-11,4],[8,6],[14,2],[1,-1]], '#b9ac87');
      cut([[-10,-5],[7,-6],[7,4],[-10,3]], '#f4deb1', '#a29674');
      cut([[7,-6],[13,-8],[13,2],[7,4]], '#d5bf92', '#a29674');
      cut([[-14,-5],[-8,-12],[11,-13],[8,-6],[-3,-4]], roof, '#758172');
      cut([[8,-6],[11,-13],[16,-8]], '#526e68');
      line([[-5,-9],[4,-10]], '#bdc3a8', .9);
      g.fillStyle = '#887963';
      g.fillRect(-5,-2,2,5);
      g.fillRect(1,-3,3,2);
    });
  }
  const depths = Array.from({length: 71}, (_, i) => i - 35);
  const bank = side => depths.map(z => pixel(riverX(z) + side * halfRiver(z), z));
  const west = bank(-1), east = bank(1);
  cut([...west, ...east.slice().reverse()], '#9fc9bd');
  for (const side of [west,east]) {
    line(side, '#b4a17a', 3.4 * unit);
    line(side, '#f8e9bd', 1.6 * unit);
  }
  for (let z = -31; z < 31; z += 1.48) {
    const x = riverX(z) + Math.sin(z * 2.4) * 2.1;
    line([pixel(x-.48,z),pixel(x-.1,z+.13),pixel(x+.58,z+.1)], '#d8e7cc', 1.1 * unit);
  }
  function road(points, size) {
    line(points, '#c9b48b', size + 2 * unit);
    line(points, '#fff0c9', size);
  }
  for (const x of lanes) {
    road([pixel(x,-26), pixel(x,26)], 1.65 * width / mapWidth);
    for (let z = -25; z < 26; z += 3.2) {
      line([pixel(x-.47,z),pixel(x+.17,z+.05)], '#e3d1aa', .9 * unit);
    }
  }
  for (const z of crossStreets) {
    road([pixel(-34,z),pixel(34,z)], 1.68 * height / mapDepth);
    for (let x = -32; x < 33; x += 3.7) {
      line([pixel(x,z-.38),pixel(x,z+.16),pixel(x+.4,z+.16)], '#e0cba2', .85 * unit);
    }
    const x = riverX(z), stone = z === 1.35, half = stone ? 5.8 : 5.1;
    const deck = [pixel(x-half,z-.83),pixel(x+half,z-.83),pixel(x+half,z+.83),pixel(x-half,z+.83)];
    cut(deck, stone ? '#d5c7a4' : '#d0ac7d', '#9d8664');
    for (let dx = -half + .4; dx < half; dx += .77) {
      line([pixel(x+dx,z-.76),pixel(x+dx,z+.76)], stone ? '#b2a587' : '#ae8861', .8 * unit);
    }
    for (const side of [-1,1]) {
      const rz = z + side * .86;
      line([pixel(x-half,rz),pixel(x,rz-.26),pixel(x+half,rz)], stone ? '#807e6d' : '#8d7159', 1.9 * unit);
      for (const at of [-half,0,half]) line([pixel(x+at,rz-.37),pixel(x+at,rz+.08)], '#887960', 2 * unit);
    }
  }
  put(layout.gate.x, layout.gate.z, () => {
    for (const dx of [-13,10]) {
      g.fillStyle = '#ac6954'; g.fillRect(dx,-12,4,15);
      g.fillStyle = '#d5bf92'; g.fillRect(dx-1,1,6,3);
    }
    cut([[-19,-13],[-12,-15],[-7,-20],[8,-20],[13,-16],[19,-14],[13,-11],[-13,-11]], '#637f78', '#59726b');
    cut([[-16,-8],[-9,-10],[10,-10],[16,-8],[13,-6],[-13,-6]], '#7e9c8a', '#59726b');
    cut([[-6,-12],[7,-12],[6,-7],[-5,-7]], '#e8c174', '#977d57');
  });
  // The costume bunting, tea canopy, moon gate and painted boat match their
  // counterparts beside the four destinations in the walkable city.
  put(-28.2,-10.66, () => {
    line([[-16,0],[-16,-17]], '#917350', 2);
    line([[16,0],[16,-17]], '#917350', 2);
    line([[-16,-16],[-4,-13],[4,-13],[16,-16]], '#957455', 1);
    for (const [lx,ly,fill] of [[-12,-15,'#c8755b'],[-4,-13,'#dab66a'],[5,-13,'#7aa19a']]) {
      cut([[lx,ly],[lx+5,ly],[lx+3,ly+6]],fill);
    }
  });
  put(14.83,-8.08, () => {
    line([[0,0],[0,-15]],'#9f825c',2);
    cut([[-14,-12],[0,-21],[14,-12],[8,-10],[0,-11],[-7,-10]], '#e5ad7c','#a98262');
    cut([[-7,-11],[0,-21],[1,-11]], '#f4cea0');
    cut([[2,-11],[0,-21],[9,-11]], '#c88868');
    line([[-9,0],[7,0]], '#b99e76', 2);
  });
  put(-13.82,21.85, () => {
    // Build the wall in two halves to keep the moon-shaped opening transparent.
    cut([[-18,2],[-18,-12],[-2,-12],[-6,-9],[-8,-5],[-7,0],[-5,2]], '#d9cda6', '#9d997f');
    cut([[5,2],[7,-1],[8,-6],[6,-10],[2,-12],[18,-12],[18,2]], '#e1d6af', '#9d997f');
    line([[-19,-12],[-11,-13],[-7,-16],[7,-16],[11,-13],[19,-12]], '#839585', 2.2);
  });
  put(layout.boat.x-4.75,layout.boat.z+3.70, () => {
    g.rotate(-.75);
    cut([[-18,2],[-11,4],[13,4],[18,1],[12,8],[-10,8]], '#967256', '#816a55');
    cut([[-8,2],[-8,-7],[8,-7],[10,3]], '#e7c693', '#a28867');
    cut([[-12,-6],[-8,-10],[8,-10],[13,-6]], '#758f84', '#687f74');
    line([[-3,-5],[-3,1]], '#ac7358', 2);
    line([[4,-5],[4,1]], '#ac7358', 2);
    line([[-15,10],[-7,11],[5,10]], '#e5efd6', 1.3);
  });
}

function placePin(place, collected, recommended, onPick) {
  const pin = button('', 'atlas-pin', () => onPick(place));
  pin.dataset.place = place.id;
  pin.dataset.collected = String(collected);
  if (recommended) {
    pin.dataset.recommended = 'true';
    pin.setAttribute('aria-current', 'true');
  }
  pin.style.setProperty('--ink', place.color);
  const [x,y] = toMap(place.x,place.z);
  pin.style.left = x + '%';
  pin.style.top = y + '%';
  const lantern = el('img', 'atlas-lantern');
  lantern.src = lanternImage(place.id, true);
  lantern.alt = '';
  const platform = el('span', 'atlas-platform');
  platform.append(lantern);
  const details = el('span', 'atlas-pin-copy');
  details.append(el('b', 'district-name', place.bank), el('span', 'atlas-topic', place.short + ' · ' + place.topic));
  const action = el('small', 'atlas-pin-action', collected ? '已集燈 · 再挑戰' : '前往集燈');
  pin.append(platform, details, action);
  if (recommended) pin.append(el('span', 'atlas-recommend', '建議前往'));
  return pin;
}

let mapObserver;
export function showAtlas(panel, {position, earned, destination = null, onPick, onClose, onFestival}) {
  mapObserver?.disconnect();
  panel.className = 'overlay atlas-overlay';
  panel.replaceChildren();
  panel.hidden = false;
  panel.scrollTop = 0;
  const card = el('article', 'atlas paper-panel');
  card.setAttribute('role','dialog');
  card.setAttribute('aria-modal','true');
  card.setAttribute('aria-labelledby','atlas-title');
  const head = el('div','paper-head');
  const titles = el('div','atlas-titles'), title = el('h2','','古城地圖');
  title.id = 'atlas-title';
  titles.append(el('p','kicker','沙呂城'), title);
  head.append(titles, soundButton(), button('返回街道','text-btn atlas-return',onClose));

  const board = el('div','atlas-map'), canvas = el('canvas');
  canvas.setAttribute('aria-hidden','true');
  board.append(canvas);
  for (const place of places) {
    board.append(placePin(place, earned.includes(place.id), destination?.id === place.id, onPick));
  }
  const me = el('span','you-mark');
  const closest = places.reduce((near,p) =>
    Math.hypot(p.x-position.x,p.z-position.z) < Math.hypot(near.x-position.x,near.z-position.z) ? p : near);
  me.setAttribute('role','img');
  me.setAttribute('aria-label','你的位置，最接近' + closest.bank);
  const [x,y] = toMap(position.x,position.z);
  me.style.left = x + '%';
  me.style.top = y + '%';
  board.append(me);
  const foot = el('div','atlas-foot');
  foot.append(el('span','legend','你的位置'),el('span','atlas-instruction','點選街區指路，走進金圈開始遊戲。'));
  if (earned.length === places.length) foot.append(button('重看亮燈','text-btn atlas-festival',onFestival));
  card.append(head,board,foot);
  panel.append(card);
  drawMap(canvas);
  mapObserver = new ResizeObserver((_entries, observer) => {
    if (canvas.isConnected) drawMap(canvas);
    else observer.disconnect();
  });
  mapObserver.observe(board);
  focusTitle(card);
}
