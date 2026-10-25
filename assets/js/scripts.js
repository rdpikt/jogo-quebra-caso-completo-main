/* ---------------- NAVIGATION ---------------- */



const screens = Array.from(document.querySelectorAll('.screen'));



let historyStack = ['menu'];



function goTo(id, opts = {}) {

  if (opts.replace) {

    historyStack[historyStack.length - 1] = id;

  } else if (opts.push !== false) {

    historyStack.push(id);

  }



  screens.forEach(screen => {

    screen.classList.toggle('active', screen.dataset.screen === id);

  });



  if (id === 'phaseSelect') {

    renderPhaseGrid();

  }

}

function goBack() {



  if (historyStack.length <= 1) {

    return;

  }



  historyStack.pop();



  const previous = historyStack[historyStack.length - 1];



  screens.forEach(screen => {

    screen.classList.toggle(

      'active',

      screen.dataset.screen === previous

    );

  });



  if (previous === 'phaseSelect') {

    renderPhaseGrid();

  }

}





/* ---------------- TOAST ---------------- */



function toast(msg, ms = 2200) {



  const t = document.getElementById('toast');



  if (!t) return;



  t.textContent = msg;



  t.classList.add('show');



  clearTimeout(t._timer);



  t._timer = setTimeout(() => {

    t.classList.remove('show');

  }, ms);

}





/* ---------------- EXIT ---------------- */



function doExit() {



  toast('Até a próxima aventura, detetive! 🕵️');

}





/* ---------------- SAVE PROGRESS (placeholder) ---------------- */



function saveProgress() {



  // Aqui futuramente dá para persistir o progresso (ex.: localStorage).

  // Por enquanto é só um placeholder para não quebrar finishPhase().

}





/* ---------------- OPTIONS ---------------- */



function toggleOpt(kind) {



  if (kind === 'tela') {



    const b = document.getElementById('btn-tela');



    if (!b) return;



    const frame = document.getElementById('frame');



    if (!document.fullscreenElement) {



      const el = frame || document.documentElement;



      const req =

        el.requestFullscreen ||

        el.webkitRequestFullscreen ||

        el.msRequestFullscreen;



      if (req) {

        req.call(el).catch(() => {

          toast('Não foi possível ativar a tela cheia.');

        });

      } else {

        toast('Tela cheia não é suportada neste navegador.');

      }



    } else {



      const exit =

        document.exitFullscreen ||

        document.webkitExitFullscreen ||

        document.msExitFullscreen;



      if (exit) {

        exit.call(document);

      }

    }



  } else {



    const b = document.getElementById('btn-som');



    if (!b) return;



    b.dataset.on = b.dataset.on === '1' ? '0' : '1';



    b.textContent =

      b.dataset.on === '1'

        ? '🔇 Som: Desligado'

        : '🔊 Som: Ligado';

  }

}



/* ---------------- SYNC FULLSCREEN TEXT ---------------- */



document.addEventListener('fullscreenchange', syncTelaBtn);

document.addEventListener('webkitfullscreenchange', syncTelaBtn);



function syncTelaBtn() {



  const b = document.getElementById('btn-tela');



  if (!b) return;



  const isFs = !!document.fullscreenElement;



  b.dataset.on = isFs ? '1' : '0';



  b.textContent = isFs

    ? '🖥️ Tela: Janela'

    : '🖥️ Tela: Cheia';

}





/* ---------------- EPISODE INFO ---------------- */



function epiInfo(kind) {



  const map = {



    diarios:

      'As páginas digitalizadas do diário do avô, preservadas para sempre.',



    mapas:

      'Mapas interativos com trilhas, pântanos e áreas de preservação da floresta.',



    especies:

      'Registro das espécies raras encontradas durante as expedições.',



    historias:

      'Relatos de quem viveu a floresta: crianças, guias e moradores.'

  };



  const info = document.getElementById('epi-info');



  if (info) {

    info.textContent = map[kind] || '';

  }

}





/* ---------------- PHASE UNLOCK STATE ---------------- */



let unlocked = {

  1: true,

  2: false,

  3: false,

  4: false

};



