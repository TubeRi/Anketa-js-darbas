"use strict";

const atsakymai = {
  asmuo: {},
  kontaktai: {},
  issilavinimas: {},
  profesija: {},
};

const form = document.querySelector("#anketa");
const laukai = document.querySelector("#laukai");
const antraste = document.querySelector("#dalies-antraste");
const busena = document.querySelector("#busena");
const eiga = document.querySelector("#eiga");
const atgal = document.querySelector("#atgal");
const toliau = document.querySelector("#toliau");
const pabaiga = document.querySelector("#pabaiga");
const siandien = new Date();
const sieMetai = siandien.getFullYear();
const varduLaukai = new Set(["vardas", "antrasVardas", "pavarde", "sutuoktinioVardas", "sutuoktinioPavarde"]);
const dalys = [
  ["asmuo", "Asmens ir šeimos duomenys", asmensLaukai],
  ["kontaktai", "Kontaktai", kontaktuLaukai],
  ["issilavinimas", "Išsilavinimas", issilavinimoLaukai],
  ["profesija", "Profesinė padėtis", profesijosLaukai],
];
let dalis = 0;

function datosTekstas(data) {
  return [data.getFullYear(), data.getMonth() + 1, data.getDate()]
    .map(dalis => String(dalis).padStart(2, "0"))
    .join("-");
}

function asmensDuomenys(kodas) {
  if (!/^[1-6][0-9]{10}$/.test(kodas)) return null;

  const skaitmenys = Array.from(kodas, Number);
  const amziusKode = Math.floor((skaitmenys[0] - 1) / 2);
  const metai = 1800 + amziusKode * 100 + Number(kodas.slice(1, 3));
  const menesis = Number(kodas.slice(3, 5));
  const diena = Number(kodas.slice(5, 7));
  const data = new Date(metai, menesis - 1, diena);
  if (data.getMonth() + 1 !== menesis || data.getDate() !== diena || data > siandien) return null;

  const gimimoData = datosTekstas(data);
  const darNeraGimtadienio = datosTekstas(siandien).slice(5) < gimimoData.slice(5);
  return {
    gimimoData,
    gimimoMetai: metai,
    lytis: skaitmenys[0] % 2 ? "Vyras" : "Moteris",
    amzius: sieMetai - metai - Number(darNeraGimtadienio),
  };
}

function asmensLaukai({ amzius, santuokosIsimtis, vedybinePadetis, lytis }) {
  const sarasas = [
    ["asmensKodas", "Asmens kodas", "text", {
      inputmode: "numeric", full: true,
      help: "Įveskite 11 skaitmenų. Lytis, gimimo metai ir data bus užpildyti automatiškai.",
    }],
    ["vardas", "Vardas"],
    ["antrasVardas", "Antrasis vardas (Neprivaloma)", "text", { optional: true }],
    ["pavarde", "Pavardė"],
  ];
  if (amzius === undefined) return sarasas;

  sarasas.splice(1, 0,
    ["lytis", "Lytis", "text", { readonly: true }],
    ["gimimoMetai", "Gimimo metai", "number", { readonly: true }],
    ["gimimoData", "Gimimo data", "date", { readonly: true }]);

  if (amzius >= 16 && amzius < 18) {
    sarasas.push(["santuokosIsimtis", "Taikoma santuokos amžiaus išimtis", "select", {
      choices: [["ne", "Ne"], ["taip", "Taip"]],
    }]);
  }
  const moteris = lytis === "Moteris";
  const choices = [["vienišas", moteris ? "Netekėjusi" : "Nevedęs"]];
  if (amzius >= 18 || (amzius >= 16 && santuokosIsimtis === "taip")) {
    choices.push(["susituokęs", moteris ? "Ištekėjusi" : "Vedęs"]);
    choices.push(["išsiskyręs", moteris ? "Išsiskyrusi" : "Išsiskyręs"]);
  }
  sarasas.push(["vedybinePadetis", "Vedybinė padėtis", "select", { choices }]);
  if (vedybinePadetis === "susituokęs" && choices.length > 1) {
    const sutuoktinis = moteris ? "Sutuoktinio" : "Sutuoktinės";
    sarasas.push(["sutuoktinioVardas", sutuoktinis + " vardas"], ["sutuoktinioPavarde", sutuoktinis + " pavardė"]);
  }
  return sarasas;
}

