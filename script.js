const USERNAME = 'rioeletroprojetos-coder';
const REPO = 'intranet';
const FOLDER = 'treinamento';

// Configuração obrigatória do PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

async function loadAllTrainings() {
    try {
        const response = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${FOLDER}`);
        const items = await response.json();
        
        document.getElementById('loading').style.display = 'none';
        const grid = document.getElementById('trainingGrid');
        const searchInput = document.getElementById('searchInput');
        
        let allItemsData = [];

        for (const item of items) {
            let isPDF = item.name.toLowerCase().endsWith('.pdf');
            let isDir = item.type === 'dir';
            let fileUrl = '';
            let title = '';

            if (isDir) {
                // Se for diretório, assume que o acesso é ao index.html dentro dele
                fileUrl = `https://${USERNAME}.github.io/${REPO}/${item.path}/index.html`;
                title = item.name;
                isPDF = false;
            } else if (isPDF || item.name.toLowerCase().endsWith('.html')) {
                fileUrl = `https://${USERNAME}.github.io/${REPO}/${item.path}`;
                title = item.name.split('.')[0];
            } else {
                continue; // Pula arquivos que não são PDF ou HTML
            }

            const data = { title, fileUrl, isPDF, path: item.path };
            allItemsData.push(data);
        }

        const render = (dataList) => {
            grid.innerHTML = '';
            dataList.forEach(data => {
                const card = createCard(data);
                grid.appendChild(card);
                if (data.isPDF) renderPDFPreview(data.fileUrl, `canvas-${btoa(data.path).substring(0,10)}`);
            });
        };

        // Inicial
        render(allItemsData);

        // Busca em tempo real
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allItemsData.filter(i => i.title.toLowerCase().includes(term));
            render(filtered);
        });

    } catch (e) {
        console.error("Erro na Intranet:", e);
        document.getElementById('loading').innerHTML = "Erro ao carregar arquivos do GitHub.";
    }
}

function createCard(data) {
    const card = document.createElement('div');
    const canvasId = `canvas-${btoa(data.path).substring(0,10)}`;
    card.className = "training-card rounded-2xl overflow-hidden flex flex-col";
    
    card.innerHTML = `
        <div class="card-cover">
            ${data.isPDF ? 
                `<canvas id="${canvasId}" class="pdf-canvas"></canvas>` : 
                `<div class="html-preview-wrapper">
                    <iframe src="${data.fileUrl}" class="html-iframe"></iframe>
                 </div>`
            }
            <div class="cover-overlay"></div>
        </div>
        <div class="p-6 flex flex-col flex-grow">
            <div class="mb-2">
                <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase ${data.isPDF ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}">
                    ${data.isPDF ? 'Documento PDF' : 'Módulo HTML5'}
                </span>
            </div>
            <h3 class="font-bold text-slate-800 text-lg leading-tight mb-6 capitalize">${data.title.replace(/[-_]/g, ' ')}</h3>
            <a href="${data.fileUrl}" target="_blank" class="mt-auto w-full py-3 bg-[#0f172a] text-white text-center rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg">
                Acessar Conteúdo
            </a>
        </div>
    `;
    return card;
}

async function renderPDFPreview(url, canvasId) {
    try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        const page = await pdf.getPage(1);
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 0.6 });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
    } catch (err) {
        console.warn("Preview indisponível para:", url);
    }
}

loadAllTrainings();