let completed = {

  1: false,

  2: false,

  3: false,

  4: false

};



const phaseMeta = {



  1: {

    label: 'Fase 1',

    picto: '🔍',

    screen: 'phase1'

  },



  2: {

    label: 'Fase 2',

    picto: '👻',

    screen: 'phase2'

  },



  3: {

    label: 'Fase 3',

    picto: '📖',

    screen: 'phase3'

  },



  4: {

    label: 'Fase 4',

    picto: '🧭',

    screen: 'phase4'

  }

};





/* ---------------- PHASE GRID ---------------- */



function renderPhaseGrid() {



  const grid = document.getElementById('phase-grid');



  if (!grid) return;



  grid.innerHTML = '';



  [1, 2, 3, 4].forEach(n => {



    const m = phaseMeta[n];



    const div = document.createElement('div');



    div.className =

      'phase-card' +

      (unlocked[n] ? '' : ' locked') +

      (completed[n] ? ' done' : '');



    div.innerHTML =

      '<div class="picto">' +

      m.picto +

      '</div>' +



      '<div class="label">' +

      m.label +

      '</div>' +



      (

        completed[n]

          ? '<div class="check">Concluída ✔</div>'

          : (

            unlocked[n]

              ? ''

              : '<div class="check">🔒 Bloqueada</div>'

          )

      );



    if (unlocked[n]) {



      div.onclick = () => {



        resetPhaseIfNeeded(n);



        goTo(m.screen);

      };

    }



    grid.appendChild(div);

  });

}





/* ---------------- FINISH PHASE ---------------- */

function finishPhase(n) {

  completed[n] = true;



  if (n < 4) {

    unlocked[n + 1] = true;

    saveProgress();



    goTo('phaseSelect', { replace: true });

  } else {

    saveProgress();

    goTo('victory', { replace: true });

  }

}



/* ---------------- RESET PHASE IF NEEDED ---------------- */



function resetPhaseIfNeeded(n) {



  if (n === 1 && !completed[1]) {

    initPhase1();

  }



  if (n === 2 && !completed[2]) {

    initPhase2();

  }



  if (n === 3 && !completed[3]) {

    initPhase3();

  }



  if (n === 4 && !completed[4]) {

    initPhase4();

  }

}





/* ---------------- GENERIC DRAG & DROP ---------------- */



function makeDraggable(item, onDrop) {



  item.addEventListener('pointerdown', function (e) {



    e.preventDefault();



    const rect = item.getBoundingClientRect();



    const offsetX = e.clientX - rect.left;

    const offsetY = e.clientY - rect.top;



    const originParent = item.parentElement;



    // Move para o <body> ANTES de capturar o ponteiro: em alguns

    // navegadores, re-parentar um elemento DEPOIS de capturar o ponteiro

    // invalida a captura e o drag trava com a peça grudada na tela.

    document.body.appendChild(item);



    item.style.position = 'fixed';

    item.style.width = rect.width + 'px';

    item.style.left = rect.left + 'px';

    item.style.top = rect.top + 'px';

    item.style.zIndex = '1000';



    item.classList.add('dragging');



    try {

      item.setPointerCapture(e.pointerId);

    } catch (err) {

      // Se a captura falhar, o drag ainda funciona via listeners no

      // document (fallback abaixo), então só seguimos em frente.

    }



    function move(ev) {



      item.style.left =

        (ev.clientX - offsetX) + 'px';



      item.style.top =

        (ev.clientY - offsetY) + 'px';

    }



    function finishDrag(ev) {



      item.removeEventListener('pointermove', move);

      item.removeEventListener('pointerup', finishDrag);

      item.removeEventListener('pointercancel', finishDrag);

      document.removeEventListener('pointermove', move);

      document.removeEventListener('pointerup', finishDrag);



      item.classList.remove('dragging');



      // Esconde a peça por um instante para o navegador "enxergar"

      // o slot/pool que está embaixo dela.

      const prevDisplay = item.style.display;

      item.style.display = 'none';



      const el = document.elementFromPoint(

        ev.clientX,

        ev.clientY

      );



      item.style.display = prevDisplay;



      item.style.position = '';

      item.style.zIndex = '';

      item.style.left = '';

      item.style.top = '';

      item.style.width = '';



      const slot = el

        ? el.closest('.slot')

        : null;



      const pool = el

        ? el.closest('.pool')

        : null;



      if (slot) {



        const occupant =

          slot.querySelector('.drag-item');



        if (occupant && occupant !== item) {



          originParent.appendChild(occupant);

        }



        slot.appendChild(item);



      } else if (pool) {



        pool.appendChild(item);



      } else {



        originParent.appendChild(item);

      }



      if (onDrop) {

        onDrop();

      }

    }



    item.addEventListener('pointermove', move);

    item.addEventListener('pointerup', finishDrag);

    item.addEventListener('pointercancel', finishDrag);



    // Fallback: caso a captura do ponteiro não funcione neste navegador,

    // escutamos também no document para garantir que o drag não "morra".

    document.addEventListener('pointermove', move);

    document.addEventListener('pointerup', finishDrag);

  });

}





