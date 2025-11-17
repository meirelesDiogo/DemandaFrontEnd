// --- 1. Seleção de Elementos ---
const loginForm = document.getElementById('login-form');
const mainNav = document.getElementById('main-nav');
const loginScreen = document.getElementById('login-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const userDashboard = document.getElementById('user-dashboard');
const adminContent = document.getElementById('admin-content');
const userRoomSelect = document.getElementById('room'); // Select do usuário
const scheduleForm = document.getElementById('schedule-form');
const appointmentsList = document.getElementById('my-appointments');

// --- 2. Dados Fictícios (Banco de Dados Simulado) ---
const USERS = {
    'admin': { password: '123', role: 'admin' },
    'padrao': { password: '456', role: 'user' }
};

let userAppointments = []; 
let availableRooms = [
    { id: 1, name: 'Sala 101', capacity: 30 },
    { id: 2, name: 'Auditório', capacity: 150 },
    { id: 3, name: 'Laboratório de Química', capacity: 25 }
];

// Simulação de todos os agendamentos para o relatório do Admin
let allAppointments = [
    { room: 'Sala 101', time: 'Manhã', user: 'padrao' },
    { room: 'Auditório', time: 'Tarde', user: 'colaborador1' },
    { room: 'Sala 101', time: 'Noite', user: 'colaborador2' },
    { room: 'Laboratório de Química', time: 'Tarde', user: 'colaborador3' },
];

let currentUser = null; // Armazena o usuário logado

// --- 3. Funções de Navegação e Rotas (SPA) ---

/**
 * Redireciona para uma nova "página" (hash URL) e atualiza a interface.
 * @param {string} hash - O hash do URL (ex: '#relatorios').
 */
function navigate(hash) {
    window.location.hash = hash;
    route(hash);
}

/**
 * Função principal de roteamento que exibe a página correta.
 */
function route(hash) {
    const role = currentUser ? currentUser.role : null;
    let targetPage = hash.replace('#', '');
    
    // 1. Oculta todas as páginas
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // 2. Lógica de redirecionamento e exibição
    
    if (!role && targetPage !== 'login' && targetPage !== '') {
        // Redireciona para o login se não estiver logado
        showLogin();
        return;
    }

    if (role === 'admin') {
        showScreen(adminDashboard);
        renderAdminDashboard(targetPage || 'relatorios'); // Padrão é Relatórios
        updateMainNav('admin');
    } else if (role === 'user') {
        showScreen(userDashboard);
        renderUserDashboard();
        updateMainNav('user');
    } else {
        // Se não tiver role ou for a página de login
        showScreen(loginScreen);
        mainNav.style.display = 'none';
    }
}

function showScreen(screenToShow) {
    document.querySelectorAll('.page').forEach(screen => {
        screen.classList.remove('active');
    });
    screenToShow.classList.add('active');
}

function showLogin() {
    showScreen(loginScreen);
    mainNav.style.display = 'none';
    currentUser = null;
    window.location.hash = '#login';
}

function logout() {
    alert('Você saiu do sistema.');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    showLogin();
}

// --- 4. Renderização dos Painéis ---

// Cria a barra de navegação principal (no header)
function updateMainNav(role) {
    mainNav.style.display = 'block';
    let navHTML = '';
    
    if (role === 'admin') {
        navHTML += `<a href="#relatorios">Relatórios</a>`;
        navHTML += `<a href="#gerenciar-salas">Gerenciar Salas</a>`;
        navHTML += `<a href="#colaboradores">Colaboradores</a>`;
    } else { // Padrão/User
        navHTML += `<a href="#user" class="active-nav">Agendamento</a>`;
    }
    
    navHTML += `<a href="#" onclick="logout()">Sair</a>`;
    mainNav.innerHTML = navHTML;
}

// Renderiza o conteúdo do Admin Dashboard
function renderAdminDashboard(view) {
    let contentHTML = `
        <nav>
            <a href="#relatorios" class="${view === 'relatorios' ? 'active-nav' : ''}">Relatórios</a>
            <a href="#gerenciar-salas" class="${view === 'gerenciar-salas' ? 'active-nav' : ''}">Gerenciar Salas</a>
            <a href="#colaboradores" class="${view === 'colaboradores' ? 'active-nav' : ''}">Colaboradores</a>
        </nav>
        <hr>
    `;

    if (view === 'relatorios') {
        contentHTML += renderRelatorios();
    } else if (view === 'gerenciar-salas') {
        contentHTML += renderGerenciarSalas();
    } else if (view === 'colaboradores') {
        contentHTML += renderColaboradores();
    }

    adminContent.innerHTML = contentHTML;
}

// Conteúdo da página de Relatórios
function renderRelatorios() {
    // Lógica para calcular a ocupação por turno
    const turnos = allAppointments.reduce((acc, app) => {
        acc[app.time] = (acc[app.time] || 0) + 1;
        return acc;
    }, {});
    
    const mostUsedTurn = Object.keys(turnos).sort((a, b) => turnos[b] - turnos[a])[0] || 'Nenhum';
    
    return `
        <h3>📊 Relatório de Agendamentos</h3>
        <p>Total de Agendamentos (Simulação): **${allAppointments.length}**</p>
        <p>Turno Mais Ocupado: **${mostUsedTurn}** (${turnos[mostUsedTurn] || 0} agendamentos)</p>
        
        <h4>Detalhe por Sala/Turno</h4>
        <table id="admin-report">
            <thead>
                <tr><th>Sala</th><th>Agendamentos</th><th>Usuário</th><th>Turno</th></tr>
            </thead>
            <tbody>
                ${allAppointments.map(app => `
                    <tr><td>${app.room}</td><td>1</td><td>${app.user}</td><td>${app.time}</td></tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Conteúdo da página de Gerenciar Salas
function renderGerenciarSalas() {
    return `
        <h3>🏢 Gerenciamento de Salas</h3>
        <p>Aqui você pode adicionar, editar ou remover salas de agendamento.</p>
        
        <button onclick="alert('Funcionalidade: Adicionar Nova Sala')">➕ Adicionar Nova Sala</button>
        
        <table id="room-management-table">
            <thead>
                <tr><th>ID</th><th>Nome da Sala</th><th>Capacidade</th><th>Ações</th></tr>
            </thead>
            <tbody>
                ${availableRooms.map(room => `
                    <tr>
                        <td>${room.id}</td>
                        <td>${room.name}</td>
                        <td>${room.capacity}</td>
                        <td>
                            <button style="background-color: orange;" onclick="alert('Editar ${room.name}')">Editar</button>
                            <button style="background-color: red;" onclick="deleteRoom(${room.id})">Remover</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Conteúdo da página de Colaboradores
function renderColaboradores() {
    return `
        <h3>🧑‍💻 Gerenciamento de Colaboradores</h3>
        <p>Visão geral dos usuários e opção para adicionar novos colaboradores.</p>
        <button onclick="alert('Funcionalidade: Adicionar Novo Colaborador (Usuário/Senha)')">➕ Adicionar Novo Colaborador</button>
        
        <h4>Usuários Cadastrados (Simulação)</h4>
        <ul>
            <li>**admin** (Administrador)</li>
            <li>**padrao** (Usuário Padrão)</li>
            <li>colaborador1 (Usuário Padrão)</li>
        </ul>
    `;
}


// Renderiza o painel do Usuário Padrão (Agendamento e Meus Agendamentos)
function renderUserDashboard() {
    // Preenche o campo SELECT das salas
    userRoomSelect.innerHTML = availableRooms.map(room => 
        `<option value="${room.name}">${room.name}</option>`
    ).join('');
    
    // Renderiza a lista de agendamentos do usuário
    appointmentsList.innerHTML = ''; 

    if (userAppointments.length === 0) {
        appointmentsList.innerHTML = '<p>Nenhum agendamento feito ainda.</p>';
        return;
    }

    userAppointments.forEach((app, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>Sala: **${app.room}** | Turno: **${app.time}**</span>
            <button class="cancel-btn" data-index="${index}">Cancelar</button>
        `;
        appointmentsList.appendChild(li);
    });
    
    document.querySelectorAll('.cancel-btn').forEach(button => {
        button.addEventListener('click', cancelAppointment);
    });
}

// --- 5. Lógica de Interação ---

// Lógica de Login
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = USERS[username];

    if (user && user.password === password) {
        currentUser = { username, role: user.role };
        alert(`Login bem-sucedido! Acesso como ${user.role}.`);
        
        // Redireciona para o painel apropriado
        navigate(user.role === 'admin' ? '#relatorios' : '#user');
        
    } else {
        alert('Usuário ou Senha incorretos!');
    }
});

// Lógica de Agendamento do Usuário Padrão
scheduleForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const room = document.getElementById('room').value;
    const time = document.getElementById('time').value;

    const isConflict = userAppointments.some(app => app.room === room && app.time === time);

    if (isConflict) {
        alert(`❌ Erro: A sala ${room} já está agendada para o turno da ${time} por você.`);
        return;
    }

    const newAppointment = { room, time, user: currentUser.username };
    userAppointments.push(newAppointment);
    allAppointments.push(newAppointment); // Adiciona ao relatório do admin

    alert(`✅ Sucesso! Sala ${room} agendada para o turno da ${time}.`);
    scheduleForm.reset(); 
    renderUserDashboard(); // Atualiza a lista na tela
});

// Lógica de Cancelamento
function cancelAppointment(e) {
    const index = e.target.getAttribute('data-index');
    
    if (confirm(`Tem certeza que deseja cancelar o agendamento da sala ${userAppointments[index].room} no turno da ${userAppointments[index].time}?`)) {
        const cancelled = userAppointments.splice(index, 1)[0];
        
        // Remove do array de todos os agendamentos também
        const adminIndex = allAppointments.findIndex(app => app.room === cancelled.room && app.time === cancelled.time && app.user === cancelled.user);
        if (adminIndex > -1) {
            allAppointments.splice(adminIndex, 1);
        }

        alert(`🚫 Agendamento cancelado: Sala ${cancelled.room} no turno da ${cancelled.time}.`);
        renderUserDashboard(); 
    }
}

// Lógica de Remover Sala (Admin)
function deleteRoom(roomId) {
    if (confirm(`Tem certeza que deseja remover a sala com ID ${roomId}? Isso removerá também seus agendamentos.`)) {
        availableRooms = availableRooms.filter(room => room.id !== roomId);
        // Simulação de remoção de agendamentos relacionados
        allAppointments = allAppointments.filter(app => app.room !== availableRooms.find(r => r.id === roomId)?.name);
        
        alert(`Sala com ID ${roomId} removida com sucesso (Simulação).`);
        renderAdminDashboard('gerenciar-salas'); // Recarrega a página de salas
    }
}


// --- 6. Inicialização e Observador de Hash (Rotas) ---

// Escuta a mudança de hash no URL (navegação)
window.addEventListener('hashchange', () => {
    route(window.location.hash);
});

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Simulação de um usuário logado (opcional, para testes rápidos)
    // currentUser = USERS['admin']; // Descomente para logar como admin automaticamente
    // currentUser = USERS['padrao']; // Descomente para logar como user automaticamente
    
    if (currentUser) {
        currentUser.username = currentUser.role; // Ajusta o username
        navigate(currentUser.role === 'admin' ? '#relatorios' : '#user');
    } else {
        route(window.location.hash || '#login');
    }
});

// ... (Mantenha todas as variáveis e funções anteriores, exceto a antiga renderRelatorios) ...

// Conteúdo da página de Relatórios
function renderRelatorios() {
    // 1. Calcular a ocupação por Turno
    const turnos = allAppointments.reduce((acc, app) => {
        acc[app.time] = (acc[app.time] || 0) + 1;
        return acc;
    }, {});
    
    // 2. Determinar o Turno Mais Ocupado
    let mostUsedTurn = 'Nenhum';
    let maxCount = 0;
    
    // Converte os resultados em um array e ordena para encontrar o maior
    const sortedTurns = Object.entries(turnos).sort(([, a], [, b]) => b - a);
    
    if (sortedTurns.length > 0) {
        mostUsedTurn = sortedTurns[0][0];
        maxCount = sortedTurns[0][1];
    }
    
    // 3. Calcular a ocupação por Sala (para o relatório detalhado)
    // Usaremos allAppointments diretamente para a tabela, mas podemos preparar um resumo:
    
    // 4. Montar o HTML com os dados reais
    return `
        <h3>📊 Relatório de Agendamentos</h3>
        
        <p>Total de Agendamentos: **${allAppointments.length}**</p>
        <p>Turno Mais Ocupado: **${mostUsedTurn}** (${maxCount} agendamentos)</p>
        
        <h4>Detalhe por Sala/Turno (Todos os Agendamentos)</h4>
        <table id="admin-report">
            <thead>
                <tr><th>Sala</th><th>Turno</th><th>Agendado Por</th></tr>
            </thead>
            <tbody>
                ${allAppointments.length === 0 
                    ? '<tr><td colspan="3" style="text-align: center;">Nenhum agendamento encontrado.</td></tr>'
                    : allAppointments.map(app => `
                        <tr>
                            <td>${app.room}</td>
                            <td>${app.time}</td>
                            <td>${app.user}</td>
                        </tr>
                    `).join('')
                }
            </tbody>
        </table>
    `;
}

// ... (Mantenha o restante do código do script.js) ...