// Substitua pelos seus dados do GitHub
const USERNAME = 'SEU_USUARIO_GITHUB';
const REPO = 'intranet';
const FOLDER = 'treinamento';

const grid = document.getElementById('trainingGrid');
const searchInput = document.getElementById('searchInput');
const loading = document.getElementById('loading');

async function fetchTrainings() {
    try {
        const response = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${FOLDER}`);
        const files = await response.json();
        
        loading.style.display = 'none';
        renderCards(files);

        // Lógica de busca
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = files.filter(file => file.name.toLowerCase().includes(term));
            renderCards(filtered);
        });

    } catch (error) {
        console.error("Erro ao carregar arquivos:", error);
        loading.innerHTML = "Erro ao carregar treinamentos. Verifique a pasta 'treinamento'.";
    }
}

function renderCards(files) {
    grid.innerHTML = '';
    
    files.forEach(file => {
        const isPDF = file.name.toLowerCase().endsWith('.pdf');
        const isHTML = file.name.toLowerCase().endsWith('.html') || file.type === 'dir';
        
        // Limpa o nome do arquivo para o título (remove extensão e troca - por espaço)
        const title = file.name.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' ');
        
        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 group";
        
        let previewContent = '';
        
        if (isPDF) {
            // Preview PDF: Usamos um ícone elegante ou imagem genérica (visto que PDF real precisa de lib pesada)
            previewContent = `
                <div class="flex items-center justify-center h-full bg-red-50 text-red-400">
                    <i class="fa-solid fa-file-pdf text-6xl group-hover:scale-110 transition-transform"></i>
                </div>`;
        } else {
            // Preview HTML: Iframe com animação
            previewContent = `
                <div class="preview-window">
                    <iframe src="${file.html_url.replace('github.com', 'github.io').replace('/blob/', '/')}" class="scroll-anim w-full border-0 pointer-events-none"></iframe>
                </div>`;
        }

        card.innerHTML = `
            ${previewContent}
            <div class="p-6">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-[10px] uppercase font-bold px-2 py-1 rounded ${isPDF ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}">
                        ${isPDF ? 'Documento PDF' : 'Módulo Interativo'}
                    </span>
                </div>
                <h3 class="text-slate-800 font-bold text-lg capitalize mb-4 line-clamp-1">${title}</h3>
                <a href="${file.html_url.replace('github.com', 'github.io').replace('/blob/', '/')}" target="_blank" 
                   class="block text-center bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Acessar Treinamento
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}

fetchTrainings();
