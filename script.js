const pacientes = [];
function ocultarTodasAsSecoes() {
  document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
  document.querySelector(".pacientes-section").style.display = "block";
}
document.addEventListener("DOMContentLoaded", () => {
  ocultarTodasAsSecoes();
});

let pacienteAtualIndex = -1;

function mostrarCadastro() {
  ocultarTodasAsSecoes();
  document.getElementById("cadastroSection").style.display = "block";
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
  else if (total >= 15) risco = "Médio Risco";
  else if (total >= 13) risco = "Risco moderado";
  else if (total >=10) risco = "Alto Risco";
  else if (total >=9) risco = "Altíssimo Risco";

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
    paciente.alarmeInicio = new Date(); 
    paciente.alarmeTimer = setInterval(() => {
      alert(`🔔 Atenção: chegou o momento de mudar o decúbito do paciente ${paciente.nome}.\n(Recomendação: mudança a cada 2 horas)`);
    }, 2 * 60 * 60 * 1000); // 2 horas
    alert(`Alarme de mudança de decúbito ativado para o paciente ${paciente.nome}.`);
  } else {
    clearInterval(paciente.alarmeTimer);
    paciente.alarmeAtivo = false;
    alert(`Alarme de mudança de decúbito desativado para o paciente ${paciente.nome}.`);
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

  let alarmeInfo = "Alarme não ativado.";
  if (p.alarmeAtivo && p.alarmeInicio) {
    const agora = new Date();
    const ativado = new Date(p.alarmeInicio);
    const tempoHoras = Math.floor((agora - ativado) / (1000 * 60 * 60));
    const mudancas = Math.floor(tempoHoras / 2);
    alarmeInfo = `Alarme de Decúbito:<br>
    Alarme ativado desde: ${ativado.toLocaleString()}<br>
    `;
  }

  const historico = `
    <strong>${p.nome}</strong><br>
    Prontuário: ${p.prontuario}<br>
    <strong>Comorbidades:</strong> ${p.comorbidades?.join(", ") || "Não informado"}<br>
    <strong>Estado Atual:</strong> ${p.estado?.join(", ") || "Não informado"}<br>
    <strong>Dispositivos:</strong> ${p.dispositivos?.join(", ") || "Não informado"}<br>
    <strong>Braden:</strong> ${p.bradenRisco || "Não avaliado"}<br>
    <strong>Lesões:</strong> ${p.lesoes?.join(", ") || "Nenhuma"}<br>
    <strong>Tratamento Aplicado:</strong> ${p.tratamentoAplicado ? "Sim" : "Não"}<br>
    <strong>Conduta do Profissional:</strong> ${p.conduta || "Não registrada"}<br><br>
    ${alarmeInfo}
  `;

  document.getElementById("historicoDetalhes").innerHTML = historico;
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
    I: `
      <h4>Estágio I</h4>
      <p><strong>Materiais:</strong> Espuma de Hidropolímero, Hidrocolóide transparente, Filme transparente.</p>
      <p><strong>Cuidados:</strong></p>
      <ul>
        <li>Diferenciar de Dermatite Associada à Incontinência (DAI)</li>
        <li>Diminuir forças de pressão, fricção e cisalhamento</li>
        <li>Proteger contra umidade</li>
        <li>Permitir visualização da lesão sem retirada da cobertura</li>
      </ul>
    `,
    II: `
      <h4>Estágio II</h4>
      <p><strong>Materiais:</strong> Espuma de Hidropolímero, Hidrocolóide.</p>
      <p><strong>Cuidados:</strong></p>
      <ul>
        <li>Absorver exsudato leve/médio</li>
        <li>Reduzir pressão, fricção e cisalhamento</li>
        <li>Barreira contra umidade, bactérias e vírus</li>
      </ul>
    `,
    III: `
      <h4>Estágio III</h4>
      <p><strong>Cobertura primária:</strong> Hidrofibra com prata, Alginato de cálcio e sódio, Carvão ativado com prata, Espuma de poliuretano com prata</p>
      <p><strong>Cobertura secundária:</strong> Espuma de hidropolímero</p>
      <p><strong>Cuidados:</strong></p>
      <ul>
        <li>Absorção de exsudato moderado</li>
        <li>Preenchimento de cavidade</li>
        <li>Controle bacteriano e viral</li>
        <li>Redução da pressão e fricção</li>
      </ul>
    `,
    IV: `
      <h4>Estágio IV</h4>
      <p><strong>Cobertura primária:</strong> Hidrofibra com prata, Alginato de cálcio e sódio, Carvão ativado com prata, Espuma de poliuretano</p>
      <p><strong>Cobertura secundária:</strong> Gaze ou coxim (troca diária)</p>
      <p><strong>Cuidados:</strong></p>
      <ul>
        <li>Absorção de exsudato elevado</li>
        <li>Preenchimento de 70% da cavidade</li>
        <li>Redução de pressão e controle de infecção</li>
      </ul>
    `,
    "Não Classificável": `
      <h4>Lesão Não Classificável</h4>
      <p><strong>Desbridamento autolítico:</strong> Hidrocolóide, Hidrogel</p>
      <p><strong>Desbridamento enzimático:</strong> Colagenase</p>
      <p><strong>Observação:</strong> Avaliar necessidade de desbridamento cirúrgico.</p>
    `,
    "Pressão Tissular Profunda": `
      <h4>Lesão por Pressão Tissular Profunda</h4>
      <ul>
        <li>Hidratar a pele</li>
        <li>Não aplicar cobertura para permitir observação</li>
        <li>Calcâneos devem ficar flutuantes</li>
        <li>Rompimento de flictema se exsudato purulento</li>
      </ul>
    `,
    "Relacionada a Dispositivos Médicos": `
      <h4>Lesão Relacionada a Dispositivos Médicos</h4>
      <ul>
        <li>Prevenção com hidrocolóide ou espuma de hidropolímero</li>
        <li>Reduzir pressão de dispositivos</li>
        <li>Utilizar fixadores adesivos específicos</li>
        <li>Tratar lesão conforme avaliação do enfermeiro</li>
      </ul>
    `,
    "Pressão em Membranas Mucosas": `
      <h4>Lesão em Membranas Mucosas</h4>
      <p><strong>Conduta:</strong> Regeneração natural, avaliar com cuidado. Tratamento conforme julgamento clínico do enfermeiro.</p>
    `
  };

  tratamentoConteudo.innerHTML = planos[estagio] || "<p>Tratamento não encontrado para este estágio.</p>";
  document.getElementById("condutaProfissional").value = "";

  ocultarTodasAsSecoes();
  document.querySelector(".tratamento-lesao-section").style.display = "block";
}


function finalizarTratamento() {
  const conduta = document.getElementById("condutaProfissional").value.trim();
  if (!conduta) {
    alert("Descreva a conduta do profissional antes de finalizar o tratamento.");
    return;
  }

  pacientes[pacienteAtualIndex].tratamentoAplicado = true;
  pacientes[pacienteAtualIndex].conduta = conduta;

  alert("Tratamento aplicado com sucesso.");
  atualizarListaPacientes();
  ocultarTodasAsSecoes();
  document.querySelector(".pacientes-section").style.display = "block";
}


function ocultarTodasAsSecoes() {
  document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
  document.querySelector(".pacientes-section").style.display = "block";
}
