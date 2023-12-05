//conexao do javascript do Index.html
let id_user;//adicionei uma variavel global para receber o id_usuario vindo do login, que nao pode ser utilizado nos EventLists

let colors=[
    {status: 'Nova', select_bg_color: 'bg-white'},
    {status: 'Pendente', select_bg_color: 'bg-info'},
    {status: 'Cancelada', select_bg_color: 'bg-danger'},
    {status: 'Concluida', select_bg_color: 'bg-success'},
    {status: 'Concluída', select_bg_color: 'bg-success'},
]

window.onload = ()=>{
    // Obter o id_usuario armazenado no armazenamento local
    const id_usuario = localStorage.getItem("id_usuario");
    id_user = id_usuario;//para utilizar nos EventList que nao tem acesso a id_usuario
    
    if (id_usuario) {
        // Chamar funções após o login, passando o id_usuario
        get_username(id_usuario);
        get_user_tasks(id_usuario);
    } else {
        // O id_usuario não está disponível, redirecione para a página de login
        const url = window.location.origin + "/Projeto/ToDoList/frontend/index.html";
        window.location.href = url;
    }

    get_username(id_usuario); //como ta sem o login, iniciaremos com o usuario de id 2, criado para teste
    get_user_tasks(id_usuario);
}

//------------------------------------------------------------------------------------------
function get_username(id_usuario){
    fetch(`http://localhost:3000/user/${id_usuario}`)
    .then(response=>{
        if(response.status===200){
            return (response.json());
        }else{
            console.log('erro');
        }
    })
    .then(dados=>{
        if(dados.length === 0){
            console.log("erro!");
        }else{
            document.querySelector("#username").textContent = dados[0].nome;
        }
    })
}

//------------------------------------------------------------------------------------------
function get_user_tasks(id_usuario, status = "Todas"){
    fetch(`http://localhost:3000/user/${id_usuario}/tasks/${status}`)
    .then(response=>{
        if(response.status===200){
            return (response.json());
        }else{
            console.log('erro');
        }
    })
    .then(tarefas=>{
        if(tarefas.length === 0){
            console.log("vazio!");
            document.querySelector("#no_tasks").classList.remove("d-none");//caso exista tarefas remove
            //
        }else{

            document.querySelector("#tasks_container").innerHTML = null;

            tarefas.forEach(tarefa=>{

                let color = colors.find(item => item.status == tarefa.status)

                let html = `
                <div class="col-12 border border-secondary rounded p-3 shadow">
                        <div class="row align-items-center">
                            <div class="col-8">
                                <div class="d-flex align-items-center">
                                    <h5 class="me-3 text-info"><i class="fa-solid fa-circle-chevron-right me-2"></i></h5>
                                    <h5>${tarefa.descricao}</h5>
                                </div>
                        </div>
                        <div class="col-2">
                                <select id="status_${tarefa.id_tarefa}" onchange="change_task_status(${tarefa.id_tarefa})" class="form-select p-2 ${color.select_bg_color}">
                                    <option value="Nova" ${tarefa.status == 'Nova' ? 'selected' : ''}>Nova</option>
                                    <option value="Pendente" ${tarefa.status == 'Pendente' ? 'selected' : ''}>Pendente</option>
                                    <option value="Cancelada"${tarefa.status == 'Cancelada' ? 'selected' : ''}>Cancelada</option>
                                    <option value="Concluida"${tarefa.status == 'Concluida'|| tarefa.status =='Concluída' ? 'selected' : ''}>Concluída</option>
                                </select>
                            </div>
                            <div class="col-1 text-end"><span class="edit_link" onclick="edit_task(${tarefa.id_tarefa})"><i class="fa-regular fa-pen-to-square me-2"></i>Editar</span></div>
                            <div class="col-1 text-end"><span class="delete_link" onclick="delete_task(${tarefa.id_tarefa})"><i class="fa-regular fa-trash-can me-2"></i>Excluir</span></div>
                        </div>
                    </div>
                </div>`;

                //<div class="row mb-3">    .innerHTML = html; iria criar uma pagina html para cada nova tarefa
                //dai criamos uma div nova separada, seguida ao html que se juntara
            let new_task = document.createElement('div');
            new_task.classList.add('row', 'mb-3');

            new_task.innerHTML = html;

            document.querySelector("#tasks_container").appendChild(new_task);
            });

            document.querySelector("#no_tasks").classList.add("d-none");//caso nao exista tarefas add
            document.querySelector("#total_tasks").classList.remove("d-none");
            
        }
    })
    
    fetch(`http://localhost:3000/user/${id_usuario}/tasks/${status}/total_tasks`)
    .then(response=>{
        if(response.status===200){
            return (response.json());
        }else{
            console.log('erro');
        }
    })

    .then(total => {//CODIFICAÇÃO PARA EXIBIR O TOTAL GERAL, E DE CADA STATUS

        if (status === "Todas" && total.length>0) {   
            document.querySelector("#total_tasks > div > p > span").textContent = total.find(item => item.status === null).total_geral;
            document.querySelector(`#total_novas > div > p > span`).textContent = getTotalByStatus(total, 'Nova');
            document.querySelector(`#total_pendentes > div > p > span`).textContent = getTotalByStatus(total, 'Pendente');
            document.querySelector(`#total_canceladas > div > p > span`).textContent = getTotalByStatus(total, 'Cancelada');
            document.querySelector(`#total_concluidas > div > p > span`).textContent = getTotalByStatus(total, 'Concluida');
            document.querySelector("#total_novas").classList.remove("d-none");
            document.querySelector("#total_pendentes").classList.remove("d-none");
            document.querySelector("#total_canceladas").classList.remove("d-none");
            document.querySelector("#total_concluidas").classList.remove("d-none");
        } 
        if (status != "Todas" && total.length>0){
            document.querySelector("#total_tasks > div > p > span").textContent = total[0].total_geral;
            document.querySelector("#total_novas").classList.add("d-none");
            document.querySelector("#total_pendentes").classList.add("d-none");
            document.querySelector("#total_canceladas").classList.add("d-none");
            document.querySelector("#total_concluidas").classList.add("d-none");
        }
    })
}