function kontaktuLaukai() {
  return [
    ["telefonas", "Telefono numeris", "tel", {
      placeholder: "+370 612 34567",
      help: "Lietuviškam numeriui pakanka 8 skaitmenų. Užsienio numerį pradėkite šalies kodu su +.",
    }],
    ["elPastas", "El. pašto adresas", "email"],
    ["adresas", "Gyvenamosios vietos adresas", "text", { full: true }],
  ];
}

function issilavinimoLaukai({ lygis }) {
  const baigimoMetai = Array.from({ length: sieMetai - 1900 + 1 }, (_, indeksas) => String(sieMetai - indeksas));
  const sarasas = [["lygis", "Išsilavinimas", "select", {
    choices: [
      ["pagrindinis", "Pagrindinis"], ["vidurinis", "Vidurinis"], ["profesinis", "Profesinis"],
      ["kolegijinis", "Aukštasis kolegijinis"], ["universitetinis", "Aukštasis universitetinis"],
    ],
    full: true,
  }]];
  if (!lygis) return sarasas;

  sarasas.push(["istaiga", "Paskutinė baigta mokslo ar studijų įstaiga"]);
  sarasas.push(["baigimoMetai", "Baigimo metai", "select", {
    choices: baigimoMetai,
  }]);
  if (["profesinis", "kolegijinis", "universitetinis"].includes(lygis)) {
    sarasas.push(["kvalifikacija", "Kvalifikacija (specialybė)"]);
  }
  if (lygis === "kolegijinis") {
    sarasas.push(["laipsnis", "Mokslo laipsnis", "text", { readonly: true }]);
  }
  if (lygis === "universitetinis") {
    sarasas.push(["laipsnis", "Mokslo laipsnis", "select", {
      choices: ["Bakalauras", "Magistras", "Mokslų daktaras"],
    }]);
  }
  if (lygis === "kolegijinis" || lygis === "universitetinis") {
    sarasas.push(["laipsnioMetai", "Laipsnio įgijimo metai", "select", { choices: baigimoMetai }]);
  }
  return sarasas;
}

function profesijosLaukai({ padetis, patirtis }) {
  const pagalPadeti = {
    studijuoja: [
      ["pakopa", "Studijų pakopa", "select", { choices: [
        "Bakalauro studijos", "Magistro studijos", "Doktorantūra",
      ] }],
      ["kursas", "Kursas", "number", { min: 1 }],
      ["studijuIstaiga", "Studijų įstaiga"],
      ["studijuPabaiga", "Tikėtini studijų baigimo metai", "select", {
        choices: Array.from({ length: 16 }, (_, indeksas) => String(sieMetai + indeksas)),
      }],
    ],
    dirba: [["darboviete", "Darbo įstaiga"], ["pareigos", "Pareigos"]],
    nedirba: [["nedarboPriezastis", "Nedarbo priežastis", "text", { full: true }]],
    atostogauja: [["atostoguPabaiga", "Atostogų pabaiga", "date"]],
  };
  const sarasas = [
    ["padetis", "Profesinė padėtis", "select", { full: true, choices: [
      ["studijuoja", "Studijuoja"], ["dirba", "Dirba"], ["nedirba", "Nedirba"],
      ["atostogauja", "Motinystės / tėvystės atostogose"],
    ] }],
    ...(pagalPadeti[padetis] ?? []),
    ["patirtis", "Darbo patirtis (pilni metai)", "number", { min: 0 }],
  ];
  if (padetis === "dirba" || padetis === "atostogauja" || patirtis > 0) {
    sarasas.push(["sritis", "Darbo sritis", "select", { choices: [
      "Teisė", "Viešasis sektorius", "Sveikatos apsauga", "Farmacija",
      "Pramonė / gamyba", "IT", "Prekyba", "Krašto apsauga",
      "Vidaus reikalų sistema", "Klientų aptarnavimas ir paslaugos",
      "Transportas", "Kultūra ir pramogos", "Švietimas / studijos",
    ] }]);
  }
  return sarasas;
}

