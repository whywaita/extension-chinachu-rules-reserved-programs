import {programMatchesRule} from './lib.js';

/*
 * Modify DOM
 */

function addColumn(reservedPrograms, isNFC) {
  if (document.getElementById("reserved-count-header") === null) {
    // Add header in first time
    var ruleHeader = document.getElementsByTagName("table")[0];
    var row = ruleHeader.rows[0];
    var lastTh = document.getElementsByClassName("flagrate-grid-1-col-last")[0];
    
    var th = document.createElement("th");
    th.id = "reserved-count-header";
    th.className = "flagrate-grid-1-col-types flagrate-grid-col-sortable";
    var div = document.createElement("div");
    div.innerHTML = "予約数";
    th.appendChild(div);
    row.insertBefore(th, lastTh);
  };
  
  // Add body
  var ruleBody = document.getElementsByTagName("table")[1];
  var rows = ruleBody.rows;
  
  Array.prototype.forEach.call(rows, function(elem, index) {
    addNumberReservedColumn(elem, index, reservedPrograms, isNFC);
  });
};

async function addNumberReservedColumn(row, index, reserved, isNFC) {
  const ruleID = row.getElementsByClassName("flagrate-grid-1-col-n")[0].innerText;
 
  const programs = await getReservedProgramsByRuleID(ruleID, reserved, isNFC);
  const number = programs.length;

  const td = document.createElement("td");
  td.id = `reserved-count-${index}`;
  td.setAttribute("name", "reserved-count");
  td.innerHTML = `${number}`;
  td.className = "flagrate-grid-1-col-types";

  const lastTd = document.getElementsByClassName("flagrate-grid-1-col-last")[index + 1];
  row.insertBefore(td, lastTd);
};

/*
 * API function
 */

function getAPIBaseURL() {
  return `${window.location.protocol}//${window.location.host}/api/`
}

async function callChinachuAPI(path) {
  const resp = await fetch(getAPIBaseURL() + path, {
    credentials: 'include'
  })
  const json = await resp.json();
  return json;
};

async function getReservedProgramsByRuleID(ruleID, reserved, isNFC) {
  const resp = await callChinachuAPI(`rules/${ruleID}.json`)

  var programs = [];
  reserved.forEach(function(reserve) {
    if (programMatchesRule(resp, reserve, isNFC)) {
      programs.push(reserve);
    }
  });

  return programs;
};

function getReservedPrograms() {
  const resp = callChinachuAPI("reserves.json");
  return resp;
};

function getConfigNormalizationForm() {
  const resp = callChinachuAPI("config.json");

  const nfc = resp["normalizationForm"];
  if (nfc === undefined) {
    return false;
  } else if (nfc === "yes") {
    return true;
  }
  return false;
};

/*
 * Utils
 */

async function isLoaded() {
  return await new Promise(resolve => {
    const interval = setInterval(() => {
      if (document.getElementsByTagName("table")[0] !== undefined) {
        resolve();
        clearInterval(interval);
      };
    }, 1)
  });
};

/*
 * Functions from main() call
 */

async function addTrigger() {
  await isLoaded();
  const buttons = document.getElementsByClassName("flagrate flagrate-button");
  
  Array.prototype.forEach.call(buttons, function(elem, index) {
    elem.onclick = AddColumn;
  });
};

async function AddColumn() {
  await isLoaded();

const reservedCounts = document.getElementsByName("reserved-count");
  for (var i = reservedCounts.length -1; i >= 0; i--) {
    var elem = reservedCounts[i];
    elem.parentNode.removeChild(elem);
  };

  const reserved = await getReservedPrograms();
  const isNFC = await getConfigNormalizationForm();

  await addColumn(reserved, isNFC);
};

/*
 * main()
 */

async function main() {
  if (!window.location.href.includes("/#!/rules/list/")) {
    // not rule page, do nothing
    return;
  };

  await addTrigger();
  await AddColumn();
};

main().catch(console.error)
