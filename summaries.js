class SummaryManager {
    constructor() {
        this.categories = JSON.parse(localStorage.getItem('categories')) || [];
        this.summaries = JSON.parse(localStorage.getItem('summaries')) || [];
        
        // Elements
        this.categoriesList = document.getElementById('categoriesList');
        this.addCategoryBtn = document.getElementById('addCategory');
        this.summaryEditor = document.querySelector('.summary-editor');
        this.summaryTitle = document.getElementById('summaryTitle');
        this.summaryCategory = document.getElementById('summaryCategory');
        this.summaryInput = document.getElementById('summaryInput');
        this.saveSummaryBtn = document.getElementById('saveSummary');
        this.cancelSummaryBtn = document.getElementById('cancelSummary');
        this.toolbarButtons = document.querySelectorAll('.toolbar-btn');

        // Event Listeners
        this.addCategoryBtn.addEventListener('click', () => this.addCategory());
        this.saveSummaryBtn.addEventListener('click', () => this.saveSummary());
        this.cancelSummaryBtn.addEventListener('click', () => this.hideEditor());
        this.toolbarButtons.forEach(btn => {
            btn.addEventListener('click', () => this.formatText(btn.dataset.format));
        });

        // Initialize
        this.renderCategories();
        this.updateCategorySelect();
    }

    addCategory() {
        const categoryName = prompt('Digite o nome da nova categoria:');
        if (categoryName && categoryName.trim()) {
            const category = {
                id: Date.now().toString(),
                name: categoryName.trim()
            };
            this.categories.push(category);
            this.saveCategories();
            this.renderCategories();
            this.updateCategorySelect();
        }
    }

    editCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
            const newName = prompt('Digite o novo nome da categoria:', category.name);
            if (newName && newName.trim()) {
                category.name = newName.trim();
                this.saveCategories();
                this.renderCategories();
                this.updateCategorySelect();
            }
        }
    }

    deleteCategory(categoryId) {
        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
            this.categories = this.categories.filter(c => c.id !== categoryId);
            this.summaries = this.summaries.filter(s => s.categoryId !== categoryId);
            this.saveCategories();
            this.saveSummaries();
            this.renderCategories();
            this.updateCategorySelect();
        }
    }

    showEditor(categoryId = null) {
        this.summaryEditor.style.display = 'block';
        if (categoryId) {
            this.summaryCategory.value = categoryId;
        }
        this.summaryTitle.focus();
    }

    hideEditor() {
        this.summaryEditor.style.display = 'none';
        this.summaryTitle.value = '';
        this.summaryCategory.value = '';
        this.summaryInput.innerHTML = '';
    }

    saveSummary() {
        const title = this.summaryTitle.value.trim();
        const categoryId = this.summaryCategory.value;
        const content = this.summaryInput.innerHTML;

        if (!title || !categoryId) {
            alert('Por favor, preencha o título e selecione uma categoria.');
            return;
        }

        const summary = {
            id: Date.now().toString(),
            title,
            categoryId,
            content,
            createdAt: new Date().toISOString()
        };

        this.summaries.push(summary);
        this.saveSummaries();
        this.renderCategories();
        this.hideEditor();
    }

    editSummary(summaryId) {
        const summary = this.summaries.find(s => s.id === summaryId);
        if (summary) {
            this.summaryTitle.value = summary.title;
            this.summaryCategory.value = summary.categoryId;
            this.summaryInput.innerHTML = summary.content;
            this.showEditor();
        }
    }

    deleteSummary(summaryId) {
        if (confirm('Tem certeza que deseja excluir este resumo?')) {
            this.summaries = this.summaries.filter(s => s.id !== summaryId);
            this.saveSummaries();
            this.renderCategories();
        }
    }

    formatText(format) {
        document.execCommand(format, false, null);
    }

    renderCategories() {
        this.categoriesList.innerHTML = this.categories.map(category => `
            <div class="category-card">
                <div class="category-header">
                    <span class="category-title">${category.name}</span>
                    <div class="category-actions">
                        <button class="category-btn" onclick="summaryManager.editCategory('${category.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="category-btn" onclick="summaryManager.deleteCategory('${category.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="category-btn" onclick="summaryManager.showEditor('${category.id}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="summary-list">
                    ${this.renderSummariesForCategory(category.id)}
                </div>
            </div>
        `).join('');
    }

    renderSummariesForCategory(categoryId) {
        const categorySummaries = this.summaries
            .filter(s => s.categoryId === categoryId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return categorySummaries.map(summary => `
            <div class="summary-item" onclick="summaryManager.editSummary('${summary.id}')">
                <i class="fas fa-file-alt"></i> ${summary.title}
            </div>
        `).join('');
    }

    updateCategorySelect() {
        this.summaryCategory.innerHTML = `
            <option value="">Selecione uma categoria...</option>
            ${this.categories.map(category => `
                <option value="${category.id}">${category.name}</option>
            `).join('')}
        `;
    }

    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    saveSummaries() {
        localStorage.setItem('summaries', JSON.stringify(this.summaries));
    }
}

// Inicializa o gerenciador de resumos
let summaryManager;
document.addEventListener('DOMContentLoaded', () => {
    summaryManager = new SummaryManager();
});
