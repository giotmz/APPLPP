const pacientes = [];
let pacienteAtualIndex = -1;

function mostrarCadastro() {
  document.getElementById("cadastroSection").style.display = "block";
  document.getElementById("admissaoSection").style.display = "none";
  document.querySelector(".braden-section").style.display = "none";
  document.querySelector(".lesao-section").style.display = "none";
  document.querySelector(".alarme-section").style.display = "none";
}

document.getElementById("pacienteForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const nome = document.getElementById("nomePaciente").value;
  const prontuario = document.getElementById("prontuarioPaciente").value;

  pacientes.push({ nome, prontuario });
  pacienteAtualIndex = pacientes.length - 1;

  event.target.reset();
  document.getElementById("cadastroSection").style.display = "none";
  document.getElementById("admissaoSection").style.display = "block";
});

document.getElementById("admissaoForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const comorbidades = [...document.querySelectorAll('input[name="comorbidades"]:checked')].map(el => el.value);
  const estado = [...document.querySelectorAll('input[name="estado"]:checked')].map(el => el.value);
  const dispositivos = [...document.querySelectorAll('input[name="dispositivos"]:checked')].map(el => el.value);

  const paciente = pacientes[pacienteAtualIndex];
  paciente.comorbidades = comorbidades;
  paciente.estado = estado;
  paciente.dispositivos = dispositivos;

  alert("Admissão realizada com sucesso.");
  document.getElementById("admissaoSection").style.display = "none";

  // Mostra próximas seções
  document.querySelector(".braden-section").style.display = "block";
  document.querySelector(".lesao-section").style.display = "block";
  document.querySelector(".alarme-section").style.display = "block";
});

function calcularPontuacao() {
  const inputs = document.querySelectorAll(".braden-section input[type='number']");
  let total = 0;
  let dados = {};

  inputs.forEach((input, i) => {
    const valor = parseInt(input.value);
    if (!isNaN(valor)) {
      total += valor;
      const key = input.previousSibling.textContent.trim().toLowerCase().replace(/[^a-z]/gi, '');
      dados[key] = valor;
    }
  });

  let risco = "Alto risco";
  if (total >= 19) risco = "Sem risco";
  else if (total >= 15) risco = "Risco moderado";
  else if (total >= 12) risco = "Risco elevado";

  pacientes[pacienteAtualIndex].braden = dados;
  pacientes[pacienteAtualIndex].bradenPontuacao = total;
  pacientes[pacienteAtualIndex].bradenRisco = risco;

  alert(`Pontuação total: ${total}\nClassificação: ${risco}`);
  atualizarListaPacientes();
}

function marcarLesao(posicao) {
  if (!pacientes[pacienteAtualIndex].lesoes) pacientes[pacienteAtualIndex].lesoes = [];
  pacientes[pacienteAtualIndex].lesoes.push(posicao);
  alert(`Lesão marcada na ${posicao}`);
  atualizarListaPacientes();
}

let alarmeIntervalo;
function ativarAlarme() {
  const paciente = pacientes[pacienteAtualIndex];
  if (!paciente.alarmeAtivo) {
    paciente.alarmeAtivo = true;
    alarmeIntervalo = setInterval(() => {
      alert(`🔔 Hora de mudar o decúbito do paciente: ${paciente.nome}`);
    }, 2 * 60 * 60 * 1000);
    alert("Alarme ativado!");
  } else {
    clearInterval(alarmeIntervalo);
    paciente.alarmeAtivo = false;
    alert("Alarme desativado.");
  }
}

