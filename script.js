// --- 1. Elementos do DOM ---
const formularioLogin = document.getElementById('login-form');
const navegacaoPrincipal = document.getElementById('main-nav');
const telaLogin = document.getElementById('login-screen');
const painelAdmin = document.getElementById('admin-dashboard');
const painelUsuario = document.getElementById('user-dashboard');
const conteudoAdmin = document.getElementById('admin-content');
const selecaoSalaUsuario = document.getElementById('room'); // Select do usuário
const formularioAgendamento = document.getElementById('schedule-form');
const listaAgendamentosUsuario = document.getElementById('my-appointments');

// --- 2. Dados ---
const USUARIOS = {
    'admin': { senha: '123', perfil: 'admin' },
    'padrao': { senha: '456', perfil: 'user' },
    'colaborador1': { senha: '789', perfil: 'user' },
    'colaborador2': { senha: '101', perfil: 'user' },
    'colaborador3': { senha: '102', perfil: 'user' }
};

let salasDisponiveis = [
    { id: 1, nome: 'Sala 101', capacidade: 30 },
    { id: 2, nome: 'Auditório', capacidade: 150 },
    { id: 3, nome: 'Laboratório de Química', capacidade: 25 }
];
let proximoIdSala = 4;

let todosAgendamentos = []; // ARRAY DE AGENDAMENTOS REAIS

let colaboradoresCadastrados = [
    { id: 100, nome: 'Ana Silva', email: 'ana@escola.com', telefone: '(31) 9999-1111', perfil: 'user' },
    { id: 101, nome: 'Bruno Costa', email: 'bruno@escola.com', telefone: '(31) 9999-2222', perfil: 'user' }
];
let proximoIdUsuario = 102;

let usuarioAtual = null; // Armazena o usuário logado

// Data de hoje formatada para YYYY-MM-DD
const hoje = new Date().toISOString().split('T')[0];

