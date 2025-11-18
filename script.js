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
    'padrao': { password: '456', role: 'user' },
    'colaborador1': { password: '789', role: 'user' },
    'colaborador2': { password: '101', role: 'user' },
    'colaborador3': { password: '102', role: 'user' }
};

let userAppointments = []; 
let availableRooms = [
    { id: 1, name: 'Sala 101', capacity: 30 },
    { id: 2, name: 'Auditório', capacity: 150 },
    { id: 3, name: 'Laboratório de Química', capacity: 25 }
];
let nextRoomId = 4; // Próximo ID para novas salas

// Data de hoje formatada para YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

// ARRAY DE AGENDAMENTOS REAIS (INICIALMENTE VAZIO, conforme solicitado)
let allAppointments = []; 

// Array para armazenar colaboradores dinâmicos
let registeredUsers = [
    { id: 100, name: 'Ana Silva', email: 'ana@escola.com', phone: '(31) 9999-1111', role: 'user' },
    { id: 101, name: 'Bruno Costa', email: 'bruno@escola.com', phone: '(31) 9999-2222', role: 'user' }
];

let nextUserId = 102; // ID para o próximo colaborador
let currentUser = null; // Armazena o usuário logado

// Função auxiliar para formatar a data (DD/MM/AAAA)
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

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
        showLogin();
        return;
    }

    if (role === 'admin') {
        showScreen(adminDashboard);
        // Admin padrão agora vai para 'Meus Agendamentos'
        renderAdminDashboard(targetPage || 'meus-agendamentos'); 
        updateMainNav('admin');
    } else if (role === 'user') {
        showScreen(userDashboard);
        renderUserDashboard();
        updateMainNav('user');
    } else {
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
    currentUser = null;
    showLogin();
}

// --- 4. Renderização dos Painéis ---