/* ---------------- SLOT HELPER ---------------- */



function slotHasItem(slot) {



  return slot.querySelector('.drag-item') !== null;

}





/* ---------------- SHUFFLE ---------------- */



function shuffle(arr) {



  const a = arr.slice();



  for (let i = a.length - 1; i > 0; i--) {



    const j = Math.floor(

      Math.random() * (i + 1)

    );



    [a[i], a[j]] = [a[j], a[i]];

  }



  return a;

}





/* =========================================================

   PHASE 1

   ========================================================= */



const p1Actions = [



  {

    id: 1,
    ic: './img/icon/card_1_galhos.png',
    isImage: true,


  },



  {

    id: 2,
    ic: './img/icon/card_2_troncos.png',
    isImage: true,
  },



  {

    id: 3,
    ic: './img/icon/card_3_pedras.png',
    isImage: true,
  },



  {

    id: 4,
    ic: './img/icon/card_4_buracos.png',
    isImage: true,
  },



  {

    id: 5,
    ic: './img/icon/card_5_lama.png',
    isImage: true,
  },



  {

    id: 6,
    ic: './img/icon/card_6_passagem.png',
    isImage: true,
  }

];



let p1Hints = 3;





function initPhase1() {
  p1Hints = 3;

  const hints = document.getElementById('p1-hints');
  const feedback = document.getElementById('p1-feedback');
  const slotsRow = document.getElementById('p1-slots');
  const pool = document.getElementById('p1-pool');

  if (!hints || !feedback || !slotsRow || !pool) return;

  hints.textContent = p1Hints;
  feedback.textContent = '';
  feedback.className = 'feedback';
  slotsRow.innerHTML = '';
  pool.innerHTML = '';

  for (let i = 1; i <= 6; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.index = i;
    slot.innerHTML = '<span class="num">' + i + '</span>';
    slotsRow.appendChild(slot);
  }

  shuffle(p1Actions).forEach(action => {
    const item = document.createElement('div');
    item.className = 'drag-item action-item';
    item.dataset.id = action.id;

    const icon = document.createElement('span');
    icon.className = 'ic';

    if (action.isImage) {
      const img = document.createElement('img');
      img.src = action.ic;
      img.alt = '';
      img.className = 'action-img';
      img.onerror = () => console.error('Não foi possível carregar a imagem:', img.src);
      icon.appendChild(img);
    } else {
      icon.textContent = action.ic;
    }

    item.appendChild(icon);

    const label = document.createElement('span');
    label.textContent = action.lbl;
    item.appendChild(label);

    pool.appendChild(item);
    makeDraggable(item);
  });
}


