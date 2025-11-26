// Medidor.js (parche robusto y listo para pegar)

// -----------------------------
// Configuración Firebase
// -----------------------------
  const firebaseConfig = {
                apiKey: "AIzaSyCkNxk0LzwjHVEP5Cv6H_cAw-XlPdqSfAo",
                authDomain: "medidorkw.firebaseapp.com",
                databaseURL: "https://medidorkw-default-rtdb.firebaseio.com",
                projectId: "medidorkw",
                storageBucket: "medidorkw.firebasestorage.app",
                messagingSenderId: "904836633091",
                appId: "1:904836633091:web:49b1cd2e3bb65c97ccf436"
            };

// Inicializa Firebase solo si no hay apps ya inicializadas
try {
  if (typeof firebase === "undefined") {
    console.error("Firebase SDK NO detectado. Asegúrate de cargar firebase-app-compat y firebase-database-compat antes de este archivo.");
  } else {
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
      console.log("Firebase inicializado correctamente (nuevo).");
    } else {
      console.log("Firebase ya inicializado (firebase.apps.length = " + firebase.apps.length + "). Usando instancia existente.");
    }
  }
} catch (err) {
  console.error("Error inicializando Firebase:", err);
}

// Utilidad: obtener elemento con warning si no existe
function getEl(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(Elemento con id "${id}" no encontrado en el DOM.);
  return el;
}

// Parser robusto (number | string | object con latest/value/prop numérica)
function parseSnapToNumber(snap) {
  try {
    const raw = snap.val();
    if (raw === null || raw === undefined) return NaN;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      const n = parseFloat(raw);
      return isNaN(n) ? NaN : n;
    }
    if (typeof raw === "object") {
      if (raw.latest !== undefined) return parseFloat(raw.latest);
      if (raw.value !== undefined) return parseFloat(raw.value);
      for (const k in raw) {
        const v = raw[k];
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          const n = parseFloat(v);
          if (!isNaN(n)) return n;
        }
      }
    }
  } catch (e) {
    console.warn("parseSnapToNumber error:", e);
  }
  return NaN;
}

// Espera a DOMContentLoaded para asegurar elementos disponibles
window.addEventListener("DOMContentLoaded", () => {
  if (typeof firebase === "undefined") {
    console.error("Firebase no disponible en DOMContentLoaded. Revisa carga de scripts.");
    return;
  }

  // Referencias a Firebase (ajusta rutas si tu DB las tiene distintas)
  const dbI_rms = firebase.database().ref("/Mediciones/Irms");
  const dbV_rms = firebase.database().ref("/Mediciones/Vrms");
  const dbFP = firebase.database().ref("/Mediciones/FP");
  const dbP_activa = firebase.database().ref("/Mediciones/PActiva");
  const dbConsumo_diario = firebase.database().ref("/Mediciones/Consumo_diario");
  const dbGasto_diario = firebase.database().ref("/Mediciones/Gasto_diario");
  const dbConsumo_bimestral = firebase.database().ref("/Mediciones/Consumo_bimestral");
  const dbGasto_bimestral = firebase.database().ref("/Mediciones/Gasto_bimestral");

  // Wrapper seguro para listeners
  function safeListen(ref, name, onValueParsed) {
    try {
      ref.on("value", snap => {
        try {
          console.log(DB read ${name}:, snap.val());
          const v = parseSnapToNumber(snap);
          console.log(Parsed ${name}:, v);
          if (!isNaN(v)) onValueParsed(v);
        } catch (e) {
          console.error(Error en handler de ${name}:, e);
        }
      }, err => {
        console.error(Firebase error escuchando ${name}:, err);
      });
    } catch (e) {
      console.error(Error al establecer listener para ${name}:, e);
    }
  }

  // Mapeo UI
  safeListen(dbI_rms, "Irms", v => {
    const el = getEl("I_rms");
    if (el) el.innerText = v.toFixed(2) + " A";
  });

  safeListen(dbV_rms, "Vrms", v => {
    const el = getEl("V_rms");
    if (el) el.innerText = v.toFixed(1) + " V";
  });

  safeListen(dbFP, "FP", v => {
    const el = getEl("FP");
    if (el) el.innerText = v.toFixed(2);
  });

  safeListen(dbP_activa, "PActiva", v => {
    const el = getEl("P_activa");
    if (el) el.innerText = v.toFixed(3) + " kW";
  });

  safeListen(dbConsumo_diario, "Consumo_diario", v => {
    const el = getEl("Consumo_diario");
    if (el) el.innerText = v.toFixed(6) + " kWh";
  });

  safeListen(dbGasto_diario, "Gasto_diario", v => {
    const el = getEl("Gasto_diario");
    if (el) el.innerText = v.toFixed(2) + " MXN";
  });

  safeListen(dbConsumo_bimestral, "Consumo_bimestral", v => {
    const el = getEl("Consumo_bimestral");
    if (el) el.innerText = v.toFixed(6) + " kWh";
  });

  safeListen(dbGasto_bimestral, "Gasto_bimestral", v => {
    const el = getEl("Gasto_bimestral");
    if (el) el.innerText = v.toFixed(2) + " MXN";
  });

  // Imprime la estructura de /Mediciones para debug
  firebase.database().ref("/Mediciones").once("value")
    .then(snap => {
      console.log("Snapshot completo de /Mediciones (debug):", snap.exists() ? snap.val() : "NO EXISTE");
    })
    .catch(err => {
      console.error("Error leyendo /Mediciones:", err);
    });

  // Chequeo de conexion
  firebase.database().ref(".info/connected").on("value", snap => {
    if (snap.val() === true) console.log("Conectado a Realtime Database.");
    else console.warn("No conectado a Realtime Database.");
  });
}); // DOMContentLoaded end