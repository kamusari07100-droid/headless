// ==UserScript==
// @name         Headless 7777's
// @namespace    http://tampermonkey.net/
// @version      v0.3
// @description  7777
// @author       7777
// @match        *://arras.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=arras.io
// @require      https://cdnjs.cloudflare.com/ajax/libs/msgpack-lite/0.1.26/msgpack.min.js
// @grant        none
// ==/UserScript==



let menu = document.createElement("div");
menu.id = "scriptMenu";

menu.style.position = "fixed";
menu.style.top = "50%";
menu.style.left = "50%";
menu.style.transform = "translate(-50%, -50%)";
menu.style.width = "500px";
menu.style.height = "550px";

menu.style.background = "rgba(0,0,0,0.7)";
menu.style.color = "white";

menu.style.font = "17px Ubuntu";
menu.style.zIndex = 7777;
menu.style.borderRadius = "10px";
menu.style.fontSize = "20px";
menu.style.padding = "10px";

menu.style.display = "block";
menu.style.gap = "10px";


// MENU HTML
menu.innerHTML = `
<p>
    <b>Local:</b> <span id="serverStatus1">❌ Connecting...</span>
    &nbsp;&nbsp;
    <b>Codespace:</b> <span id="serverStatus2">❌ Connecting...</span>
</p>
<p>
    <button id="reconnectServer">Reconnect All</button>
</p>
<p>
    Tank <select id="tankSelect"></select>
</p>
<p>
    Server hash <input id="serverHash"></input>
</p>
<p>
    Following mouse <input id="mbs" type="checkbox" checked></input>
</p>
<p>
    Feed <input id="feeding" type="checkbox"></input>
</p>
<p>
    <button id="connectNoob">Connect a Bot (Both)</button>
</p>
<p>
    <button id="multiSpawn">Spawn Multiple</button>
    <input id="spawnCount" type="number" value="5" min="1" max="300" style="width:60px;margin-left:8px;">
    <span style="font-size:15px;margin-left:6px;">bots &nbsp;|&nbsp; delay: </span>
    <input id="spawnDelay" type="number" value="0" min="0" max="5000" step="100" style="width:70px;">
    <span style="font-size:15px;">ms</span>
</p>
<p>
    <span id="spawnProgress" style="font-size:15px;color:#aaffaa;"></span>
</p>
<p>
    <button id="deleteNoobs">Kill All Bots (Both)</button>
</p>
`;

document.body.appendChild(menu);

const getEl = id => document.getElementById(id);
const HTML = {
    serverStatus1: getEl("serverStatus1"),
    serverStatus2: getEl("serverStatus2"),
    reconnectServer: getEl("reconnectServer"),
    tankSelect: getEl("tankSelect"),
    serverHash: getEl("serverHash"),
    mbs: getEl("mbs"),
    feeding: getEl("feeding"),
    connectNoob: getEl("connectNoob"),
    multiSpawn: getEl("multiSpawn"),
    spawnCount: getEl("spawnCount"),
    spawnDelay: getEl("spawnDelay"),
    spawnProgress: getEl("spawnProgress"),
    deleteNoobs: getEl("deleteNoobs")
};


