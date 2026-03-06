const USERNAME = 'rioeletroprojetos-coder';
const REPO = 'intranet';
const FOLDER = 'treinamento';

// Configuração do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

async function loadAllTrainings() {
    try {
        const response = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${FOLDER}`);
        const files = await response.json();
        
        document.getElementById('loading').style.display = 'none';
        const grid = document.getElementById('trainingGrid');
        grid.innerHTML = '';

        for (const file of files) {
            const isPDF = file.name.toLowerCase().endsWith('.pdf');
            const fileUrl = `https://${USERNAME}.github.io/${REPO}/${file.path}`;
            const title = file.name.split('.')[0].replace(/[-_]/g, ' ');

            const card = document.createElement('div');
            card.className = "training-card rounded-2xl overflow-hidden flex flex-col";
            
            // Criar ID único para o canvas do PDF
            const canvasId = `pdf-canvas-${Math.random().toString(36).substr(2, 9)}`;

            card.innerHTML = `
                <div class="card-cover">
                    ${isPDF ? 
                        `<canvas id="${canvasId}" class="pdf-canvas"></canvas>` : 
                        `<div class="html-preview-container">
                            <iframe src="${fileUrl}" class="html-iframe"></iframe>
                         </div>`
                    }
                    <div class="cover-overlay"></div>
                </div>
                <div class="p-5 flex flex-col flex-grow">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase ${isPDF ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}">
                            ${isPDF ? 'PDF' : 'HTML5'}
                        </span>
                    </div>
                    <h3 class="font-bold text-slate-800 text-lg leading-tight mb-4 capitalize">${title}</h3>
                    <a href="${fileUrl}" target="_blank" class="mt-auto w-full py-3 bg-slate-900 text-white text-center rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                        Acessar Conteúdo
                    </a>
                </div>
            `;

            grid.appendChild(card);

            // Se for PDF, renderiza a primeira página no Canvas
            if (isPDF) {
                renderPDFPreview(fileUrl, canvasId);
            }
        }
    } catch (e) {
        console.error("Erro ao carregar:", e);
    }
}

async function renderPDFPreview(url, canvasId) {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // Pega a página 1
        
        const canvas = document.getElementById(canvasId);
        const context = canvas.getContext('2d');
        
        const viewport = page.getViewport({ scale: 0.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        await page.render(renderContext).promise;
    } catch (err) {
        console.log("Erro ao gerar preview do PDF:", err);
    }
}

loadAllTrainings();