function kurtiLauka([vardas, pavadinimas, tipas = "text", nustatymai = {}], reiksme) {
  const blokas = document.createElement("div");
  blokas.classList.toggle("platus", Boolean(nustatymai.full));
  const etikete = document.createElement("label");
  etikete.htmlFor = vardas;
  etikete.textContent = pavadinimas;
  const laukas = document.createElement(tipas === "select" ? "select" : "input");
  laukas.id = vardas;
  laukas.name = vardas;
  laukas.required = !nustatymai.optional && !nustatymai.readonly;
  if (tipas === "select") {
    laukas.add(new Option("Pasirinkite", ""));
    for (const variantas of nustatymai.choices) {
      const [verte, tekstas] = Array.isArray(variantas) ? variantas : [variantas, variantas];
      laukas.add(new Option(tekstas, verte));
    }
  } else {
    laukas.type = tipas;
    for (const atributas of ["min", "max", "maxlength", "inputmode", "placeholder"]) {
      if (nustatymai[atributas] !== undefined) laukas.setAttribute(atributas, nustatymai[atributas]);
    }
    laukas.readOnly = Boolean(nustatymai.readonly);
  }
  laukas.value = reiksme ?? "";
  blokas.append(etikete, laukas);
  if (nustatymai.help) {
    const pagalba = document.createElement("small");
    pagalba.id = vardas + "-pagalba";
    pagalba.textContent = nustatymai.help;
    laukas.setAttribute("aria-describedby", pagalba.id);
    blokas.append(pagalba);
  }
  return blokas;
}

function rodytiDali(perkeltiFokusa = true) {
  const [kategorija, pavadinimas, gautiLaukus] = dalys[dalis];
  const duomenys = atsakymai[kategorija];
  const aprasai = gautiLaukus(duomenys);
  const vienintelePadetis = aprasai.find(([vardas]) => vardas === "vedybinePadetis")?.[3].choices;
  if (vienintelePadetis?.length === 1) duomenys.vedybinePadetis = vienintelePadetis[0][0];
  if (duomenys.lygis === "kolegijinis") duomenys.laipsnis = "Profesinis bakalauras";
  const anksciauFokusuotas = document.activeElement?.id;
  const reikalingi = new Set(aprasai.map(([vardas]) => vardas));
  for (const vardas of Object.keys(duomenys)) {
    if (!reikalingi.has(vardas) && vardas !== "amzius") delete duomenys[vardas];
  }

  laukai.replaceChildren(...aprasai.map(aprasas => kurtiLauka(aprasas, duomenys[aprasas[0]])));
  antraste.textContent = pavadinimas;
  busena.textContent = `${dalis + 1} dalis iš ${dalys.length} · Užbaigta ${dalis} iš ${dalys.length}`;
  eiga.value = dalis;
  atgal.hidden = dalis === 0;
  toliau.textContent = dalis === dalys.length - 1 ? "Baigti pildyti" : "Toliau";
  form.hidden = false;
  pabaiga.hidden = true;
  if (perkeltiFokusa) antraste.focus();
  else document.getElementById(anksciauFokusuotas)?.focus();
}