// TANK SELECT
const tanks = {
     basic: { name: "Basic" },
    auto6: { name: "Auto-4/6" },
    mega3: { name: "Mega-3" },
    rocket: { name: "Rocket (ram)" },
    anni: { name: "Annihilator" },
    shotgun: { name: "Shotgun" },
    pursuer: { name: "Pursuer" },
    engineer: { name: "Engineer" },
    assembler: { name: "Assembler" },
    architect: { name: "Architect" },
    firework: { name: "Firework" },
    coli: { name: "Collision" },
    levi: { name: "Leviathan" },
    spike: { name: "Spike" },
    thorn: { name: "Thorn" },
    slammer: { name: "Slammer" },
    basher: { name: "Basher" },
    phys: { name: "Physician" },
    triangle: { name: "Tri-Angle", tanks: ["fighter", "autotriangle", "surfer", "eagle", "bomber", "vulture", "phoenix"] },
    triangle_ar: { name: "Tri-Angle (Arms race)", tanks: ["browser", "strider", "autobomber", "tripleautotriangle", "surferdrive", "electrocutor", "kicker", "megaautotriangle", "roller", "autoeagle"] },
    launchers: { name: "Launchers", tanks: ["skimmer", "twister", "swarmer", "sidewinder", "fieldgun"] },
    launchers_ar: { name: "Launchers (Arms race)", tanks: ["hyperskimmer", "skidder", "gyro", "hypercluster", "coli", "molotov", "hypertwister", "ream"] },
    annies: { name: "Annihilators (Arms race)", tanks: ["obliterator", "compound", "wiper", "stomper", "autoanni", "shaver", "eradicator"] },
    drones: { name: "Drones", tanks: ["overczar", "tyrant", "autooverlord", "megaautooverseer", "tripleautooverseer", "autooverdrive", "headman", "overcheese", "overstorm"] },
    necro: { name: "Underseer (Arms race)", tanks: ["diviner", "autonecro", "necrodrive", "megaautounderdrive", "tripleautunderdrive", "pentamancer", "pentadrive", "warlock", "autopentaseer"] },
    carriers: { name: "Carriers (Arms race)", tanks: ["warship", "battlerdrive", "bismarck", "proddrive", "manufacture", "dirigible", "autobattleship", "autoprod", "autocruiserdrive"] },
    auto3: { name: "Auto-3", tanks: ["auto5", "mega3", "auto6"] },
    auto3_ar: { name: "Auto-3 (Arms race)", tanks: ["auto6", "auto7", "mega5", "batter4", "hurler3", "autoauto4"] },
    dps: { name: "DPS", tanks: ["penta", "spread", "octo", "autogunner", "triplet", "predator", "triplex", "quadruplex", "machinegunner"] },
    dps_ar: { name: "DPS (Arms race)", tanks: ["toppler", "coli", "crack", "autooperator", "manufacture", "lorry"] },
    smashers: { name: "Smashers", tanks: ["megasmasher", "spike", "autosmasher", "landmine"] },
    spikes_ar: { name: "Spikes (Arms race)", tanks: ["thorn", "megaspike", "claymore", "spear", "prick"] },
    crash: { name: "Crash (Arms race)", tanks: ["whirlwind", "tempest", "septamech", "doubleequalizer", "rigger", "lorry", "manufacture", "doublespread", "palisade"] }
};
for (const tank in tanks) {
    if (!Object.hasOwn(tanks, tank)) continue;
    if (tank == "triangle") {
        HTML.tankSelect.innerHTML += "<option disabled></option>";
        HTML.tankSelect.innerHTML += "<option disabled>Branches</option>";
    }
    HTML.tankSelect.innerHTML += `<option value="${tank}">${tanks[tank].name}</option>`;
}


// SERVERS
// To add more servers just add another entry to this array
const SERVERS = [
    { url: "ws://localhost:8082",                                               statusElId: "serverStatus1" },
    { url: "wss://zany-enigma-xrwj6q77jj7q29xrx-8082.app.github.dev/",  statusElId: "serverStatus2" },];

let connections = SERVERS.map(() => null);

function packetTo(ws, ...args) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(msgpack.encode(args));
    }
}

function packetAll(...args) {
    for (const ws of connections) {
        packetTo(ws, ...args);
    }
}

function connectServer(i) {
    const server = SERVERS[i];
    const statusEl = getEl(server.statusElId);
    statusEl.innerHTML = "⏳ Connecting...";

    const ws = new WebSocket(server.url);
    ws.binaryType = "arraybuffer";
    connections[i] = ws;

    ws.onopen = () => {
        statusEl.innerHTML = "✅ Connected";
        packetTo(ws, "M", 72011);
    };

    ws.onmessage = m => {
        const data = msgpack.decode(new Uint8Array(m.data));
        const type = data.shift();
        if (type == "M") {
            packetTo(ws, "C", data[0] ^ 845);
            statusEl.innerHTML = "✅ Ready";
            const val = HTML.tankSelect.value;
            packetTo(ws, "Z", tanks[val].tanks || val);
        }
    };

    ws.onclose = () => {
        statusEl.innerHTML = "❌ Disconnected";
        connections[i] = null;
    };
}