function getTotalByStatus(total, status) {
    const statusItem = total.find(item => item.status === status);
    return statusItem ? statusItem.total_geral : 0;//Se encontrar o objeto, retorna total_geral de tal status; caso contrário, retorna 0
}
//------------------------------------------------------------------------------------------
function edit_task(id_tarefa){
    const url = window.location.origin + "/Projeto/ToDoList/frontend/editar_tarefa.html?id_tarefa=" + id_tarefa;
    window.location.href = url;
}
//------------------------------------------------------------------------------------------
function delete_task(id_tarefa){
    const url = window.location.origin + "/Projeto/ToDoList/frontend/deletar_tarefa.html?id_tarefa=" + id_tarefa;
    window.location.href = url;
}
//------------------------------------------------------------------------------------------
function change_task_status(id_tarefa){
    let status =document.querySelector("#status_" + id_tarefa).value;

    fetch(`http://localhost:3000/user/tasks/update_status/`,{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({id_tarefa, status})
    })
    .then(response=>{
        if(response.status===200){
            return response.json();
        }
    })

    //atualizar selected color conforme altera o status
    let color_obj = colors.find(e=> e.status==status);
    let select = document.querySelector(`#status_${id_tarefa}`);
    
    let colors_tmp = colors.map(c=>{ return c.select_bg_color})
    select.classList.remove(...colors_tmp); //string das cores, remove a cor que tava selecionada
    select.classList.add(color_obj.select_bg_color);    //add a cor conforme muda o status
    
    //atualiza a pagina deixando as tarefas em ordem - GroupBy
    const url = window.location.origin + "/Projeto/ToDoList/frontend/main.html";
    window.location.href = url;
}

//------------------------------------------------------------------------------------------
document.querySelector("#btn_nova_tarefa").addEventListener('click', ()=>{

    const url = window.location.origin + "/Projeto/ToDoList/frontend/novatarefa.html?id_usuario=" + id_user;
    window.location.href = url;
})

//------------------------------------------------------------------------------------------
document.querySelector("#select_filter").addEventListener('change', ()=>{
    let task_status = document.querySelector("#select_filter").value;
    get_user_tasks(id_user, task_status);
})

//------------------------------------------------------------------------------------------
document.querySelector("#btn_sair").addEventListener('click', () => {
    // Limpa qualquer dado do usuário armazenado localmente
    localStorage.removeItem("id_usuario");
    
    // Redireciona para a tela de login (index.html)
    const url = window.location.origin + "/Projeto/ToDoList/frontend/index.html";
    window.location.href = url;
});


//------------------------------------------------------------------------------------------evento para pegar a tarefa mais recente
function getOldestAndLatestTasks(id_usuario, isMostRecent) {
    fetch(`http://localhost:3000/user/tasks/antiga_recente/${id_usuario}`)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                console.log('Erro ao obter informações sobre tarefas.');
            }
        })
        .then(data => {
            if (data && (data.nome_tarefa_recente || data.tarefa_mais_recente || data.nome_tarefa_antiga || data.tarefa_mais_antiga)) {
                // Formatar as datas
                const formatDate = (dateString) => {
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    return new Date(dateString).toLocaleDateString('pt-BR', options);
                };

                // Exibir as informações formatadas em um alerta
                let message = '';
                if (isMostRecent) {
                    message = `Nome da tarefa mais recente: ${data.nome_tarefa_recente || 'N/A'}\nCriada em: ${formatDate(data.tarefa_mais_recente || 'N/A')}`;
                } else {
                    message = `Nome da tarefa mais antiga: ${data.nome_tarefa_antiga || 'N/A'}\nCriada em: ${formatDate(data.tarefa_mais_antiga || 'N/A')}`;
                }

                alert(message);
            } else {
                alert('Não foram encontradas tarefas.');
            }
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
        });
}

// Adicione isso onde você achar apropriado, como um botão ou seleção
document.querySelector("#btn_tarefa_mais_antiga").addEventListener('click', () => {
    getOldestAndLatestTasks(id_user, false);
});

document.querySelector("#btn_tarefa_mais_recente").addEventListener('click', () => {
    getOldestAndLatestTasks(id_user, true);
});