function atualizarListaPacientes() {
  const lista = document.getElementById("listaPacientes");
  lista.innerHTML = "";

  pacientes.forEach((p, index) => {
    const comorbidades = p.comorbidades?.join(", ") || "Não informado";
    const estado = p.estado?.join(", ") || "Não informado";
    const dispositivos = p.dispositivos?.join(", ") || "Não informado";
    const risco = p.bradenRisco || "Não avaliado";
    const lesoes = p.lesoes?.join(", ") || "Nenhuma";

    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${p.nome}</strong><br>
        Prontuário: ${p.prontuario}<br>
        <small><strong>Comorbidades:</strong> ${comorbidades}</small><br>
        <small><strong>Estado:</strong> ${estado}</small><br>
        <small><strong>Dispositivos:</strong> ${dispositivos}</small><br>
        <small><strong>Braden:</strong> ${risco}</small><br>
        <small><strong>Lesões:</strong> ${lesoes}</small>
      </div>
      <div>
        <button onclick="abrirHistorico(${index})">Histórico</button>
${pacientes[index].tratamentoAplicado ? `<button onclick="darAlta(${index})">Dar alta</button>` : `<span style="color: red;">Tratamento pendente</span>`}

       

      </div>
    `;
    lista.appendChild(li);
  });
}

function selecionarPaciente(index) {
  pacienteAtualIndex = index;
  document.querySelector(".braden-section").style.display = "block";
  document.querySelector(".lesao-section").style.display = "block";
  document.querySelector(".alarme-section").style.display = "block";
  document.getElementById("cadastroSection").style.display = "none";
  document.getElementById("admissaoSection").style.display = "none";
}

function darAlta(index) {
  if (confirm("Deseja realmente dar alta a este paciente?")) {
    pacientes.splice(index, 1);
    atualizarListaPacientes();
  }
}

function abrirHistorico(index) {
  pacienteAtualIndex = index;
  const p = pacientes[pacienteAtualIndex];

  const historico = `
    <strong>${p.nome}</strong><br>
    Prontuário: ${p.prontuario}<br>
    <strong>Comorbidades:</strong> ${p.comorbidades?.join(", ") || "Não informado"}<br>
    <strong>Estado Atual:</strong> ${p.estado?.join(", ") || "Não informado"}<br>
    <strong>Dispositivos:</strong> ${p.dispositivos?.join(", ") || "Não informado"}<br>
    <strong>Braden:</strong> ${p.bradenRisco || "Não avaliado"}<br>
    <strong>Lesões:</strong> ${p.lesoes?.join(", ") || "Nenhuma"}<br>
    <strong>Tratamento Aplicado:</strong> ${p.tratamentoAplicado ? "Sim" : "Não"}
  `;

  document.getElementById("historicoDetalhes").innerHTML = historico;

  // Mostrar somente a seção do histórico
  ocultarTodasAsSecoes();
  document.querySelector(".historico-section").style.display = "block";
}

function abrirAvaliacaoLesao() {
  ocultarTodasAsSecoes();
  document.querySelector(".avaliacao-lesao-section").style.display = "block";
}

function abrirTratamento() {
  const estagio = document.getElementById("estagioLesao").value;
  const tratamentoConteudo = document.getElementById("tratamentoConteudo");

  if (!estagio) {
    alert("Selecione um estágio da lesão.");
    return;
  }

  pacientes[pacienteAtualIndex].estagioLesao = estagio;

  const planos = {
    I: "Higienização local, hidratação e mudanças de decúbito.",
    II: "Limpeza da ferida, cobertura com curativos hidrocoloides.",
    III: "Desbridamento e curativos especiais com acompanhamento médico.",
    IV: "Intervenção multidisciplinar com possível intervenção cirúrgica."
  };

  tratamentoConteudo.innerHTML = `
    <p><strong>Tratamento para Estágio ${estagio}:</strong></p>
    <p>${planos[estagio]}</p>
  `;

  ocultarTodasAsSecoes();
  document.querySelector(".tratamento-lesao-section").style.display = "block";
}

function finalizarTratamento() {
  pacientes[pacienteAtualIndex].tratamentoAplicado = true;
  alert("Tratamento registrado com sucesso. O paciente agora pode ter alta.");
  atualizarListaPacientes();
  ocultarTodasAsSecoes();
  document.querySelector(".pacientes-section").style.display = "block";
}

function ocultarTodasAsSecoes() {
  document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
  document.querySelector(".pacientes-section").style.display = "block";
}