function connectAll() {
    for (let i = 0; i < SERVERS.length; i++) {
        connectServer(i);
    }
}

connectAll();

HTML.reconnectServer.addEventListener("click", () => {
    for (let i = 0; i < SERVERS.length; i++) {
        if (connections[i]) connections[i].close();
    }
    connectAll();
});


// TANK SELECT
function selectTank() {
    const val = HTML.tankSelect.value;
    packetAll("Z", tanks[val].tanks || val);
}

HTML.tankSelect.addEventListener("change", () => {
    selectTank();
});


// OUR KEYS
let keys = {};

window.addEventListener("keydown", e => {
    if (keys[e.code]) return;
    keys[e.code] = true;
    if (e.code == "Escape") {
        menu.style.display = menu.style.display == "none" ? "block" : "none";
    }
});

window.addEventListener("keyup", e => {
    keys[e.code] = false;
});


// OUR MOUSE
let mouseX, mouseY, mouseDown, rMouseDown;

HTMLDivElement.prototype.nListener = HTMLDivElement.prototype.addEventListener;
HTMLDivElement.prototype.addEventListener = function(...args) {
    if (args[0] == "mousemove" && args[1].toString() == "e=>{e.isTrusted&&(n.push(2,e.clientX,e.clientY),t())}") {
        this.addEventListener("mousedown", e => {
            if (e.button == 0) mouseDown = true;
            else if (e.button == 2) rMouseDown = true;
        });
        this.addEventListener("mouseup", e => {
            if (e.button == 0) mouseDown = false;
            else if (e.button == 2) rMouseDown = false;
        });
        this.addEventListener("mousemove", e => {
            mouseX = e.clientX - (innerWidth / 2);
            mouseY = e.clientY - (innerHeight / 2);
        });
    }
    this.nListener.apply(this, args);
};


function getHash() {
    return HTML.serverHash.value?.replace("#", "") || location.hash.slice(1);
}

HTML.connectNoob.addEventListener("click", () => {
    packetAll("F", getHash());
});

HTML.deleteNoobs.addEventListener("click", () => {
    packetAll("B");
});


// MULTI SPAWN
let spawnAborted = false;

HTML.multiSpawn.addEventListener("click", async () => {
    const count = Math.max(1, parseInt(HTML.spawnCount.value) || 5);
    const delay = parseInt(HTML.spawnDelay.value) || 0;

    spawnAborted = false;
    HTML.multiSpawn.disabled = true;
    HTML.multiSpawn.textContent = "Spawning... (Esc to stop)";

    for (let i = 1; i <= count; i++) {
        if (spawnAborted) {
            HTML.spawnProgress.textContent = `⛔ Stopped at ${i - 1}/${count}`;
            break;
        }

        packetAll("F", getHash());
        HTML.spawnProgress.textContent = `✅ Spawned ${i}/${count}`;

        if (delay > 0) {
            await new Promise(r => setTimeout(r, delay));
        }
    }

    if (!spawnAborted) {
        HTML.spawnProgress.textContent = `✅ Done! Spawned ${count} bots.`;
    }

    HTML.multiSpawn.disabled = false;
    HTML.multiSpawn.textContent = "Spawn Multiple";
});

window.addEventListener("keydown", e => {
    if (e.code === "Escape") spawnAborted = true;
}, true);


// COMMUNICATION
let x, y;

const nListener = CanvasRenderingContext2D.prototype.strokeText;
CanvasRenderingContext2D.prototype.strokeText = function(...args) {
    if (args[0].includes("Coordinates: (")) {
        const coordText = args[0].match(/Coordinates: \(([^)]+)\)/)[1];
        const parts = coordText.split(", ");
        x = parseFloat(parts[0]);
        y = parseFloat(parts[1]);
    }
    nListener.apply(this, args);
};

setInterval(() => {
    packetAll("A",
        x, y,
        mouseX / 25,
        mouseY / 25,
        mouseDown, rMouseDown,
        HTML.mbs.checked,
        HTML.feeding.checked,
        keys["ShiftLeft"]
    );
}, 20);