function checkPhase1() {



    const slots = Array.from(

      document.querySelectorAll(

        '#p1-slots .slot'

      )

    );



    const fb =

      document.getElementById(

        'p1-feedback'

      );



    if (!fb) return;



    if (slots.some(slot => !slotHasItem(slot))) {



      fb.className = 'feedback bad';



      fb.textContent =

        'Preencha todas as posições antes de verificar.';



      return;

    }



    const order = slots.map(slot => {



      const item =

        slot.querySelector('.drag-item');



      return Number(item.dataset.id);

    });



    const correct =

      order.every(

        (value, index) =>

          value === index + 1

      );



    if (correct) {



      fb.className = 'feedback ok';



      fb.textContent =

        'Sequência correta! Liberando a estrada...';



      setTimeout(() => {

        goTo('phase1win');

      }, 700);



    } else {



      fb.className = 'feedback bad';



      fb.textContent =

        'Ainda não é essa a ordem certa. Pense: o que precisa sair do caminho primeiro?';

    }

  }





  /* =========================================================

     PHASE 2

     ========================================================= */



  const p2Rules = {



    bota: {

      ic: '👣',

      lbl: 'Pegada de bota',

      action: 'frente',

      actionLbl: 'seguir em frente'

    },



    fita: {

      ic: '🎀',

      lbl: 'Fita amarela',

      action: 'esquerda',

      actionLbl: 'virar à esquerda'

    },



    galho: {

      ic: '🪵',

      lbl: 'Galho quebrado',

      action: 'direita',

      actionLbl: 'virar à direita'

    },



    coruja: {

      ic: '🦉',

      lbl: 'Assobio da coruja',

      action: 'observar',

      actionLbl: 'parar e observar'

    }

  };





  const p2Path = [

    'coruja',

    'galho',

    'fita'

  ];



  let p2Step = 0;





  function initPhase2() {



    p2Step = 0;



    const feedback =

      document.getElementById(

        'p2-feedback'

      );



    const progress =

      document.getElementById(

        'p2-progress'

      );



    if (!feedback || !progress) {

      return;

    }



    feedback.textContent = '';

    feedback.className = 'feedback';



    progress.innerHTML = '';



    p2Path.forEach((_, i) => {



      const d =

        document.createElement('div');



      d.className = 'step';



      d.textContent = i + 1;



      progress.appendChild(d);

    });



    renderP2Clue();

  }





  function renderP2Clue() {



    const steps =

      Array.from(

        document.querySelectorAll(

          '#p2-progress .step'

        )

      );



    steps.forEach((el, i) => {



      el.classList.toggle(

        'active',

        i === p2Step

      );



      el.classList.toggle(

        'done',

        i < p2Step

      );

    });



    if (p2Step >= p2Path.length) {

      return;

    }



    const clue =

      p2Rules[p2Path[p2Step]];



    if (!clue) {

      return;

    }



    const icon =

      document.getElementById(

        'p2-clue-icon'

      );



    const label =

      document.getElementById(

        'p2-clue-label'

      );



    if (icon) {

      icon.textContent = clue.ic;

    }



    if (label) {

      label.textContent =

        'Você encontra: ' +

        clue.lbl;

    }

  }





  function p2answer(action) {



    if (p2Step >= p2Path.length) {

      return;

    }



    const fb =

      document.getElementById(

        'p2-feedback'

      );



    if (!fb) {

      return;

    }



    const clue =

      p2Rules[p2Path[p2Step]];



    if (!clue) {

      return;

    }



    if (action === clue.action) {



      p2Step++;



      fb.className = 'feedback ok';



      fb.textContent =

        'Correto! Devem ' +

        clue.actionLbl +

        '.';



      if (p2Step >= p2Path.length) {



        setTimeout(() => {

          goTo('phase2win');

        }, 700);



      } else {



        setTimeout(() => {

          renderP2Clue();

        }, 400);

      }



    } else {



      fb.className = 'feedback bad';



      fb.textContent =

        'Releia o Caderno de Pistas: o que a regra diz para "' +

        clue.lbl.toLowerCase() +

        '"?';

    }

  }





  /* =========================================================

     PHASE 3

     ========================================================= */



  const p3Books = [



    {

      id: 'sol',

      ic: '☀️',

      lbl: 'Sol'

    },



    {

      id: 'lago',

      ic: '🌊',

      lbl: 'Lago'

    },



    {

      id: 'floresta',

      ic: '🌲',

      lbl: 'Floresta'

    },



    {

      id: 'coruja',

      ic: '🦉',

      lbl: 'Coruja'

    },



    {

      id: 'bussola',

      ic: '🧭',

      lbl: 'Bússola'

    }

  ];





  let p3Hints = 3;





  /*

    Uma solução válida para as dicas.

  */

  const p3HintOrder = [

    'sol',

    'lago',

    'floresta',

    'bussola',

    'coruja'

  ];





  function initPhase3() {



    p3Hints = 3;



    const hints =

      document.getElementById(

        'p3-hints'

      );



    const feedback =

      document.getElementById(

        'p3-feedback'

      );



    const slotsRow =

      document.getElementById(

        'p3-slots'

      );



    const pool =

      document.getElementById(

        'p3-pool'

      );



    if (

      !hints ||

      !feedback ||

      !slotsRow ||

      !pool

    ) {

      return;

    }



    hints.textContent = p3Hints;



    feedback.textContent = '';

    feedback.className = 'feedback';



    slotsRow.innerHTML = '';

    pool.innerHTML = '';



    for (let i = 1; i <= 5; i++) {



      const slot =

        document.createElement('div');



      slot.className = 'slot';



      slot.dataset.index = i;



      slot.innerHTML =

        '<span class="num">' +

        i +

        '</span>';



      slotsRow.appendChild(slot);

    }



    shuffle(p3Books).forEach(book => {



      const item =

        document.createElement('div');



      item.className =

        'drag-item book-item';



      item.dataset.id =

        book.id;



      item.innerHTML =

        '<span class="ic">' +

        book.ic +

        '</span>' +



        '<span>' +

        book.lbl +

        '</span>';



      pool.appendChild(item);



      makeDraggable(item);

    });

  }





  function checkPhase3() {



    const slots =

      Array.from(

        document.querySelectorAll(

          '#p3-slots .slot'

        )

      );



    const fb =

      document.getElementById(

        'p3-feedback'

      );



    if (!fb) {

      return;

    }



    if (

      slots.some(

        slot => !slotHasItem(slot)

      )

    ) {



      fb.className = 'feedback bad';



      fb.textContent =

        'Preencha todas as posições antes de verificar.';



      return;

    }



    const order =

      slots.map(slot => {



        const item =

          slot.querySelector(

            '.drag-item'

          );



        return item.dataset.id;

      });



    const idx = id =>

      order.indexOf(id);



    const ok =

      idx('sol') < idx('floresta') &&



      idx('lago') < idx('coruja') &&



      idx('floresta') < idx('bussola') &&



      idx('bussola') !== order.length - 1;



    if (ok) {



      fb.className = 'feedback ok';



      fb.textContent =

        'A gaveta se abriu! Ordem correta.';



      setTimeout(() => {

        goTo('phase3win');

      }, 700);



    } else {



      fb.className = 'feedback bad';



      fb.textContent =

        'A ordem não respeita todas as pistas do caderno. Revise com calma.';

    }

  }





  /* =========================================================

     HINT SYSTEM

     ========================================================= */



  function useHint(phase) {



    /* ---------------- PHASE 1 ---------------- */



    if (phase === 1) {



      if (p1Hints <= 0) {

        toast('Você não possui mais dicas.');

        return;

      }



      const emptySlot =

        Array.from(

          document.querySelectorAll(

            '#p1-slots .slot'

          )

        ).find(

          slot => !slotHasItem(slot)

        );



      if (!emptySlot) {



        toast(

          'Todas as posições já estão preenchidas.'

        );



        return;

      }



      p1Hints--;



      const hints =

        document.getElementById(

          'p1-hints'

        );



      if (hints) {

        hints.textContent = p1Hints;

      }



      const correctId =

        Number(

          emptySlot.dataset.index

        );



      const card =

        document.querySelector(

          '#p1-pool .drag-item[data-id="' +

          correctId +

          '"]'

        );



      if (card) {



        toast(

          'Pista: "' +

          card.textContent.trim() +

          '" pertence à posição ' +

          correctId +

          '.'

        );

      }



      return;

    }





    /* ---------------- PHASE 3 ---------------- */



    if (phase === 3) {



      if (p3Hints <= 0) {

        toast('Você não possui mais dicas.');

        return;

      }



      const emptySlot =

        Array.from(

          document.querySelectorAll(

            '#p3-slots .slot'

          )

        ).find(

          slot => !slotHasItem(slot)

        );



      if (!emptySlot) {



        toast(

          'Todas as posições já estão preenchidas.'

        );



        return;

      }



      p3Hints--;



      const hints =

        document.getElementById(

          'p3-hints'

        );



      if (hints) {

        hints.textContent = p3Hints;

      }



      const index =

        Number(

          emptySlot.dataset.index

        ) - 1;



      const bookId =

        p3HintOrder[index];



      const book =

        p3Books.find(

          book => book.id === bookId

        );



      if (book) {



        toast(

          'Pista: o livro "' +

          book.lbl +

          '" pode ir na posição ' +

          (index + 1) +

          '.'

        );

      }



      return;

    }

  }





  /* =========================================================

     PHASE 4 - GRAPH MAP

     ========================================================= */



  const p4Nodes = {



    start: {

      x: 12,

      y: 18,

      type: 'start'

    },



    a: {

      x: 30,

      y: 38,

      type: 'path'

    },



    dead1: {

      x: 14,

      y: 60,

      type: 'dead'

    },



    b: {

      x: 52,

      y: 22,

      type: 'path'

    },



    dead2: {

      x: 80,

      y: 18,

      type: 'dead'

    },



    myst1: {

      x: 62,

      y: 42,

      type: 'mystery',

      text:

        '"Ele guardava o diário perto do riacho, onde a água nunca cala."'

    },



    c: {

      x: 66,

      y: 62,

      type: 'path'

    },



    myst2: {

      x: 85,

      y: 70,

      type: 'mystery',

      text:

        '"As engrenagens eram um presente do avô dele, feito à mão."'

    },



    treasure: {

      x: 48,

      y: 85,

      type: 'treasure'

    }

  };





  const p4Edges = [



    ['start', 'a'],



    ['a', 'dead1'],



    ['a', 'b'],



    ['b', 'dead2'],



    ['b', 'myst1'],



    ['myst1', 'c'],



    ['c', 'myst2'],



    ['c', 'treasure']

  ];





  const p4Icon = {



    start: '👣',



    path: '🌲',



    dead: '✖',



    mystery: '🔮',



    treasure: '🏆'

  };





  let p4Current;

  let p4Energy;

  let p4MaxEnergy = 5;

  let p4Visited;





  /* ---------------- INIT PHASE 4 ---------------- */



  function initPhase4() {



    p4Current = 'start';



    p4Energy = p4MaxEnergy;



    p4Visited =

      new Set(['start']);



    const msg =

      document.getElementById(

        'p4-msg'

      );



    if (msg) {



      msg.textContent =

        'Clique em um nó conectado para se mover.';

    }



    renderEnergy();



    renderMap();

  }





  /* ---------------- ENERGY ---------------- */



  function renderEnergy() {



    const bar =

      document.getElementById(

        'p4-energy'

      );



    if (!bar) {

      return;

    }



    bar.innerHTML = '';



    for (

      let i = 0;

      i < p4MaxEnergy;

      i++

    ) {



      const cell =

        document.createElement('div');



      cell.className =

        'energy-cell' +

        (

          i < p4Energy

            ? ' filled'

            : ''

        );



      bar.appendChild(cell);

    }

  }





  /* ---------------- NEIGHBORS ---------------- */



  function neighbors(id) {



    const list = [];



    p4Edges.forEach(([x, y]) => {



      if (x === id) {

        list.push(y);

      }



      if (y === id) {

        list.push(x);

      }

    });



    return list;

  }





  /* ---------------- RENDER MAP ---------------- */



  function renderMap() {



    const wrap =

      document.getElementById(

        'p4-map'

      );



    const svg =

      document.getElementById(

        'p4-svg'

      );



    if (!wrap || !svg) {

      return;

    }



    Array.from(

      wrap.querySelectorAll('.node')

    ).forEach(node => {

      node.remove();

    });



    svg.innerHTML = '';



    const reach =

      neighbors(p4Current);





    /* ---------------- EDGES ---------------- */



    p4Edges.forEach(([x, y]) => {



      const n1 = p4Nodes[x];

      const n2 = p4Nodes[y];



      const line =

        document.createElementNS(

          'http\://www.w3.org/2000/svg',

          'line'

        );



      line.setAttribute(

        'x1',

        n1.x + '%'

      );



      line.setAttribute(

        'y1',

        n1.y + '%'

      );



      line.setAttribute(

        'x2',

        n2.x + '%'

      );



      line.setAttribute(

        'y2',

        n2.y + '%'

      );



      line.setAttribute(

        'stroke',

        'rgba(155,93,229,.35)'

      );



      line.setAttribute(

        'stroke-width',

        '2'

      );



      line.setAttribute(

        'stroke-dasharray',

        '4 4'

      );



      svg.appendChild(line);

    });





    /* ---------------- NODES ---------------- */



    Object.entries(p4Nodes).forEach(

      ([id, node]) => {



        const el =

          document.createElement('div');



        el.className =

          'node type-' +

          node.type;



        if (node.type === 'dead') {

          el.classList.add('dead');

        }



        if (node.type === 'mystery') {

          el.classList.add('mystery');

        }



        if (node.type === 'treasure') {

          el.classList.add('treasure');

        }



        if (id === p4Current) {



          el.classList.add('current');



        } else if (reach.includes(id)) {



          el.classList.add('reachable');



        }



        if (

          p4Visited.has(id) &&

          id !== p4Current

        ) {



          el.classList.add('visited');

        }



        el.style.left =

          node.x + '%';



        el.style.top =

          node.y + '%';



        el.textContent =

          p4Icon[node.type];



        el.title =

          node.type;



        if (

          id === p4Current ||

          reach.includes(id)

        ) {



          el.addEventListener(

            'click',

            () => p4Move(id)

          );

        }



        wrap.appendChild(el);

      }

    );

  }





  /* ---------------- MOVE PHASE 4 ---------------- */



  function p4Move(id) {



    if (id === p4Current) {

      return;

    }



    const n =

      p4Nodes[id];



    if (!n) {

      return;

    }



    const msg =

      document.getElementById(

        'p4-msg'

      );



    if (!msg) {

      return;

    }





    /* ---------------- DEAD END ---------------- */



    if (n.type === 'dead') {



      p4Energy--;



      renderEnergy();



      msg.textContent =

        'Beco sem saída! Vocês perderam 1 ponto de energia e voltaram.';



      if (p4Energy <= 0) {



        setTimeout(() => {



          toast(

            'Energia esgotada! Voltando ao início da trilha.'

          );



          initPhase4();



        }, 600);



        return;

      }



      renderMap();



      return;

    }





    /* ---------------- NORMAL MOVE ---------------- */



    p4Current = id;



    p4Visited.add(id);





    /* ---------------- MYSTERY ---------------- */



    if (n.type === 'mystery') {



      msg.textContent =

        '🔮 Memória do velho: ' +

        n.text;



    }





    /* ---------------- TREASURE ---------------- */



    else if (n.type === 'treasure') {



      msg.textContent =

        'Vocês encontraram o diário perdido!';



      renderMap();



      setTimeout(() => {



        finishPhase(4);



      }, 900);



      return;

    }





    /* ---------------- PATH ---------------- */



    else {



      msg.textContent =

        'Vocês seguem em frente pela trilha...';

    }



    renderMap();

  }





  /* =========================================================

     RESTART GAME

     ========================================================= */



  function restartGame() {



    unlocked = {



      1: true,

      2: false,

      3: false,

      4: false

    };



    completed = {



      1: false,

      2: false,

      3: false,

      4: false

    };



    historyStack = ['menu'];



    p1Hints = 3;

    p2Step = 0;

    p3Hints = 3;



    goTo(

      'menu',

      {

        push: false

      }

    );



    initPhase1();

    initPhase2();

    initPhase3();

    initPhase4();

  }





  /* =========================================================

     INITIALIZATION

     ========================================================= */



  initPhase1();

  initPhase2();

  initPhase3();

  initPhase4();