// Cria a barra de navegação principal (inclui Meus Agendamentos para o Admin)
function updateMainNav(role) {
    mainNav.style.display = 'block';
    let navHTML = '';
    
    if (role === 'admin') {
        // Opções do Admin
        navHTML += `<a href="#meus-agendamentos">Meus Agendamentos</a>`; 
        navHTML += `<a href="#relatorios">Relatórios Gerais</a>`;
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
            <a href="#meus-agendamentos" class="${view === 'meus-agendamentos' ? 'active-nav' : ''}">Meus Agendamentos</a>
            <a href="#relatorios" class="${view === 'relatorios' ? 'active-nav' : ''}">Relatórios Gerais</a>
            <a href="#gerenciar-salas" class="${view === 'gerenciar-salas' ? 'active-nav' : ''}">Gerenciar Salas</a>
            <a href="#colaboradores" class="${view === 'colaboradores' ? 'active-nav' : ''}">Colaboradores</a>
        </nav>
        <hr>
    `;

    if (view === 'meus-agendamentos') {
        contentHTML += renderMeusAgendamentosAdmin();
    } else if (view === 'relatorios') {
        contentHTML += renderRelatorios();
    } else if (view === 'gerenciar-salas') {
        contentHTML += renderGerenciarSalas();
        setTimeout(setupAddRoomFormListener, 0);
    } else if (view === 'colaboradores') {
        contentHTML += renderColaboradores();
        setTimeout(setupCollaboratorFormListener, 0); 
    }

    adminContent.innerHTML = contentHTML;
}

// Renderiza apenas os agendamentos do Admin (Admin Dashboard)
function renderMeusAgendamentosAdmin() {
    const adminApps = allAppointments.filter(app => app.user === currentUser.username);

    return `
        <h3>📝 Meus Agendamentos (Admin)</h3>
        <p>Aqui você vê apenas os agendamentos feitos pela sua conta (**${currentUser.username}**).</p>
        
        <table id="admin-report">
            <thead>
                <tr><th>Data</th><th>Sala</th><th>Turno</th><th>Ações</th></tr>
            </thead>
            <tbody>
                ${adminApps.length === 0 
                    ? '<tr><td colspan="4" style="text-align: center;">Nenhum agendamento feito por você ainda.</td></tr>'
                    : adminApps.map(app => {
                        // Encontra o índice no array geral para o botão de cancelar
                        const appIndex = allAppointments.findIndex(a => a.date === app.date && a.room === app.room && a.time === app.time && a.user === app.user);

                        return `
                        <tr>
                            <td>${formatDate(app.date)}</td>
                            <td>${app.room}</td>
                            <td>${app.time}</td>
                            <td><button class="cancel-btn" data-index="${appIndex}" style="background-color: #dc3545; margin-top:0;">Cancelar</button></td>
                        </tr>
                        `;
                    }).join('')
                }
            </tbody>
        </table>
        <script>
            // Re-adiciona o listener de cancelamento para o novo botão
            document.querySelectorAll('.cancel-btn').forEach(button => {
                button.addEventListener('click', cancelAppointmentAdmin);
            });
        </script>
    `;
}

// Conteúdo da página de Relatórios (Geral - TODOS os agendamentos)
function renderRelatorios() {
    // 1. Calcular a ocupação por Turno
    const turnos = allAppointments.reduce((acc, app) => {
        acc[app.time] = (acc[app.time] || 0) + 1;
        return acc;
    }, {});
    
    // 2. Determinar o Turno Mais Ocupado
    let mostUsedTurn = 'Nenhum';
    let maxCount = 0;
    
    // Sorts the array of tuples [turn, count] by count in descending order
    const sortedTurns = Object.entries(turnos).sort(([, a], [, b]) => b - a);
    
    if (sortedTurns.length > 0) {
        mostUsedTurn = sortedTurns[0][0];
        maxCount = sortedTurns[0][1];
    }
    
    // 3. Montar o HTML com os dados
    return `
        <h3>📊 Relatório de Agendamentos Gerais</h3>
        
        <p>Total de Agendamentos Reais: **${allAppointments.length}**</p>
        <p>Turno Mais Ocupado: **${mostUsedTurn}** (${maxCount} agendamentos)</p>
        
        <h4>Detalhe por Sala/Turno (Todos os Agendamentos do Sistema)</h4>
        <table id="admin-report">
            <thead>
                <tr><th>Data</th><th>Sala</th><th>Turno</th><th>Agendado Por</th></tr>
            </thead>
            <tbody>
                ${allAppointments.length === 0 
                    ? '<tr><td colspan="4" style="text-align: center;">Nenhum agendamento encontrado.</td></tr>'
                    : allAppointments.map(app => `
                        <tr>
                            <td>${formatDate(app.date)}</td>
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

// Conteúdo da página de Gerenciar Salas
function renderGerenciarSalas() {
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
    
    const fixedUsers = Object.keys(USERS)
        .filter(username => ['admin', 'padrao'].includes(username))
        .map(username => ({
            name: username === 'admin' ? 'Administrador' : 'Usuário Padrão',
            email: username,
            phone: 'N/A (Fixo)',
            isFixed: true
        }));

    const allCollabs = [...fixedUsers, ...registeredUsers];

    contentHTML += allCollabs.map(colab => `
        <tr>
            <td>${colab.name}</td>
            <td>${colab.email}</td>
            <td>${colab.phone}</td>
            <td>
                ${colab.isFixed ? 'Usuário Fixo' : `<button style="background-color: red;" onclick="deleteCollaborator(${colab.id})">Remover</button>`}
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
function renderUserDashboard() {
    // Preenche o campo SELECT das salas
    userRoomSelect.innerHTML = availableRooms.map(room => 
        `<option value="${room.name}">${room.name}</option>`
    ).join('');
    
    // Renderiza a lista de agendamentos do usuário
    appointmentsList.innerHTML = ''; 

    const userApps = allAppointments.filter(app => app.user === currentUser.username);
    
    if (userApps.length === 0) {
        appointmentsList.innerHTML = '<p>Nenhum agendamento feito ainda.</p>';
        return;
    }

    userApps.forEach((app, index) => {
        // Encontra o índice correto no array principal (allAppointments) para o botão de cancelar
        const appIndex = allAppointments.findIndex(a => a.date === app.date && a.room === app.room && a.time === app.time && a.user === app.user);

        const li = document.createElement('li');
        li.innerHTML = `
            <span>Data: **${formatDate(app.date)}** | Sala: **${app.room}** | Turno: **${app.time}**</span>
            <button class="cancel-btn" data-index="${appIndex}">Cancelar</button>
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
        
        // Redireciona o admin para a nova aba 'Meus Agendamentos' por padrão
        navigate(user.role === 'admin' ? '#meus-agendamentos' : '#user');
        
    } else {
        alert('Usuário ou Senha incorretos!');
    }
});

// Lógica de Agendamento (Com data e validação de conflito)
scheduleForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('date').value; 
    const room = document.getElementById('room').value;
    const time = document.getElementById('time').value;

    // Validação de data: Não permitir agendar no passado
    if (new Date(date) < new Date(today)) {
        alert('❌ Erro: Não é possível agendar em uma data passada.');
        return;
    }

    // CONFLITO: verifica se a sala já está agendada nesta DATA e TURNO por qualquer usuário.
    const isConflict = allAppointments.some(app => app.date === date && app.room === room && app.time === time);

    if (isConflict) {
        alert(`❌ Erro: A sala ${room} já está agendada para o turno da ${time} na data ${formatDate(date)}.`);
        return;
    }
    
    const newAppointment = { date, room, time, user: currentUser.username }; 
    allAppointments.push(newAppointment); 

    alert(`✅ Sucesso! Sala ${room} agendada para o turno da ${time} no dia ${formatDate(date)}.`);
    scheduleForm.reset(); 
    
    if (currentUser.role === 'admin') {
        renderAdminDashboard('meus-agendamentos');
    } else {
        renderUserDashboard(); 
    }
});

// Lógica de Cancelamento (para o usuário Padrão)
function cancelAppointment(e) {
    const adminIndex = e.target.getAttribute('data-index');
    const app = allAppointments[adminIndex];
    
    if (confirm(`Tem certeza que deseja cancelar o agendamento da sala ${app.room} no turno da ${app.time} no dia ${formatDate(app.date)}?`)) {
        allAppointments.splice(adminIndex, 1);
        alert(`🚫 Agendamento cancelado: Sala ${app.room} no dia ${formatDate(app.date)}.`);
        renderUserDashboard(); 
    }
}

// Lógica de Cancelamento (para o Admin)
function cancelAppointmentAdmin(e) {
    const adminIndex = e.target.getAttribute('data-index');
    const app = allAppointments[adminIndex];

    if (confirm(`Tem certeza que deseja cancelar o agendamento da sala ${app.room} no turno da ${app.time} no dia ${formatDate(app.date)}?`)) {
        allAppointments.splice(adminIndex, 1);
        alert(`🚫 Agendamento cancelado: Sala ${app.room} no dia ${formatDate(app.date)}.`);
        renderAdminDashboard('meus-agendamentos'); // Recarrega a view correta
    }
}

// Lógica de Adicionar Sala
function addRoom(e) {
    e.preventDefault();
    const form = document.getElementById('add-room-form');
    const name = document.getElementById('new-room-name').value.trim();
    const capacity = parseInt(document.getElementById('new-room-capacity').value);

    if (availableRooms.some(room => room.name.toLowerCase() === name.toLowerCase())) {
        alert('❌ Erro: Uma sala com este nome já existe.');
        return;
    }

    const newRoom = {
        id: nextRoomId++,
        name: name,
        capacity: capacity
    };
    availableRooms.push(newRoom);
    
    alert(`✅ Sala "${name}" com capacidade para ${capacity} adicionada com sucesso!`);
    form.reset(); 
    
    renderAdminDashboard('gerenciar-salas');
}

// Lógica de Remover Sala (Admin)
function deleteRoom(roomId) {
    if (confirm(`Tem certeza que deseja remover a sala com ID ${roomId}? Isso removerá também seus agendamentos.`)) {
        const roomName = availableRooms.find(r => r.id === roomId)?.name;
        
        availableRooms = availableRooms.filter(room => room.id !== roomId);
        
        allAppointments = allAppointments.filter(app => app.room !== roomName);
        
        alert(`Sala ${roomName} removida com sucesso (Simulação).`);
        renderAdminDashboard('gerenciar-salas');
    }
}

// Adiciona o event listener do formulário de adicionar sala
function setupAddRoomFormListener() {
    const addRoomForm = document.getElementById('add-room-form');
    if (addRoomForm) {
        addRoomForm.addEventListener('submit', addRoom);
    }
}


// --- LÓGICA DE COLABORADORES ---

// Lógica de Adicionar Colaborador
function addCollaborator(e) {
    e.preventDefault();
    const form = document.getElementById('add-collaborator-form');
    const name = document.getElementById('colab-name').value;
    const email = document.getElementById('colab-email').value;
    const phone = document.getElementById('colab-phone').value;
    const password = document.getElementById('colab-password').value;

    if (USERS[email]) {
        alert('❌ Erro: Já existe um usuário com este email/username.');
        return;
    }

    const newCollab = {
        id: nextUserId++,
        name: name,
        email: email, 
        phone: phone,
        role: 'user'
    };
    registeredUsers.push(newCollab);
    
    USERS[email] = { password: password, role: 'user' };
    
    alert(`✅ Colaborador ${name} (Usuário: ${email}) cadastrado com sucesso!`);
    form.reset(); 
    
    renderAdminDashboard('colaboradores');
}

// Lógica de Excluir Colaborador
function deleteCollaborator(collabId) {
    const colabIndex = registeredUsers.findIndex(u => u.id === collabId);
    if (colabIndex === -1) return;
    
    const colabToDelete = registeredUsers[colabIndex];

    if (confirm(`Tem certeza que deseja remover o colaborador: ${colabToDelete.name}?`)) {
        registeredUsers.splice(colabIndex, 1);
        
        delete USERS[colabToDelete.email];
        
        allAppointments = allAppointments.filter(app => app.user !== colabToDelete.email);
        
        alert(`🚫 Colaborador ${colabToDelete.name} removido com sucesso.`);
        renderAdminDashboard('colaboradores');
    }
}

// Adiciona o event listener do formulário de colaboradores. 
function setupCollaboratorFormListener() {
    const addCollabForm = document.getElementById('add-collaborator-form');
    if (addCollabForm) {
        addCollabForm.addEventListener('submit', addCollaborator);
    }
}


// --- 6. Inicialização e Observador de Hash (Rotas) ---

// Escuta a mudança de hash no URL (navegação)
window.addEventListener('hashchange', () => {
    route(window.location.hash);
});

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    route(window.location.hash || '#login');
});