function tikrinti(laukas) {
  let reiksme = laukas.value.trim();
  let klaida = "";
  if (laukas.name === "asmensKodas" && reiksme) {
    if (!asmensDuomenys(reiksme)) klaida = "Patikrinkite 11 skaitmenų kodą ir jame nurodytą gimimo datą.";
  }
  if (laukas.type === "tel" && reiksme) {
    reiksme = reiksme.replace(/[\s()-]/g, "");
    if (/^[0-9]{8}$/.test(reiksme)) reiksme = "+370" + reiksme;
    else if (/^0[0-9]{8}$/.test(reiksme)) reiksme = "+370" + reiksme.slice(1);
    if (!/^\+[1-9][0-9]{7,14}$/.test(reiksme)) klaida = "Įveskite numerį su šalies kodu arba 8 skaitmenų lietuvišką numerį.";
  }
  if (laukas.required && !reiksme) klaida = "Užpildykite šį lauką.";
  laukas.setCustomValidity(klaida);
  if (laukas.name === "asmensKodas") {
    const pagalba = document.querySelector("#asmensKodas-pagalba");
    if (pagalba) {
      pagalba.textContent = klaida || "Įveskite 11 skaitmenų. Lytis, gimimo metai ir data bus užpildyti automatiškai.";
      pagalba.classList.toggle("klaida", Boolean(klaida));
    }
  }
  return reiksme;
}

function irasyti(laukas, reiksme) {
  const duomenys = atsakymai[dalys[dalis][0]];
  duomenys[laukas.name] = laukas.type === "number" && reiksme !== "" ? Number(reiksme) : reiksme;
}

function filtruotiIvestaTeksta(laukas) {
  let filtras;
  if (laukas.name === "asmensKodas") {
    filtras = tekstas => tekstas.replace(/[^0-9]/g, "").slice(0, 11);
  } else if (varduLaukai.has(laukas.name)) {
    filtras = tekstas => tekstas.replace(/\p{N}/gu, "");
  } else {
    return;
  }

  const pradineReiksme = laukas.value;
  const isvalytaReiksme = filtras(pradineReiksme);
  if (isvalytaReiksme === pradineReiksme) return;
  const zymeklis = filtras(pradineReiksme.slice(0, laukas.selectionStart)).length;
  laukas.value = isvalytaReiksme;
  laukas.setSelectionRange(zymeklis, zymeklis);
}

form.addEventListener("input", ({ target }) => {
  if (!target.name) return;
  filtruotiIvestaTeksta(target);
  irasyti(target, tikrinti(target));
  if (target.name === "asmensKodas") {
    const asmuo = atsakymai.asmuo;
    const nustatyta = asmensDuomenys(asmuo.asmensKodas);
    const reikiaAtnaujinti = nustatyta?.gimimoData !== asmuo.gimimoData || nustatyta?.lytis !== asmuo.lytis;
    if (!reikiaAtnaujinti) return;
    if (nustatyta) Object.assign(asmuo, nustatyta);
    else {
      delete asmuo.gimimoData;
      delete asmuo.gimimoMetai;
      delete asmuo.lytis;
      delete asmuo.amzius;
    }
    rodytiDali(false);
    tikrinti(document.querySelector("#asmensKodas"));
  }
});

form.addEventListener("change", ({ target }) => {
  if (!target.name) return;
  const reiksme = tikrinti(target);
  irasyti(target, reiksme);
  if (target.type === "tel" && target.validity.valid) target.value = reiksme;
  if (target.name === "lygis") delete atsakymai.issilavinimas.laipsnis;
  if (["lygis", "padetis", "patirtis", "santuokosIsimtis", "vedybinePadetis"].includes(target.name)) {
    rodytiDali(false);
  }
});

// Tikriname po reikšmių normalizavimo, taip pat pateikiant formą klavišu Enter.
form.noValidate = true;
form.addEventListener("submit", event => {
  event.preventDefault();
  for (const laukas of laukai.querySelectorAll("[name]")) irasyti(laukas, tikrinti(laukas));
  if (!form.reportValidity()) return;
  if (dalis < dalys.length - 1) {
    dalis += 1;
    rodytiDali();
    return;
  }
  for (const [kategorija] of dalys) atsakymai[kategorija] = {};
  laukai.replaceChildren();
  form.hidden = true;
  pabaiga.hidden = false;
  eiga.value = dalys.length;
  busena.textContent = "Užbaigtos visos 4 anketos dalys";
  document.querySelector("#pabaigos-antraste").focus();
});

atgal.addEventListener("click", () => {
  dalis -= 1;
  rodytiDali();
});
document.querySelector("#is-naujo").addEventListener("click", () => {
  dalis = 0;
  rodytiDali();
});
rodytiDali(false);