// Função auxiliar para formatar a data (DD/MM/AAAA)
function formatarData(dataString) {
    if (!dataString) return 'N/A';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

// --- 3. Funções de Navegação e Rotas (SPA) ---

/**
 * Redireciona e atualiza a interface com base no hash do URL.
 * @param {string} hash - O hash do URL (ex: '#relatorios').
 */
function navegar(hash) {
    window.location.hash = hash;
    rotear(hash);
}

/**
 * Função principal de roteamento que exibe a página correta.
 */
function rotear(hash) {
    const perfil = usuarioAtual ? usuarioAtual.perfil : null;
    let paginaAlvo = hash.replace('#', '');
    
    // 1. Oculta todas as páginas
    document.querySelectorAll('.page').forEach(pagina => pagina.classList.remove('active'));
    
    // 2. Lógica de exibição e redirecionamento
    
    if (!perfil && paginaAlvo !== 'login' && paginaAlvo !== '') {
        exibirLogin();
        return;
    }

    if (perfil === 'admin') {
        exibirTela(painelAdmin);
        renderizarPainelAdmin(paginaAlvo || 'meus-agendamentos'); 
        atualizarNavegacaoPrincipal('admin');
    } else if (perfil === 'user') {
        exibirTela(painelUsuario);
        renderizarPainelUsuario();
        atualizarNavegacaoPrincipal('user');
    } else {
        exibirTela(telaLogin);
        navegacaoPrincipal.style.display = 'none';
    }
}

function exibirTela(telaParaExibir) {
    document.querySelectorAll('.page').forEach(tela => {
        tela.classList.remove('active');
    });
    telaParaExibir.classList.add('active');
}

function exibirLogin() {
    exibirTela(telaLogin);
    navegacaoPrincipal.style.display = 'none';
    usuarioAtual = null;
    window.location.hash = '#login';
}

function sair() {
    alert('Você saiu do sistema.');
    usuarioAtual = null;
    exibirLogin();
}

// --- 4. Renderização dos Painéis ---

// Cria a barra de navegação principal
function atualizarNavegacaoPrincipal(perfil) {
    navegacaoPrincipal.style.display = 'block';
    let navHTML = '';
    
    if (perfil === 'admin') {
        // Opções do Admin
        navHTML += `<a href="#meus-agendamentos">Meus Agendamentos</a>`; 
        navHTML += `<a href="#relatorios">Relatórios Gerais</a>`;
        navHTML += `<a href="#gerenciar-salas">Gerenciar Salas</a>`;
        navHTML += `<a href="#colaboradores">Colaboradores</a>`;
    } else { // Padrão/User
        navHTML += `<a href="#user" class="active-nav">Agendamento</a>`;
    }
    
    // Adiciona o link Sair usando a função sair() global
    navHTML += `<a href="#" onclick="sair()">Sair</a>`; 
    navegacaoPrincipal.innerHTML = navHTML;
}

// Renderiza o conteúdo do Admin Dashboard 
function renderizarPainelAdmin(vista) {
    let contentHTML = `
        <nav>
            <a href="#meus-agendamentos" class="${vista === 'meus-agendamentos' ? 'active-nav' : ''}">Meus Agendamentos</a>
            <a href="#relatorios" class="${vista === 'relatorios' ? 'active-nav' : ''}">Relatórios Gerais</a>
            <a href="#gerenciar-salas" class="${vista === 'gerenciar-salas' ? 'active-nav' : ''}">Gerenciar Salas</a>
            <a href="#colaboradores" class="${vista === 'colaboradores' ? 'active-nav' : ''}">Colaboradores</a>
        </nav>
        <hr>
    `;

    if (vista === 'meus-agendamentos') {
        contentHTML += renderizarMeusAgendamentosAdmin();
    } else if (vista === 'relatorios') {
        contentHTML += renderizarRelatorios();
    } else if (vista === 'gerenciar-salas') {
        contentHTML += renderizarGerenciarSalas();
        // Chama o setup do listener para que ele seja adicionado APÓS a renderização do DOM
        setTimeout(configurarListenerFormularioSala, 0); 
    } else if (vista === 'colaboradores') {
        contentHTML += renderizarColaboradores();
        // Chama o setup do listener para que ele seja adicionado APÓS a renderização do DOM
        setTimeout(configurarListenerFormularioColaborador, 0); 
    }

    conteudoAdmin.innerHTML = contentHTML;
}

// Renderiza apenas os agendamentos do Admin (Admin Dashboard)
function renderizarMeusAgendamentosAdmin() {
    const agendamentosAdmin = todosAgendamentos.filter(agendamento => agendamento.usuario === usuarioAtual.username);

    return `
        <h3>📝 Meus Agendamentos (Admin)</h3>
        <p>Aqui você vê apenas os agendamentos feitos pela sua conta (**${usuarioAtual.username}**).</p>
        
        <table id="admin-report">
            <thead>
                <tr><th>Data</th><th>Sala</th><th>Turno</th><th>Ações</th></tr>
            </thead>
            <tbody>
                ${agendamentosAdmin.length === 0 
                    ? '<tr><td colspan="4" style="text-align: center;">Nenhum agendamento feito por você ainda.</td></tr>'
                    : agendamentosAdmin.map(agendamento => {
                        // Encontra o índice no array geral para o botão de cancelar
                        const indiceAgendamento = todosAgendamentos.findIndex(a => a.data === agendamento.data && a.sala === agendamento.sala && a.turno === agendamento.turno && a.usuario === agendamento.usuario);

                        return `
                        <tr>
                            <td>${formatarData(agendamento.data)}</td>
                            <td>${agendamento.sala}</td>
                            <td>${agendamento.turno}</td>
                            <td><button class="cancelar-btn" data-index="${indiceAgendamento}" style="background-color: #dc3545; margin-top:0;">Cancelar</button></td>
                        </tr>
                        `;
                    }).join('')
                }
            </tbody>
        </table>
        <script>
            // Re-adiciona o listener de cancelamento para o novo botão
            document.querySelectorAll('.cancelar-btn').forEach(button => {
                // Certifica-se de usar a função global cancelarAgendamentoAdmin
                button.addEventListener('click', (e) => cancelamentoAdmin(e.target.getAttribute('data-index'))); 
            });
        </script>
    `;
}

// Conteúdo da página de Relatórios (Geral - TODOS os agendamentos)
function renderizarRelatorios() {
    // 1. Calcular a ocupação por Turno
    const contagemTurnos = todosAgendamentos.reduce((acc, agendamento) => {
        acc[agendamento.turno] = (acc[agendamento.turno] || 0) + 1;
        return acc;
    }, {});
    
    // 2. Determinar o Turno Mais Ocupado
    let turnoMaisUsado = 'Nenhum';
    let contagemMaxima = 0;
    
    // Ordena o array de tuplas [turno, contagem] por contagem em ordem decrescente
    const turnosOrdenados = Object.entries(contagemTurnos).sort(([, a], [, b]) => b - a);
    
    if (turnosOrdenados.length > 0) {
        turnoMaisUsado = turnosOrdenados[0][0];
        contagemMaxima = turnosOrdenados[0][1];
    }
    
    // 3. Montar o HTML com os dados
    return `
        <h3>📊 Relatório de Agendamentos Gerais</h3>
        
        <p>Total de Agendamentos Reais: **${todosAgendamentos.length}**</p>
        <p>Turno Mais Ocupado: **${turnoMaisUsado}** (${contagemMaxima} agendamentos)</p>
        
        <h4>Detalhe por Sala/Turno (Todos os Agendamentos do Sistema)</h4>
        <table id="admin-report">
            <thead>
                <tr><th>Data</th><th>Sala</th><th>Turno</th><th>Agendado Por</th></tr>
            </thead>
            <tbody>
                ${todosAgendamentos.length === 0 
                    ? '<tr><td colspan="4" style="text-align: center;">Nenhum agendamento encontrado.</td></tr>'
                    : todosAgendamentos.map(agendamento => `
                        <tr>
                            <td>${formatarData(agendamento.data)}</td>
                            <td>${agendamento.sala}</td>
                            <td>${agendamento.turno}</td>
                            <td>${agendamento.usuario}</td>
                        </tr>
                    `).join('')
                }
            </tbody>
        </table>
    `;
}

// Conteúdo da página de Gerenciar Salas
function renderizarGerenciarSalas() {
    return `
        <h3>🏢 Gerenciamento de Salas</h3>
        <p>Aqui você pode adicionar, editar ou remover salas de agendamento.</p>
        
        <h4>➕ Adicionar Nova Sala</h4>
        <form id="add-room-form" style="margin-bottom: 30px;">
            <label for="new-room-name">Nome da Sala:</label>
            <input type="text" id="new-room-name" placeholder="Ex: Sala de Reunião B" required>

            <label for="new-room-capacity">Capacidade (Aprox. número de pessoas):</label>
            <input type="number" id="new-room-capacity" min="1" required>
            
            <button type="submit">Adicionar Sala</button>
        </form>

        <h4>Salas Cadastradas</h4>
        <table id="room-management-table">
            <thead>
                <tr><th>ID</th><th>Nome da Sala</th><th>Capacidade</th><th>Ações</th></tr>
            </thead>
            <tbody>
                ${salasDisponiveis.map(sala => `
                    <tr>
                        <td>${sala.id}</td>
                        <td>${sala.nome}</td>
                        <td>${sala.capacidade}</td>
                        <td>
                            <button style="background-color: orange;" onclick="alert('Editar ${sala.nome}')">Editar</button>
                            <button style="background-color: red;" onclick="excluirSala(${sala.id})">Remover</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Conteúdo da página de Colaboradores
function renderizarColaboradores() {
    let contentHTML = `
        <h3>🧑‍💻 Gerenciamento de Colaboradores</h3>
        <p>Cadastre novos usuários para que possam fazer agendamentos.</p>
        
        <h4>➕ Adicionar Novo Colaborador</h4>
        <form id="add-collaborator-form">
            <label for="colab-name">Nome:</label>
            <input type="text" id="colab-name" required>

            <label for="colab-email">Email (Será o Usuário de Login):</label>
            <input type="email" id="colab-email" required>

            <label for="colab-phone">Telefone:</label>
            <input type="text" id="colab-phone" required>

            <label for="colab-password">Senha Temporária (Mín. 6 caracteres):</label>
            <input type="text" id="colab-password" required>
            
            <button type="submit">Cadastrar Colaborador</button>
        </form>

        <h4 style="margin-top: 40px;">Lista de Colaboradores Cadastrados</h4>
        <table id="admin-report">
            <thead>
                <tr><th>Nome</th><th>Email (Usuário)</th><th>Telefone</th><th>Ações</th></tr>
            </thead>
            <tbody>
    `;
    
    // Usuários fixos (Admin e Padrão)
    const usuariosFixos = Object.keys(USUARIOS)
        .filter(username => ['admin', 'padrao'].includes(username))
        .map(username => ({
            nome: username === 'admin' ? 'Administrador' : 'Usuário Padrão',
            email: username,
            telefone: 'N/A (Fixo)',
            isFixo: true
        }));

    const todosColaboradores = [...usuariosFixos, ...colaboradoresCadastrados];

    contentHTML += todosColaboradores.map(colaborador => `
        <tr>
            <td>${colaborador.nome}</td>
            <td>${colaborador.email}</td>
            <td>${colaborador.telefone}</td>
            <td>
                ${colaborador.isFixo ? 'Usuário Fixo' : `<button style="background-color: red;" onclick="excluirColaborador(${colaborador.id})">Remover</button>`}
            </td>
        </tr>
    `).join('');
    
    contentHTML += `
            </tbody>
        </table>
    `;

    return contentHTML;
}

// Renderiza o painel do Usuário Padrão (Agendamento e Meus Agendamentos)
function renderizarPainelUsuario() {
    
    // 1. Preenche o select de salas
    selecaoSalaUsuario.innerHTML = salasDisponiveis.map(sala => 
        `<option value="${sala.nome}">${sala.nome}</option>`
    ).join('');
    
    // 2. Renderiza a lista de agendamentos do usuário logado
    listaAgendamentosUsuario.innerHTML = ''; 

    const agendamentosUsuario = todosAgendamentos.filter(agendamento => agendamento.usuario === usuarioAtual.username);
    
    if (agendamentosUsuario.length === 0) {
        listaAgendamentosUsuario.innerHTML = '<p>Nenhum agendamento feito ainda.</p>';
        return;
    }

    agendamentosUsuario.forEach(agendamento => {
        // Encontra o índice no array geral para o botão de cancelar
        const indiceAgendamento = todosAgendamentos.findIndex(a => a.data === agendamento.data && a.sala === agendamento.sala && a.turno === agendamento.turno && a.usuario === agendamento.usuario);

        const li = document.createElement('li');
        li.innerHTML = `
            <span>Data: **${formatarData(agendamento.data)}** | Sala: **${agendamento.sala}** | Turno: **${agendamento.turno}**</span>
            <button class="cancelar-btn" data-index="${indiceAgendamento}">Cancelar</button>
        `;
        listaAgendamentosUsuario.appendChild(li);
    });
    
    document.querySelectorAll('.cancelar-btn').forEach(button => {
        // Usa a função de cancelamento padrão (usuário)
        button.addEventListener('click', (e) => cancelamentoUsuario(e.target.getAttribute('data-index'))); 
    });
}


// --- 5. Lógica da Aplicação (Event Listeners e Funções) ---

// Lógica de Login
formularioLogin.addEventListener('submit', function(e) {
    e.preventDefault(); 
    const nomeUsuario = document.getElementById('username').value;
    const senha = document.getElementById('password').value;

    const usuario = USUARIOS[nomeUsuario];

    if (usuario && usuario.senha === senha) {
        usuarioAtual = { username: nomeUsuario, perfil: usuario.perfil };
        alert(`Login bem-sucedido! Acesso como ${usuario.perfil}.`);
        
        navegar(usuario.perfil === 'admin' ? '#meus-agendamentos' : '#user');
        
    } else {
        alert('Usuário ou Senha incorretos!');
    }
});

// Lógica de Agendamento 
formularioAgendamento.addEventListener('submit', function(e) {
    e.preventDefault();
    const data = document.getElementById('date').value; 
    const sala = document.getElementById('room').value;
    const turno = document.getElementById('time').value;

    // Não permitir agendar no passado
    if (new Date(data) < new Date(hoje)) {
        alert('❌ Erro: Não é possível agendar em uma data passada.');
        return;
    }

    // Verifica se a sala já está agendada nesta DATA e TURNO por qualquer usuário.
    const conflito = todosAgendamentos.some(agendamento => agendamento.data === data && agendamento.sala === sala && agendamento.turno === turno);

    if (conflito) {
        alert(`❌ Erro: A sala ${sala} já está agendada para o turno da ${turno} na data ${formatarData(data)}.`);
        return;
    }
    
    const novoAgendamento = { data, sala, turno, usuario: usuarioAtual.username }; 
    todosAgendamentos.push(novoAgendamento); 

    alert(`✅ Sucesso! Sala ${sala} agendada para o turno da ${turno} no dia ${formatarData(data)}.`);
    formularioAgendamento.reset(); 
    
    if (usuarioAtual.perfil === 'admin') {
        renderizarPainelAdmin('meus-agendamentos');
    } else {
        renderizarPainelUsuario(); 
    }
});

// Lógica de Cancelamento (para o usuário Padrão)
function cancelamentoUsuario(indice) {
    const agendamento = todosAgendamentos[indice];
    
    if (confirm(`Tem certeza que deseja cancelar o agendamento da sala ${agendamento.sala} no turno da ${agendamento.turno} no dia ${formatarData(agendamento.data)}?`)) {
        todosAgendamentos.splice(indice, 1);
        alert(`🚫 Agendamento cancelado: Sala ${agendamento.sala} no dia ${formatarData(agendamento.data)}.`);
        renderizarPainelUsuario(); 
    }
}

// Lógica de Cancelamento (para o Admin - chamada via script injetado na renderização)
function cancelamentoAdmin(indice) {
    const agendamento = todosAgendamentos[indice];

    if (confirm(`Tem certeza que deseja cancelar o agendamento da sala ${agendamento.sala} no turno da ${agendamento.turno} no dia ${formatarData(agendamento.data)}?`)) {
        todosAgendamentos.splice(indice, 1);
        alert(`🚫 Agendamento cancelado: Sala ${agendamento.sala} no dia ${formatarData(agendamento.data)}.`);
        renderizarPainelAdmin('meus-agendamentos'); // Recarrega a view correta
    }
}


// --- Funções de Gerenciamento de Salas ---

// Lógica de Adicionar Sala
function adicionarSala(e) {
    e.preventDefault();
    const form = document.getElementById('add-room-form');
    const nome = document.getElementById('new-room-name').value.trim();
    const capacidade = parseInt(document.getElementById('new-room-capacity').value);

    if (salasDisponiveis.some(sala => sala.nome.toLowerCase() === nome.toLowerCase())) {
        alert('❌ Erro: Uma sala com este nome já existe.');
        return;
    }

    const novaSala = {
        id: proximoIdSala++,
        nome: nome,
        capacidade: capacidade
    };
    salasDisponiveis.push(novaSala);
    
    alert(`✅ Sala "${nome}" com capacidade para ${capacidade} adicionada com sucesso!`);
    form.reset(); 
    
    renderizarPainelAdmin('gerenciar-salas');
}

// Lógica de Remover Sala (Admin)
function excluirSala(idSala) {
    if (confirm(`Tem certeza que deseja remover a sala com ID ${idSala}? Isso removerá também seus agendamentos.`)) {
        const nomeSala = salasDisponiveis.find(r => r.id === idSala)?.nome;
        
        salasDisponiveis = salasDisponiveis.filter(sala => sala.id !== idSala);
        
        todosAgendamentos = todosAgendamentos.filter(agendamento => agendamento.sala !== nomeSala);
        
        alert(`Sala ${nomeSala} removida com sucesso (Simulação).`);
        renderizarPainelAdmin('gerenciar-salas');
    }
}

// Adiciona o event listener do formulário de adicionar sala
function configurarListenerFormularioSala() {
    const formularioAdicionarSala = document.getElementById('add-room-form');
    if (formularioAdicionarSala) {
        formularioAdicionarSala.addEventListener('submit', adicionarSala);
    }
}


// --- Funções de Gerenciamento de Colaboradores ---

// Lógica de Adicionar Colaborador
function adicionarColaborador(e) {
    e.preventDefault();
    const form = document.getElementById('add-collaborator-form');
    const nome = document.getElementById('colab-name').value;
    const email = document.getElementById('colab-email').value;
    const telefone = document.getElementById('colab-phone').value;
    const senha = document.getElementById('colab-password').value;

    if (USUARIOS[email]) {
        alert('❌ Erro: Já existe um usuário com este email/username.');
        return;
    }

    const novoColaborador = {
        id: proximoIdUsuario++,
        nome: nome,
        email: email, 
        telefone: telefone,
        perfil: 'user'
    };
    colaboradoresCadastrados.push(novoColaborador);
    
    USUARIOS[email] = { senha: senha, perfil: 'user' };
    
    alert(`✅ Colaborador ${nome} (Usuário: ${email}) cadastrado com sucesso!`);
    form.reset(); 
    
    renderizarPainelAdmin('colaboradores');
}

// Lógica de Excluir Colaborador
function excluirColaborador(idColaborador) {
    const indiceColaborador = colaboradoresCadastrados.findIndex(u => u.id === idColaborador);
    if (indiceColaborador === -1) return;
    
    const colaboradorParaExcluir = colaboradoresCadastrados[indiceColaborador];

    if (confirm(`Tem certeza que deseja remover o colaborador: ${colaboradorParaExcluir.nome}?`)) {
        colaboradoresCadastrados.splice(indiceColaborador, 1);
        
        delete USUARIOS[colaboradorParaExcluir.email];
        
        todosAgendamentos = todosAgendamentos.filter(agendamento => agendamento.usuario !== colaboradorParaExcluir.email);
        
        alert(`🚫 Colaborador ${colaboradorParaExcluir.nome} removido com sucesso.`);
        renderizarPainelAdmin('colaboradores');
    }
}

// Adiciona o event listener do formulário de colaboradores. 
function configurarListenerFormularioColaborador() {
    const formularioAdicionarColaborador = document.getElementById('add-collaborator-form');
    if (formularioAdicionarColaborador) {
        formularioAdicionarColaborador.addEventListener('submit', adicionarColaborador);
    }
}


// --- 6. Inicialização e Observador de Hash (Rotas) ---

// Escuta a mudança de hash no URL (navegação)
window.addEventListener('hashchange', () => {
    rotear(window.location.hash);
});

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    rotear(window.location.hash || '#login');
});