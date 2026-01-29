const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const form = document.getElementById("formReserva");
const mensaje = document.getElementById("mensaje");
const tablaReservas = document.getElementById("tablaReservas")?.querySelector("tbody");

// Resumen
const resumenDiv = document.getElementById("resumenReserva");
const resumenTexto = document.getElementById("resumenTexto");
const btnAceptar = document.getElementById("aceptarReserva");
const btnCancelar = document.getElementById("cancelarReserva");

// Horarios
const horarios = {
  lunes: { comida: ["13:00", "16:00"], cena: ["20:30", "23:00"] },
  miercoles: { comida: ["13:00", "16:00"], cena: ["20:30", "23:00"] },
  jueves: { comida: ["13:00", "16:00"], cena: ["20:30", "23:00"] },
  viernes: { comida: ["13:00", "16:00"], cena: ["20:30", "23:00"] },
  sabado: { comida: ["13:00", "16:30"], cena: ["20:30", "23:30"] },
  domingo: { comida: ["13:00", "16:30"], cena: ["20:30", "23:30"] }
};

// Generar horas cada 30 min
function generarHoras(inicio, fin){
  const horas = [];
  let [h,m] = inicio.split(":").map(Number);
  const [hf,mf] = fin.split(":").map(Number);
  while(h<hf || (h===hf && m<=mf)){
    horas.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
    m+=30; if(m>=60){ m=0; h++; }
  }
  return horas;
}

// --- RESERVAS ---
function obtenerReservas(){ return JSON.parse(localStorage.getItem("reservas"))||[]; }
function guardarReserva(reserva){ 
  const reservas = obtenerReservas();
  reservas.push(reserva);
  localStorage.setItem("reservas",JSON.stringify(reservas));
  cargarTabla();
}
function personasReservadas(fecha,hora){
  return obtenerReservas().filter(r=>r.fecha===fecha && r.hora===hora).reduce((t,r)=>t+r.personas,0);
}

// Cargar horas con bloqueos visuales
if(fechaInput){
  fechaInput.addEventListener("change",()=>{
    horaSelect.innerHTML='<option value="">Selecciona una hora</option>';
    const fecha = new Date(fechaInput.value);
    const dia = fecha.getDay();
    if(dia===2){ mensaje.textContent="❌ Los martes el restaurante permanece cerrado."; return; }
    else mensaje.textContent="";

    let diaSemana="";
    switch(dia){
      case 0: diaSemana="domingo"; break;
      case 1: diaSemana="lunes"; break;
      case 3: diaSemana="miercoles"; break;
      case 4: diaSemana="jueves"; break;
      case 5: diaSemana="viernes"; break;
      case 6: diaSemana="sabado"; break;
    }
    const horarioDia = horarios[diaSemana];
    const horasDisponibles=[...generarHoras(horarioDia.comida[0],horarioDia.comida[1]),...generarHoras(horarioDia.cena[0],horarioDia.cena[1])];

    horasDisponibles.forEach(hora=>{
      const option=document.createElement("option");
      option.value=hora;
      option.textContent=hora;
      if(personasReservadas(fechaInput.value,hora)>=50) option.disabled=true;
      horaSelect.appendChild(option);
    });
  });
}

// --- FORMULARIO CLIENTE ---
let reservaTemp=null;
if(form){
  form.addEventListener("submit",(e)=>{
    e.preventDefault();
    const fecha = fechaInput.value;
    const hora = horaSelect.value;
    const personas = parseInt(document.getElementById("personas").value);
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const email = document.getElementById("email").value;
    const comentarios = document.getElementById("comentarios").value;

    const totalPersonas = personasReservadas(fecha,hora)+personas;
    if(totalPersonas>50){ mensaje.textContent="❌ No hay disponibilidad para esa hora (aforo completo)."; return; }

    reservaTemp = {fecha,hora,personas,nombre,telefono,email,comentarios};

    // Mostrar resumen visual
    resumenTexto.innerHTML=
      `Fecha: ${fecha}<br>Hora: ${hora}<br>Personas: ${personas}<br>`+
      `Nombre: ${nombre}<br>Teléfono: ${telefono}<br>Email: ${email||"No"}<br>`+
      `Comentarios: ${comentarios||"Ninguno"}`;
    resumenDiv.style.display="block";
  });

  btnAceptar.addEventListener("click",()=>{
    guardarReserva(reservaTemp);
    mensaje.textContent="✅ Reserva confirmada. ¡Te esperamos en Sol y Luna 🌙!";
    form.reset();
    resumenDiv.style.display="none";
    fechaInput.dispatchEvent(new Event('change')); // actualizar horas
  });

  btnCancelar.addEventListener("click",()=>{
    resumenDiv.style.display="none";
    reservaTemp=null;
  });
}

// --- PANEL ADMIN ---
function cargarTabla(){
  if(!tablaReservas) return;
  tablaReservas.innerHTML="";
  const reservas = obtenerReservas();
  reservas.forEach((r,i)=>{
    const fila=document.createElement("tr");
    fila.innerHTML=`<td>${r.fecha}</td><td>${r.hora}</td><td>${r.personas}</td><td>${r.nombre}</td>
    <td>${r.telefono}</td><td>${r.email}</td><td>${r.comentarios}</td>
    <td><button data-id="${i}">Eliminar</button></td>`;
    tablaReservas.appendChild(fila);
  });
  tablaReservas.querySelectorAll("button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id=btn.getAttribute("data-id");
      let reservas = obtenerReservas();
      reservas.splice(id,1);
      localStorage.setItem("reservas",JSON.stringify(reservas));
      cargarTabla();
    });
  });
}
cargarTabla();
