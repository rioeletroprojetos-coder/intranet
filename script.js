const USERNAME = 'rioeletroprojetos-coder';
const REPO = 'intranet';
const FOLDER = 'treinamento';

const grid = document.getElementById('trainingGrid');
const searchInput = document.getElementById('searchInput');
const loading = document.getElementById('loading');

async function getFiles(path) {
    const response = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${path}`);
    return await response.json();
}

async function loadAllTrainings() {
    try {
        const rootFiles = await getFiles(FOLDER);
        let allTrainings = [];

        for (const file of rootFiles) {
            if (file.type === 'dir') {
                // Se for pasta, busca o index.html dentro dela
                const subFiles = await getFiles(file.path);
                const mainFile = subFiles.find(f => f.name.toLowerCase() === 'index.html' || f.name.toLowerCase().endsWith('.html'));
                if (mainFile) {
                    mainFile.displayName = file.name; // Usa o nome da pasta como título
                    allTrainings.push(mainFile);
                }
            } else if (file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.html')) {
                file.displayName = file.name.split('.')[0]; // Usa o nome do arquivo
                allTrainings.push(file);
            }
        }

        loading.style.display = 'none';
        renderCards(allTrainings);

        // Filtro de busca
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allTrainings.filter(t => t.displayName.toLowerCase().includes(term));
            renderCards(filtered);
        });

    } catch (error) {
        console.error("Erro:", error);
        loading.innerHTML = "Erro ao conectar com o GitHub. Verifique se a pasta 'treinamento' existe.";
    }
}

function renderCards(trainings) {
    grid.innerHTML = '';
    
    trainings.forEach(item => {
        const isPDF = item.name.toLowerCase().endsWith('.pdf');
        // Converte URL do GitHub para URL do Pages
        const finalUrl = `https://${USERNAME}.github.io/${REPO}/${item.path}`;
        const title = item.displayName.replace(/-/g, ' ').replace(/_/g, ' ');

        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 flex flex-col";
        
        // Lógica de Preview
        let previewHtml = '';
        if (isPDF) {
            previewHtml = `
                <div class="h-48 bg-gradient-to-br from-red-500 to-orange-600 flex flex-col items-center justify-center text-white">
                    <i class="fa-solid fa-file-pdf text-6xl mb-2"></i>
                    <span class="text-xs font-bold tracking-widest uppercase">PDF Document</span>
                </div>`;
        } else {
            previewHtml = `
                <div class="h-48 overflow-hidden relative bg-slate-200">
                    <iframe src="${finalUrl}" class="scroll-anim w-full border-0 pointer-events-none scale-90 origin-top"></iframe>
                    <div class="absolute inset-0 bg-transparent"></div> </div>`;
        }

        card.innerHTML = `
            ${previewHtml}
            <div class="p-6 flex flex-col flex-grow">
                <h3 class="text-slate-800 font-bold text-lg capitalize mb-4 line-clamp-2">${title}</h3>
                <div class="mt-auto">
                    <a href="${finalUrl}" target="_blank" 
                       class="w-full inline-block text-center bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-transform active:scale-95 shadow-lg shadow-blue-200">
                       ${isPDF ? 'ABRIR PDF' : 'INICIAR CURSO'}
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

loadAllTrainings();
